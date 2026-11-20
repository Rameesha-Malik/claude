<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A gradable content type distinct from the MCQ-based
     * quizzes/tests/exams: the student submits a file and/or written text,
     * an admin reviews it and awards marks + feedback. Opt-in per course
     * (courses.assignments_enabled, added below) same as the existing
     * quizzes_enabled/flashcards_enabled/tests_enabled toggles.
     */
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('course_sections')->nullOnDelete();
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->unsignedInteger('max_marks')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->text('submission_text')->nullable();
            $table->enum('status', ['submitted', 'graded'])->default('submitted');
            $table->unsignedInteger('marks_awarded')->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();

            // One live submission per student per assignment -- resubmitting
            // (before or after grading) overwrites rather than piling up.
            $table->unique(['assignment_id', 'user_id']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->boolean('assignments_enabled')->default(false)->after('tests_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('assignments_enabled');
        });

        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('assignments');
    }
};
