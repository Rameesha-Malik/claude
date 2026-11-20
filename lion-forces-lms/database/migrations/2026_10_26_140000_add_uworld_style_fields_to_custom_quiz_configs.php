<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client sent screenshots of UWorld's own "Create Test" screen as a
 * reference for how Custom Quiz should work. Five additions approved
 * against it: a custom Name, a Mode (Tutor -- instant feedback after each
 * question, today's only behaviour -- vs Timed -- no feedback at all
 * until the whole attempt is submitted, true exam simulation), an
 * optional Timer (today's always-on 1-min-per-question timer becomes
 * opt-in, matching the reference's Timer: None/duration dropdown), and a
 * history-based question Filter (Unused / Previously Wrong / Previously
 * Correct / Favorited) reusing data this app already tracks
 * (RevisionListItem, SavedQuestion, TestAttemptAnswer) rather than
 * building a new tracking table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->string('name')->nullable()->after('user_id');
            $table->enum('mode', ['tutor', 'timed'])->default('tutor')->after('question_ids');
            $table->boolean('timer_enabled')->default(false)->after('mode');
            $table->enum('filter', ['unused', 'wrong', 'correct', 'favorited'])->nullable()->after('timer_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->dropColumn(['name', 'mode', 'timer_enabled', 'filter']);
        });
    }
};
