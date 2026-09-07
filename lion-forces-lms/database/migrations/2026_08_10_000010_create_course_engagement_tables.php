<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('review_text')->nullable();
            $table->enum('status', ['pending', 'approved', 'hidden'])->default('pending');
            $table->timestamps();

            $table->unique(['course_id', 'user_id']);
        });

        // Course Q&A — private 1:1 per blueprint override #1: the admin
        // replies to that specific student only. A question can be attached
        // to a lecture/note/quiz or asked generally (lesson_id nullable).
        Schema::create('course_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // the asking student
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->text('question_text');
            $table->enum('status', ['unanswered', 'answered'])->default('unanswered');
            $table->timestamps();

            $table->index(['course_id', 'status']);
        });

        Schema::create('course_question_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('course_questions')->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->text('reply_text');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_question_replies');
        Schema::dropIfExists('course_questions');
        Schema::dropIfExists('course_reviews');
    }
};
