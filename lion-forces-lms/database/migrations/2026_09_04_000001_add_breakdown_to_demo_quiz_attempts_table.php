<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The demo quiz result page only ever showed a score percentage --
     * client feedback asked for a correct/wrong/skipped breakdown like the
     * other test types already have on their result pages. Demo quiz
     * attempts don't persist individual answers (no per-question review is
     * shown, unlike practice tests/quizzes/staged tests/mock exams), so
     * these are just the aggregate counts computed once at submit time.
     */
    public function up(): void
    {
        Schema::table('demo_quiz_attempts', function (Blueprint $table) {
            $table->unsignedInteger('correct_count')->default(0)->after('total_marks');
            $table->unsignedInteger('wrong_count')->default(0)->after('correct_count');
            $table->unsignedInteger('skipped_count')->default(0)->after('wrong_count');
        });
    }

    public function down(): void
    {
        Schema::table('demo_quiz_attempts', function (Blueprint $table) {
            $table->dropColumn(['correct_count', 'wrong_count', 'skipped_count']);
        });
    }
};
