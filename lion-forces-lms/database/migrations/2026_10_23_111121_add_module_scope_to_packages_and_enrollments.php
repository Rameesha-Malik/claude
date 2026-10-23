<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: a student should be able to buy the full course, or just one
 * module of it (e.g. only the quiz feature, or only the tests), instead
 * of always paying for full access. "module" on a package is what the
 * admin is selling; "module" on an enrollment is what that specific
 * purchase actually grants -- copied from the package at checkout time
 * (see CheckoutController::store), or 'full' for a package-less direct
 * course purchase and for every pre-existing enrollment (the default
 * below backfills all current rows to 'full', matching how access
 * actually worked before this column existed).
 *
 * "flashcards" isn't one of the module options -- there's no
 * student-facing flashcards feature built yet (only the admin CRUD
 * screen exists), so selling access to it would be selling nothing.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_packages', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests'])->default('full')->after('name');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->enum('module', ['full', 'quiz', 'tests'])->default('full')->after('package_id');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn('module');
        });

        Schema::table('course_packages', function (Blueprint $table) {
            $table->dropColumn('module');
        });
    }
};
