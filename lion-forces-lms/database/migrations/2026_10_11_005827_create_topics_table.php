<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Finer than Subject (e.g. Subject "Non-Verbal Intelligence" ->
     * Topics "Series Completion", "Pattern Recognition", "Mirror Images")
     * -- client wants Custom Quiz to filter at this level, not just by
     * Subject. Always scoped to exactly one subject, same pattern as
     * CourseSection scoping to one Course.
     */
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['subject_id', 'name']);
        });

        Schema::table('question_bank', function (Blueprint $table) {
            $table->foreignId('topic_id')->nullable()->after('subject_id')->constrained('topics')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('question_bank', function (Blueprint $table) {
            $table->dropConstrainedForeignId('topic_id');
        });

        Schema::dropIfExists('topics');
    }
};
