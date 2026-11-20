<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('course_categories')->cascadeOnDelete();
            $table->foreignId('instructor_id')->nullable()->constrained('instructors')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('thumbnail_path')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();       // rich text overview
            $table->longText('syllabus')->nullable();            // rich text syllabus outline
            $table->string('level')->nullable();                 // e.g. Beginner/Advanced
            $table->unsignedInteger('hours')->nullable();
            $table->decimal('base_price', 10, 2)->nullable();    // shown when no packages defined
            $table->enum('status', ['draft', 'published', 'hidden'])->default('draft');

            // Modules Toggle (§3.5) — Lectures + Notes are always included,
            // these three are switched per course.
            $table->boolean('quizzes_enabled')->default(false);
            $table->boolean('flashcards_enabled')->default(false);
            $table->boolean('tests_enabled')->default(false);

            // Test Countdown default target, overridable per-student on
            // the user record.
            $table->string('target_exam_name')->nullable();
            $table->date('target_exam_date')->nullable();

            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['status', 'category_id']);
        });

        // Package options and pricing per course (§2.3, §6.4).
        Schema::create('course_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');                              // e.g. "LCC Guaranteed Package"
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('validity_days')->nullable(); // null = lifetime access
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Lectures: PDF, audio, video (upload or YouTube), document, or link.
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['pdf', 'audio', 'video_upload', 'video_youtube', 'document', 'link']);
            $table->string('file_path')->nullable();
            $table->string('external_url')->nullable();          // YouTube / external link
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_free_preview')->default(false);   // public course-detail sample
            $table->timestamps();
        });

        // Per-student lesson completion + resume position.
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_completed')->default(false);
            $table->unsignedInteger('resume_position_seconds')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('course_packages');
        Schema::dropIfExists('courses');
    }
};
