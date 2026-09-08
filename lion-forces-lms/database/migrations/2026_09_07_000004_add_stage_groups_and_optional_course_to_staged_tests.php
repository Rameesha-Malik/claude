<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * "Full Test config" (admin reference screenshot, client-specified special
 * requirement): staged tests managed as a standalone top-level page
 * instead of only nested inside a specific course's edit page -- course
 * becomes an optional field on the test rather than a required URL
 * segment -- plus "Stage groups": "Student attempts each stage in a group
 * in order; after the last stage, combined score must meet the passing %
 * to proceed. If no groups are set, each stage is passed individually."
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staged_tests', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
        });
        // Raw SQL rather than Blueprint::change() -- avoids a doctrine/dbal
        // dependency this project doesn't otherwise need just to widen one
        // column to nullable.
        DB::statement('ALTER TABLE staged_tests MODIFY course_id BIGINT UNSIGNED NULL');
        Schema::table('staged_tests', function (Blueprint $table) {
            $table->foreign('course_id')->references('id')->on('courses')->nullOnDelete();
        });

        Schema::create('staged_test_stage_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staged_test_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->decimal('pass_threshold_percent', 5, 2)->default(50);
            $table->timestamps();
        });

        Schema::table('staged_test_stages', function (Blueprint $table) {
            // Ungrouped (null) keeps the existing per-stage individual
            // passing behavior; a stage assigned to a group is instead
            // gated on the group's combined score once every stage in the
            // group is complete (see StagedTestController::submitStage).
            $table->foreignId('stage_group_id')->nullable()->after('staged_test_id')
                ->constrained('staged_test_stage_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('staged_test_stages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('stage_group_id');
        });

        Schema::dropIfExists('staged_test_stage_groups');

        Schema::table('staged_tests', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
        });
        DB::statement('ALTER TABLE staged_tests MODIFY course_id BIGINT UNSIGNED NOT NULL');
        Schema::table('staged_tests', function (Blueprint $table) {
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
        });
    }
};
