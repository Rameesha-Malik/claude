<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Low-stakes, repeatable, subject/topic-wise (§4.4).
        Schema::create('practice_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->boolean('timer_enabled')->default(false);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->enum('question_selection_mode', ['manual', 'auto'])->default('manual');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete(); // for auto mode
            $table->unsignedInteger('auto_question_count')->nullable();
            $table->boolean('shuffle_questions')->default(true);
            $table->decimal('marks_per_question', 5, 2)->default(1);
            $table->decimal('negative_marking', 5, 2)->default(0); // deducted per wrong answer
            $table->boolean('is_repeatable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('practice_test_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('practice_test_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['practice_test_id', 'question_id']);
        });

        // Full-length, exam-pattern-accurate simulations (§4.5). Sections
        // carry their own timing/marking so the real exam's structure
        // (e.g. ISSB's Verbal + Non-verbal + ...) can be replicated exactly.
        Schema::create('mock_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('target_exam_name')->nullable(); // ISSB, PMA, ...
            $table->unsignedInteger('total_duration_minutes')->nullable(); // null = sum of sections
            $table->unsignedInteger('attempt_limit')->nullable(); // null = unlimited
            $table->boolean('fullscreen_required')->default(true);
            $table->boolean('disallow_back_navigation')->default(false);
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('mock_exam_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mock_exam_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Verbal Intelligence"
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->decimal('marks_per_question', 5, 2)->default(1);
            $table->decimal('negative_marking', 5, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('mock_exam_section_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('mock_exam_sections')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['section_id', 'question_id']);
        });

        // Multi-stage tests: pass stage 1 -> unlock stage 2 -> ... with a
        // result shown after every stage plus a final combined result
        // (blueprint override #6). Same shape as mock exam sections, but
        // stages GATE on a pass threshold rather than just being sequential.
        Schema::create('staged_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('target_exam_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('staged_test_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staged_test_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g. "Stage 1: Verbal IQ"
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->decimal('pass_threshold_percent', 5, 2)->default(50);
            $table->decimal('marks_per_question', 5, 2)->default(1);
            $table->decimal('negative_marking', 5, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('staged_test_stage_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('staged_test_stages')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['stage_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staged_test_stage_questions');
        Schema::dropIfExists('staged_test_stages');
        Schema::dropIfExists('staged_tests');
        Schema::dropIfExists('mock_exam_section_questions');
        Schema::dropIfExists('mock_exam_sections');
        Schema::dropIfExists('mock_exams');
        Schema::dropIfExists('practice_test_questions');
        Schema::dropIfExists('practice_tests');
    }
};
