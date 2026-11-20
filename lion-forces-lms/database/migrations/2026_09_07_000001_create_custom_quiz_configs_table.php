<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Custom quiz" (Settings > Features reference screenshot): a student
 * builds and takes an ad-hoc quiz from the question bank (subject +
 * difficulty + count), distinct from the admin-authored Quiz model. This
 * is the thin "what the student picked" record -- the polymorphic
 * `attemptable` parent for TestAttempt, same pattern PracticeTest/
 * MockExam/StagedTest already use, so grading/results/QuestionRunner are
 * all reused as-is rather than duplicated for this new flow.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_quiz_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->nullable();
            $table->unsignedSmallInteger('question_count');
            // The actual randomly-picked question ids, frozen at creation
            // so the same set is shown on every page load/refresh of this
            // one attempt rather than re-rolling.
            $table->json('question_ids');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_quiz_configs');
    }
};
