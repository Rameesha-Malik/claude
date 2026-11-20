<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: buying "Quiz Only" for one course was letting a student build a
 * Custom Quiz from the platform-wide question bank (every subject, from
 * every course), not just that course's own questions -- Subject/Topic
 * were never tied to a specific course at all. Client's decision: restrict
 * properly, and make the course tag required going forward (Admin >
 * Content Library) rather than leaving a mix of tagged/untagged questions.
 *
 * Nullable here only because existing rows have no course yet -- the
 * *application* validation on adding/editing a question requires it from
 * here on, but the DB column can't retroactively backfill a course for
 * content nobody tagged. An untagged (legacy) question simply won't show
 * up in any course-scoped Custom Quiz until an admin edits it and picks
 * one -- the client explicitly chose this over leaving untagged questions
 * visible everywhere.
 *
 * custom_quiz_configs also gets course_id so a retake ("Duplicate") stays
 * scoped to the same course it was originally built for -- the config
 * only ever stored subject/topic/difficulty before, nothing that would
 * let a retake remember which course's bank to re-pick from.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_bank', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('topic_id')->constrained()->nullOnDelete();
        });

        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('topic_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_id');
        });

        Schema::table('question_bank', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_id');
        });
    }
};
