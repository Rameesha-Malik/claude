<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Admin audit trail: "who added or edited course content, and when" --
     * e.g. "MCQ added by Ali Khan, Date: 5 March 2026". Logged from the
     * content-management controllers (Course, Section/"Topic",
     * Lesson/"Lecture", Question Bank/"MCQ", Notes Bank), not a generic
     * request logger -- keeps it readable instead of a raw event dump.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // added | edited
            $table->string('subject_type'); // Course | Topic | Lecture | MCQ | Note
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('description');
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['course_id', 'created_at']);
            $table->index(['subject_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
