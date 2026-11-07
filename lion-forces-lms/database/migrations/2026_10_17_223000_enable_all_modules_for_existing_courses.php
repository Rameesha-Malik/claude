<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Client: remove the per-course Quizzes/Flashcards/Tests/Assignments
     * toggles entirely -- "we have now a bit different system" -- every
     * course should just have all four, the same way Lectures and Notes
     * already are always included. CourseController now always creates
     * new courses with all four set true; this one-time backfill does
     * the same for every course that already existed (several of which
     * were stuck at the quizzes_enabled=false column default, which was
     * the exact cause of the "Custom Quiz is Locked" issue surfaced
     * earlier in Admin > Custom Quiz).
     */
    public function up(): void
    {
        DB::table('courses')->update([
            'quizzes_enabled' => true,
            'flashcards_enabled' => true,
            'tests_enabled' => true,
            'assignments_enabled' => true,
        ]);
    }

    public function down(): void
    {
        // Not reversible -- the previous per-course on/off values aren't
        // kept, and there's no longer an admin control to set them back
        // selectively anyway.
    }
};
