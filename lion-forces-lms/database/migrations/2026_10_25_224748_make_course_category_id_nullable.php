<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client: Category should be optional when creating a course ("if nothing
 * select, then okay") -- it was a required dropdown in both the admin form
 * and this column itself. The frontend already treats a course without a
 * category defensively everywhere it's shown (course.category && ...), so
 * only the column and the admin validation needed to actually allow it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Any course left without a category would violate the NOT NULL
        // constraint on rollback -- bail loudly instead of silently
        // deleting/mis-assigning those courses' category.
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable(false)->change();
        });
    }
};
