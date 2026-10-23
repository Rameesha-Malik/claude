<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client sent a video of UWorld's own "Create Test" screen: its Subjects
 * (and Systems) filter is multi-select -- "Anatomy | Behavioral science |
 * Biostatistics | Embryology | Genetics | Histolog..." -- not a single
 * dropdown. Custom Quiz only ever let a student pick one subject and one
 * topic. Replaces the single subject_id/topic_id columns with JSON arrays
 * (same pattern question_ids already uses on this table) rather than
 * adding a pivot table -- a handful of ids frozen at creation time, never
 * queried from the other direction, so a pivot would be unused
 * indirection for no benefit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subject_id');
            $table->dropConstrainedForeignId('topic_id');
            $table->json('subject_ids')->nullable()->after('course_id');
            $table->json('topic_ids')->nullable()->after('subject_ids');
        });
    }

    public function down(): void
    {
        Schema::table('custom_quiz_configs', function (Blueprint $table) {
            $table->dropColumn(['subject_ids', 'topic_ids']);
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->after('subject_id')->constrained()->nullOnDelete();
        });
    }
};
