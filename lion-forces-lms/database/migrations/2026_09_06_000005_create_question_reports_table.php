<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Reported questions" (admin reference screenshot): a candidate flags a
 * question as wrong/broken/confusing while attempting it. One shared table
 * for every attempt flow (demo quiz, quizzes, practice tests, mock exams,
 * staged tests) -- they all pull from the same question_bank already, so
 * this doesn't need a per-test-type table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            // Nullable: the demo quiz is a guest flow with no account.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason');
            $table->enum('status', ['pending', 'resolved', 'dismissed'])->default('pending');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_reports');
    }
};
