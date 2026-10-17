<?php

use App\Models\NavItem;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * One-time data fix. An earlier version of the Page "Show in Footer
     * Menu" feature made every checked page its own top-level NavItem --
     * its own footer column, rendered with the fallback heading "Quick
     * Links" since it had no children of its own. With the footer's
     * fixed 4-column grid (Logo, Resources, Legal, +1), a single extra
     * page column overflowed it and wrapped "Contact" onto its own
     * mostly-empty row -- the "too spacy" footer the client saw live.
     * PageController::syncNavItems() now nests a page's footer link
     * under "Resources" instead, but that only takes effect the next
     * time that specific page is saved -- this folds in whatever such
     * stray top-level entries already exist so it's fixed immediately on
     * deploy, without the admin having to re-open and re-save each page.
     */
    public function up(): void
    {
        $resources = null;

        NavItem::where('location', 'footer')
            ->whereNull('parent_id')
            ->where('url', 'like', '/pages/%')
            ->get()
            ->each(function (NavItem $stray) use (&$resources) {
                $resources ??= NavItem::firstOrCreate(
                    ['label' => 'Resources', 'location' => 'footer', 'parent_id' => null],
                    ['url' => '#', 'order' => 1, 'is_visible' => true],
                );

                $stray->update(['parent_id' => $resources->id, 'order' => $resources->children()->max('order') + 1]);
            });
    }

    public function down(): void
    {
        // Not reversible -- the previous top-level order values aren't
        // kept, and reversing would just reintroduce the layout bug.
    }
};
