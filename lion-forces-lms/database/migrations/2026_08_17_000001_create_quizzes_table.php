<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Graded + tracked, like Practice Tests, but deliberately untimed --
     * that's the one thing distinguishing a "Quiz" from a Practice Test in
     * this app. Attempts reuse the existing polymorphic test_attempts /
     * test_attempt_answers tables (attemptable_type = App\Models\Quiz),
     * same as PracticeTest/MockExam/StagedTest already do -- no new
     * attempts schema needed.
     */
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('question_selection_mode', ['manual', 'auto'])->default('manual');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete(); // for auto mode
            $table->unsignedInteger('auto_question_count')->nullable();
            $table->boolean('shuffle_questions')->default(true);
            $table->decimal('marks_per_question', 5, 2)->default(1);
            $table->decimal('negative_marking', 5, 2)->default(0);
            $table->boolean('is_repeatable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['quiz_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
