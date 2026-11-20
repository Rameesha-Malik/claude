<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => CourseCategory::withCount('courses')->orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        CourseCategory::create($data + [
            'slug' => Str::slug($data['name']),
            'order' => CourseCategory::max('order') + 1,
            'is_active' => true,
        ]);

        return back()->with('success', 'Category added.');
    }

    public function update(Request $request, CourseCategory $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $category->update($data);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(CourseCategory $category)
    {
        if ($category->courses()->exists()) {
            return back()->with('error', 'Cannot delete a category that still has courses.');
        }

        $category->delete();

        return back()->with('success', 'Category removed.');
    }
}
