<?php

use App\Models\NavItem;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Client: "i dont think so notes should be in nav bar" -- only the
     * header entry, not the /notes page itself or its footer link under
     * Resources (added separately in SiteContentSeeder, left untouched
     * here). Same pattern as the Practice Tests header-nav removal.
     */
    public function up(): void
    {
        NavItem::where('location', 'header')->where('label', 'Notes')->delete();
    }

    public function down(): void
    {
        NavItem::updateOrCreate(['label' => 'Notes', 'location' => 'header'], ['url' => '/notes', 'order' => 5, 'is_visible' => true]);
    }
};
