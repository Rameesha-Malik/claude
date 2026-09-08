<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Auto-generated from notes/lecture text, admin approves before
        // publishing (blueprint override #3). source_note_id/source_lesson_id
        // record provenance for the auto-generated ones; both null means a
        // custom card the admin wrote directly.
        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_note_id')->nullable()->constrained('notes_bank')->nullOnDelete();
            $table->foreignId('source_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->text('front_text'); // question / prompt
            $table->text('back_text');  // answer
            $table->boolean('is_auto_generated')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
