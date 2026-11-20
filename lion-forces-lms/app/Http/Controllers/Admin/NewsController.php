<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use App\Models\NewsAnnouncement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $announcements = NewsAnnouncement::with('category')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2->where('title', 'like', "%{$s}%")->orWhere('organization', 'like', "%{$s}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/News/Index', [
            'announcements' => $announcements,
            'categories' => CourseCategory::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'organization' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:course_categories,id',
            'deadline_date' => 'nullable|date',
            'application_link' => 'nullable|url|max:500',
            'image' => 'nullable|image|max:2048',
            'is_pinned' => 'boolean',
        ]);

        unset($data['image']);
        $data['image_path'] = $request->hasFile('image') ? $request->file('image')->store('news', 'public') : null;

        NewsAnnouncement::create($data + ['is_active' => true]);

        return back()->with('success', 'Announcement added.');
    }

    public function update(Request $request, NewsAnnouncement $news)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'organization' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:course_categories,id',
            'deadline_date' => 'nullable|date',
            'application_link' => 'nullable|url|max:500',
            'image' => 'nullable|image|max:2048',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
        ]);

        unset($data['image']);
        if ($request->hasFile('image')) {
            if ($news->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($news->image_path);
            }
            $data['image_path'] = $request->file('image')->store('news', 'public');
        }

        $news->update($data);

        return back()->with('success', 'Announcement updated.');
    }

    public function destroy(NewsAnnouncement $news)
    {
        if ($news->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($news->image_path);
        }
        $news->delete();

        return back()->with('success', 'Announcement removed.');
    }
}
