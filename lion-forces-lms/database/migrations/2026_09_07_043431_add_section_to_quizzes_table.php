<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client: "quiz topic - click - quiz" -- a quiz should be reachable
     * from inside the Topic/Lesson structure a student is already
     * browsing (Curriculum panel), not only via the separate Quizzes tab.
     * Nullable, optional assignment -- doesn't change how an
     * unassigned quiz behaves (still only in the Quizzes tab).
     */
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('course_id')->constrained('course_sections')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });
    }
};
