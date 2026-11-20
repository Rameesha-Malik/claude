<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The architectural core of the whole system (SRS §8.4 / blueprint §5):
     * questions and notes are created ONCE here, then assigned into any
     * number of courses' practice tests / mock exams / staged tests / notes
     * sections. An edit here reflects everywhere it's assigned.
     */
    public function up(): void
    {
        Schema::create('question_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('course_categories')->nullOnDelete();
            $table->text('question_text');
            $table->string('image_path')->nullable();
            $table->text('explanation')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['subject_id', 'category_id', 'difficulty']);
        });

        // Normalized options rather than a fixed 4-column layout, so a
        // question isn't forced into exactly 4 choices.
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('notes_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('title');
            $table->longText('content')->nullable();   // rich text
            $table->string('file_path')->nullable();   // optional PDF attachment
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('subject_id');
        });

        // Shared Course Notes: a Notes Bank item assigned into a course,
        // visible to every enrolled student (§3.5 "Guaranteed Notes" tab).
        Schema::create('course_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('note_id')->constrained('notes_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['course_id', 'note_id']);
        });

        // Two-tier notes, tier 2: a Notes Bank item assigned to a SPECIFIC
        // student or a SPECIFIC package only (e.g. "LCC Guaranteed Notes"
        // visible only to LCC Guaranteed Package students). Polymorphic so
        // one table covers both targeting modes.
        Schema::create('note_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes_bank')->cascadeOnDelete();
            $table->morphs('assignable'); // App\Models\User or App\Models\CoursePackage
            $table->timestamps();

            $table->unique(['note_id', 'assignable_type', 'assignable_id'], 'note_assignment_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_assignments');
        Schema::dropIfExists('course_notes');
        Schema::dropIfExists('notes_bank');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('question_bank');
    }
};
