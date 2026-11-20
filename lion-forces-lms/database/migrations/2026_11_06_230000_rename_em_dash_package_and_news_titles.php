<?php

use App\Models\CoursePackage;
use App\Models\NewsAnnouncement;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * One-time rename for a handful of seeded names/titles that used an
     * em-dash ("Name — Detail") and were used as the unique lookup key by
     * their seeder's updateOrCreate(), so simply editing the seeder text
     * would leave any already-seeded environment with the old dashed row
     * untouched (a fresh updateOrCreate on the new text just inserts a
     * second row instead of renaming the first). This renames whatever
     * already exists under the old names; environments that haven't been
     * seeded yet are unaffected since nothing matches.
     */
    public function up(): void
    {
        $packageRenames = [
            'FSc — Notes + App Access' => 'FSc: Notes + App Access',
            'FSc — Crash Course Classes' => 'FSc: Crash Course Classes',
            'FSc — Full Online Classes' => 'FSc: Full Online Classes',
            'Graduate — Notes + App Access' => 'Graduate: Notes + App Access',
            'Graduate — Full Online Classes' => 'Graduate: Full Online Classes',
        ];
        foreach ($packageRenames as $old => $new) {
            CoursePackage::where('name', $old)->update(['name' => $new]);
        }

        $newsRenames = [
            'Lady Cadet Course — Applications Open' => 'Lady Cadet Course: Applications Open',
            'PMA Long Course — Registration Window' => 'PMA Long Course: Registration Window',
        ];
        foreach ($newsRenames as $old => $new) {
            NewsAnnouncement::where('title', $old)->update(['title' => $new]);
        }
    }

    public function down(): void
    {
        // Cosmetic text rename only; not worth reversing.
    }
};
