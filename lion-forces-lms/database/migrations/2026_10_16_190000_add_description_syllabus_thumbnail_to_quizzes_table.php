<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client: a Quiz should have an intro, a thumbnail, and a syllabus,
     * the same way a Course does -- shown to the student before they
     * start, not just a bare title + "Start Quiz".
     */
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->text('syllabus')->nullable()->after('description');
            $table->string('thumbnail_path')->nullable()->after('syllabus');
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['description', 'syllabus', 'thumbnail_path']);
        });
    }
};
