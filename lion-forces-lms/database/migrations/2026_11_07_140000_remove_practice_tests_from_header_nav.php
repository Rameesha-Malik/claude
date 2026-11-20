<?php

use App\Models\NavItem;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Client: "we don't need Practice Test tab in nav bar" -- only the
     * header entry, not the /practice-tests page itself or its footer
     * link under Resources (added separately in SiteContentSeeder, left
     * untouched here).
     */
    public function up(): void
    {
        NavItem::where('location', 'header')->where('label', 'Practice Tests')->delete();
    }

    public function down(): void
    {
        NavItem::updateOrCreate(['label' => 'Practice Tests', 'location' => 'header'], ['url' => '/practice-tests', 'order' => 3, 'is_visible' => true]);
    }
};
