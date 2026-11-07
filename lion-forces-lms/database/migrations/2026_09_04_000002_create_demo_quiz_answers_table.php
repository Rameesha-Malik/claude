<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Demo quiz attempts previously only ever stored the aggregate score --
     * client feedback asked to be able to review which specific questions
     * were right/wrong afterward, same as practice tests/quizzes/staged
     * tests/mock exams already let you do via test_attempt_answers. This is
     * that same per-question answer row, just for the separate (guest,
     * no-login) demo quiz attempt flow rather than the polymorphic
     * test_attempts table those four share.
     */
    public function up(): void
    {
        Schema::create('demo_quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_quiz_attempt_id')->constrained('demo_quiz_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->boolean('is_correct')->nullable(); // null = skipped
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['demo_quiz_attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_quiz_answers');
    }
};
