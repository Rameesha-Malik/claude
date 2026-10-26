<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One polymorphic attempts table covers practice tests, mock exams, and
     * staged tests — all three are "a student answers a set of questions
     * under some timing/marking rule and gets a result." Staged tests and
     * mock exams additionally need a per-stage / per-section breakdown for
     * their result screens (blueprint override #6: "a result after every
     * stage plus a final combined result"), so each gets its own summary
     * table rather than forcing that shape onto every attempt type.
     */
    public function up(): void
    {
        Schema::create('test_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('attemptable'); // PracticeTest | MockExam | StagedTest
            $table->enum('status', ['in_progress', 'submitted', 'abandoned'])->default('in_progress');
            $table->decimal('score', 8, 2)->nullable();
            $table->decimal('total_marks', 8, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->boolean('passed')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'attemptable_type', 'attemptable_id']);
        });

        Schema::create('test_attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('test_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->boolean('is_correct')->nullable(); // null = skipped
            $table->decimal('marks_awarded', 5, 2)->default(0);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['attempt_id', 'question_id']);
        });

        // Per-stage result for staged tests: score, pass/fail gate that
        // controls unlocking the next stage.
        Schema::create('staged_test_attempt_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('test_attempts')->cascadeOnDelete();
            $table->foreignId('stage_id')->constrained('staged_test_stages')->cascadeOnDelete();
            $table->decimal('score', 8, 2)->default(0);
            $table->decimal('total_marks', 8, 2)->default(0);
            $table->boolean('passed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'stage_id']);
        });

        // Per-section result for mock exams (section-wise scoring, §4.5).
        Schema::create('mock_exam_attempt_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('test_attempts')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('mock_exam_sections')->cascadeOnDelete();
            $table->decimal('score', 8, 2)->default(0);
            $table->decimal('total_marks', 8, 2)->default(0);
            $table->timestamps();

            $table->unique(['attempt_id', 'section_id']);
        });

        // Personal "Revise Later" list — every wrong question, auto-added,
        // feeding auto-generated revision quizzes (blueprint override #4).
        Schema::create('revision_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('times_wrong')->default(1);
            $table->boolean('resolved')->default(false); // answered correctly on a later revision
            $table->timestamp('last_wrong_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'question_id']);
        });

        // Personal Saved Questions library — star/bookmark any MCQ
        // (blueprint override #5).
        Schema::create('saved_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_questions');
        Schema::dropIfExists('revision_list_items');
        Schema::dropIfExists('mock_exam_attempt_sections');
        Schema::dropIfExists('staged_test_attempt_stages');
        Schema::dropIfExists('test_attempt_answers');
        Schema::dropIfExists('test_attempts');
    }
};
