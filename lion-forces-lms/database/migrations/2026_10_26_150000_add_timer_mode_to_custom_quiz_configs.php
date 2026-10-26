<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: the timer (added in the previous migration as a single
 * always-1-minute-per-question on/off switch) should let a student pick
 * between two genuinely different behaviours -- one countdown for the
 * whole attempt (timer_minutes, student-chosen total), or a fresh
 * countdown per individual question that auto-advances when it runs out
 * (timer_seconds_per_question). timer_mode records which one a config
 * actually used; both duration columns stay nullable since only one of
 * them is ever meaningful for a given config.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->enum('timer_mode', ['total', 'per_question'])->nullable()->after('timer_enabled');
            $table->unsignedInteger('timer_minutes')->nullable()->after('timer_mode');
            $table->unsignedInteger('timer_seconds_per_question')->nullable()->after('timer_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->dropColumn(['timer_mode', 'timer_minutes', 'timer_seconds_per_question']);
        });
    }
};
