<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Public, no-login, timed MCQ demo (§2.8). Deliberately separate from
     * practice_tests: it has no course/enrollment tie and must support
     * guest attempts, so overloading practice_tests' semantics would leak
     * "requires enrollment" assumptions into a page that must not have any.
     */
    public function up(): void
    {
        Schema::create('demo_quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedInteger('duration_minutes')->default(15);
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('demo_quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['demo_quiz_id', 'question_id']);
        });

        Schema::create('demo_quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_quiz_id')->constrained()->cascadeOnDelete();
            $table->string('guest_token'); // client-generated id, no login required
            $table->decimal('score', 6, 2)->default(0);
            $table->decimal('total_marks', 6, 2)->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index('guest_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_quiz_attempts');
        Schema::dropIfExists('demo_quiz_questions');
        Schema::dropIfExists('demo_quizzes');
    }
};
