<?php

use App\Models\NavItem;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Client shared a screenshot of their approved site design -- its header
     * nav goes Home / Demo Quiz / Practice Tests / Courses / Notes /
     * How to Buy / About. Ours only ever seeded Home / Courses / About Us /
     * Contact Us in the header -- Demo Quiz, Practice Tests, Notes and
     * How to Buy pages already exist (routes + public pages), they were
     * just not linked from the main header, only tucked under the footer's
     * "Resources" dropdown. Adding the missing header links and reordering
     * to match, without touching the footer copies (harmless duplication,
     * footer nav is commonly a full site map).
     */
    public function up(): void
    {
        NavItem::updateOrCreate(['label' => 'Home', 'location' => 'header'], ['url' => '/', 'order' => 1, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Demo Quiz', 'location' => 'header'], ['url' => '/demo-quiz', 'order' => 2, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Practice Tests', 'location' => 'header'], ['url' => '/practice-tests', 'order' => 3, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Courses', 'location' => 'header'], ['url' => '/courses', 'order' => 4, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Notes', 'location' => 'header'], ['url' => '/notes', 'order' => 5, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'How to Buy', 'location' => 'header'], ['url' => '/how-to-buy', 'order' => 6, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'About Us', 'location' => 'header'], ['url' => '/about', 'order' => 7, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Contact Us', 'location' => 'header'], ['url' => '/contact', 'order' => 8, 'is_visible' => true]);
    }

    public function down(): void
    {
        NavItem::where('location', 'header')
            ->whereIn('label', ['Demo Quiz', 'Practice Tests', 'Notes', 'How to Buy'])
            ->delete();
    }
};
