<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client: "Flashcards should be categorized." Reuses Subject -- the
     * same category concept question_bank already uses -- rather than
     * inventing a parallel one. Nullable: an uncategorized card just
     * shows under "General" on the student side.
     */
    public function up(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('course_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subject_id');
        });
    }
};
