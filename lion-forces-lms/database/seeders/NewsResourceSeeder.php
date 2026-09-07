<?php

namespace Database\Seeders;

use App\Models\CourseCategory;
use App\Models\NewsAnnouncement;
use App\Models\Resource;
use Illuminate\Database\Seeder;

class NewsResourceSeeder extends Seeder
{
    /**
     * All PLACEHOLDER — the client has not yet supplied real announcements
     * or resource files. These exist so /news and /resources are
     * demoable; replace via Admin -> News / Admin -> Resources.
     */
    public function run(): void
    {
        $lcc = CourseCategory::where('slug', 'lcc')->first();
        $pma = CourseCategory::where('slug', 'pma')->first();
        $issb = CourseCategory::where('slug', 'issb')->first();

        NewsAnnouncement::updateOrCreate(['title' => 'Lady Cadet Course — Applications Open'], [
            'description' => 'LCC applications are now open. Apply before the deadline to secure your seat.',
            'organization' => 'LCC',
            'category_id' => $lcc?->id,
            'deadline_date' => now()->addDays(18),
            'is_pinned' => true,
            'is_active' => true,
        ]);

        NewsAnnouncement::updateOrCreate(['title' => 'PMA Long Course — Registration Window'], [
            'description' => 'Pakistan Military Academy Long Course registration is open for eligible candidates.',
            'organization' => 'PMA',
            'category_id' => $pma?->id,
            'deadline_date' => now()->addDays(30),
            'is_pinned' => false,
            'is_active' => true,
        ]);

        NewsAnnouncement::updateOrCreate(['title' => 'ISSB Test Batch Announced'], [
            'description' => 'A new ISSB preparation batch starts soon — limited seats available.',
            'organization' => 'ISSB',
            'category_id' => $issb?->id,
            'deadline_date' => now()->addDays(10),
            'is_pinned' => false,
            'is_active' => true,
        ]);

        Resource::updateOrCreate(['title' => 'PMA Syllabus Overview'], [
            'category' => 'Syllabus',
            'description' => 'Official PMA test pattern and subject breakdown.',
        ]);

        Resource::updateOrCreate(['title' => 'ISSB Preparation Guide'], [
            'category' => 'Guide',
            'description' => 'A general overview of the ISSB testing process and what to expect.',
        ]);

        Resource::updateOrCreate(['title' => 'Physical Fitness Standards'], [
            'category' => 'Fitness',
            'description' => 'Reference standards for the 1.6km run, push-ups, and sit-ups.',
        ]);
    }
}
