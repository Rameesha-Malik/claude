<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Pages" (admin reference screenshot): simple static CMS pages -- Privacy
 * Policy, Terms & Conditions, etc. Rendered publicly at /pages/{slug}
 * (see PublicSiteController::page).
 *
 * Client: "if any new page add by admin there must be an option to show
 * in footer or nav bar" -- there was no admin screen anywhere to manage
 * header/footer links (nav_items was seeded once and never touched
 * again), so a new Page was only ever reachable by sharing its raw URL.
 * "Show in Header/Footer Menu" below creates/removes the matching
 * NavItem for this page (see syncNavItems()) instead of requiring a
 * separate full navigation-management screen.
 */
class PageController extends Controller
{
    public function index(): Response
    {
        $pages = Page::orderBy('title')->get();

        // One query for every "/pages/..." nav link, instead of one
        // per page -- then just look up by url below.
        $navByUrl = NavItem::where('url', 'like', '/pages/%')
            ->get()
            ->groupBy('url')
            ->map(fn ($items) => $items->pluck('location')->all());

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages->map(fn ($p) => [
                ...$p->toArray(),
                'show_in_header' => in_array('header', $navByUrl->get("/pages/{$p->slug}", [])),
                'show_in_footer' => in_array('footer', $navByUrl->get("/pages/{$p->slug}", [])),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $nav = $this->pullNavFlags($data);

        $slug = Str::slug($data['title']);
        $original = $slug;
        $i = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        $page = Page::create([...$data, 'slug' => $slug, 'is_published' => $data['is_published'] ?? true]);
        $this->syncNavItems($page, $nav);

        return back()->with('success', 'Page created.');
    }

    public function update(Request $request, Page $page)
    {
        $data = $this->validated($request);
        $nav = $this->pullNavFlags($data);

        $page->update($data);
        $this->syncNavItems($page, $nav);

        return back()->with('success', 'Page updated.');
    }

    public function destroy(Page $page)
    {
        NavItem::where('url', "/pages/{$page->slug}")->delete();
        $page->delete();

        return back()->with('success', 'Page deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
            'show_in_header' => 'boolean',
            'show_in_footer' => 'boolean',
        ]);
    }

    private function pullNavFlags(array &$data): array
    {
        $nav = ['header' => $data['show_in_header'] ?? false, 'footer' => $data['show_in_footer'] ?? false];
        unset($data['show_in_header'], $data['show_in_footer']);

        return $nav;
    }

    // Adds/removes exactly the two possible NavItem rows for this page
    // (one per location) to match the checkboxes -- keeps the label in
    // sync with the page title too, since a NavItem for a Page has no
    // reason to ever say something different from the page itself.
    //
    // Footer layout is a fixed 4-column grid (Logo, one column per
    // top-level footer NavItem, Contact) -- every TOP-LEVEL footer entry
    // becomes its own column. A new standalone column per page pushed
    // "Contact" onto its own near-empty row once there were more than 2
    // groups, which is exactly the extra blank space the client flagged.
    // So a footer link goes in UNDER the existing "Resources" group
    // instead of becoming a new column; the header has no such grid
    // constraint (it's a flat link row), so it stays top-level there.
    private function syncNavItems(Page $page, array $nav): void
    {
        $url = "/pages/{$page->slug}";

        $existingHeader = NavItem::where('url', $url)->where('location', 'header')->first();
        if ($nav['header'] && $page->is_published) {
            if ($existingHeader) {
                $existingHeader->update(['label' => $page->title]);
            } else {
                NavItem::create([
                    'label' => $page->title,
                    'url' => $url,
                    'location' => 'header',
                    'order' => NavItem::where('location', 'header')->whereNull('parent_id')->max('order') + 1,
                    'is_visible' => true,
                ]);
            }
        } elseif ($existingHeader) {
            $existingHeader->delete();
        }

        // Also catches a stray top-level footer entry from an earlier
        // version of this feature (which made every page its own column)
        // and folds it into Resources below instead of leaving a
        // duplicate link dangling.
        $existingFooter = NavItem::where('url', $url)->where('location', 'footer')->first();
        if ($nav['footer'] && $page->is_published) {
            $resources = NavItem::firstOrCreate(
                ['label' => 'Resources', 'location' => 'footer', 'parent_id' => null],
                ['url' => '#', 'order' => 1, 'is_visible' => true],
            );

            if ($existingFooter) {
                $existingFooter->update(['label' => $page->title, 'parent_id' => $resources->id]);
            } else {
                NavItem::create([
                    'label' => $page->title,
                    'url' => $url,
                    'location' => 'footer',
                    'parent_id' => $resources->id,
                    'order' => $resources->children()->max('order') + 1,
                    'is_visible' => true,
                ]);
            }
        } elseif ($existingFooter) {
            $existingFooter->delete();
        }
    }
}
