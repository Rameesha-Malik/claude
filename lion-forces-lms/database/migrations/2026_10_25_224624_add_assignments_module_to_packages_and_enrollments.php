<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: Assignments should be buyable on its own, same as Quiz Only /
 * Tests Only already are (see 2026_10_23_111121_add_module_scope_to_
 * packages_and_enrollments.php) -- a 4th module value, no new mechanism
 * needed since Enrollment::grantsModule() is already generic over
 * whatever module name it's given.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_packages', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests', 'assignments'])->default('full')->change();
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests', 'assignments'])->default('full')->change();
        });
    }

    public function down(): void
    {
        Schema::table('course_packages', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests'])->default('full')->change();
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests'])->default('full')->change();
        });
    }
};
