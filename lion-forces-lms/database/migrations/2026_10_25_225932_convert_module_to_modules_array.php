<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Client: a package should be able to grant any COMBINATION of modules
 * (e.g. Quiz + Assignments, Lectures only, Quiz + Tests), not just one
 * single module or literally everything -- the single `module` enum
 * column (full|quiz|tests|assignments) can't express that, so it becomes
 * a `modules` JSON array instead. "Lectures" also becomes a real,
 * independently-grantable module for the first time here -- it used to be
 * hardcoded as "included only with 'full'" (see the now-removed
 * Student\CourseController check `$module === 'full'`).
 *
 * `full` -> all four modules; every other single value -> a one-item
 * array. Existing packages/enrollments keep exactly the access they had
 * before this migration -- nothing changes for a current student.
 */
return new class extends Migration
{
    private const ALL = ['lectures', 'quiz', 'tests', 'assignments'];

    public function up(): void
    {
        Schema::table('course_packages', function (Blueprint $table) {
            $table->json('modules')->nullable()->after('module');
        });
        Schema::table('enrollments', function (Blueprint $table) {
            $table->json('modules')->nullable()->after('module');
        });

        $this->backfillUp('course_packages');
        $this->backfillUp('enrollments');

        Schema::table('course_packages', function (Blueprint $table) {
            $table->json('modules')->nullable(false)->change();
            $table->dropColumn('module');
        });
        Schema::table('enrollments', function (Blueprint $table) {
            $table->json('modules')->nullable(false)->change();
            $table->dropColumn('module');
        });
    }

    public function down(): void
    {
        Schema::table('course_packages', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests', 'assignments'])->default('full')->after('modules');
        });
        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests', 'assignments'])->default('full')->after('modules');
        });

        $this->backfillDown('course_packages');
        $this->backfillDown('enrollments');

        Schema::table('course_packages', function (Blueprint $table) {
            $table->dropColumn('modules');
        });
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn('modules');
        });
    }

    private function backfillUp(string $table): void
    {
        DB::table($table)->select('id', 'module')->orderBy('id')->chunkById(200, function ($rows) use ($table) {
            foreach ($rows as $row) {
                $modules = $row->module === 'full' ? self::ALL : [$row->module];
                DB::table($table)->where('id', $row->id)->update(['modules' => json_encode($modules)]);
            }
        });
    }

    // Best-effort on rollback: a combo that isn't a plain single module or
    // exactly all four (e.g. ["quiz","tests"]) has no equivalent in the old
    // enum, so it collapses to 'full' -- safer to over-grant on a rollback
    // than to silently lock a student out of something they paid for.
    private function backfillDown(string $table): void
    {
        DB::table($table)->select('id', 'modules')->orderBy('id')->chunkById(200, function ($rows) use ($table) {
            foreach ($rows as $row) {
                $modules = json_decode($row->modules ?? '[]', true) ?: [];
                $module = count($modules) === 1 ? $modules[0] : 'full';
                DB::table($table)->where('id', $row->id)->update(['module' => $module]);
            }
        });
    }
};
