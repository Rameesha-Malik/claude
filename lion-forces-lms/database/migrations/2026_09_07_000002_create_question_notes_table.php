<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Student MCQ notes" (admin reference screenshot: "Admin can review
 * personal notes created by students per MCQ"). A private, free-text
 * annotation a student writes on a question -- distinct from Favourite
 * (starring, no text) and Report (flagging a problem, not personal
 * study notes). One row per (user, question): writing again replaces
 * the note rather than piling up a history.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->text('note_text');
            $table->timestamps();

            $table->unique(['user_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_notes');
    }
};
