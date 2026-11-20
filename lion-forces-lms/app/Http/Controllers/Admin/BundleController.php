<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BundleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Bundles/Index', [
            'bundles' => Bundle::withCount(['courses', 'purchases'])->orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Bundles/Form', [
            'courses' => Course::where('status', 'published')->orderBy('title')->get(['id', 'title', 'base_price']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateBundle($request);
        $courseIds = $data['course_ids'];
        unset($data['course_ids'], $data['thumbnail']);

        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['thumbnail_path'] = $request->hasFile('thumbnail') ? $request->file('thumbnail')->store('bundles', 'public') : null;

        $bundle = Bundle::create($data);
        $bundle->courses()->sync($courseIds);

        return redirect()->route('admin.bundles.index')->with('success', 'Bundle created.');
    }

    public function edit(Bundle $bundle): Response
    {
        $bundle->load('courses:id');

        return Inertia::render('Admin/Bundles/Form', [
            'bundle' => $bundle,
            'courses' => Course::where('status', 'published')->orderBy('title')->get(['id', 'title', 'base_price']),
        ]);
    }

    public function update(Request $request, Bundle $bundle)
    {
        $data = $this->validateBundle($request);
        $courseIds = $data['course_ids'];
        unset($data['course_ids'], $data['thumbnail']);

        if ($request->hasFile('thumbnail')) {
            if ($bundle->thumbnail_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($bundle->thumbnail_path);
            }
            $data['thumbnail_path'] = $request->file('thumbnail')->store('bundles', 'public');
        }

        $bundle->update($data);
        $bundle->courses()->sync($courseIds);

        return back()->with('success', 'Bundle updated.');
    }

    public function destroy(Bundle $bundle)
    {
        if ($bundle->thumbnail_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($bundle->thumbnail_path);
        }
        $bundle->delete();

        return redirect()->route('admin.bundles.index')->with('success', 'Bundle removed.');
    }

    private function validateBundle(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable|image|max:2048',
            'course_ids' => 'required|array|min:2',
            'course_ids.*' => 'exists:courses,id',
        ]);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (Bundle::where('slug', $slug)->exists()) {
            $slug = "{$base}-".++$i;
        }

        return $slug;
    }
}
