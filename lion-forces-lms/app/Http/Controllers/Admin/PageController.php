<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Pages" (admin reference screenshot): simple static CMS pages -- Privacy
 * Policy, Terms & Conditions, etc. Rendered publicly at /pages/{slug}
 * (see PublicSiteController::page).
 */
class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Pages/Index', [
            'pages' => Page::orderBy('title')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $slug = Str::slug($data['title']);
        $original = $slug;
        $i = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        Page::create([...$data, 'slug' => $slug, 'is_published' => $data['is_published'] ?? true]);

        return back()->with('success', 'Page created.');
    }

    public function update(Request $request, Page $page)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $page->update($data);

        return back()->with('success', 'Page updated.');
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return back()->with('success', 'Page deleted.');
    }
}
