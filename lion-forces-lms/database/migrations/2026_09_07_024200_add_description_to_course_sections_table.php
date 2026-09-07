<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client feedback: "Add Topic (Topic Name, Description)" -- a topic
     * previously had only a title.
     */
    public function up(): void
    {
        Schema::table('course_sections', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('course_sections', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
