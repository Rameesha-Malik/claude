<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CoursePackage;
use App\Models\Instructor;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = Course::with('category')
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Form', [
            'categories' => CourseCategory::orderBy('name')->get(['id', 'name']),
            'instructors' => Instructor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateCourse($request);
        $data['slug'] = $this->uniqueSlug($data['title']);

        $course = Course::create($data);

        return redirect()->route('admin.courses.edit', $course)->with('success', 'Course created. Add lessons and packages below.');
    }

    public function edit(Course $course): Response
    {
        $course->load(['packages', 'lessons' => fn ($q) => $q->orderBy('order')]);

        return Inertia::render('Admin/Courses/Form', [
            'course' => $course,
            'categories' => CourseCategory::orderBy('name')->get(['id', 'name']),
            'instructors' => Instructor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $course->update($this->validateCourse($request));

        return back()->with('success', 'Course updated.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course removed.');
    }

    private function validateCourse(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:course_categories,id',
            'instructor_id' => 'nullable|exists:instructors,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'syllabus' => 'nullable|string',
            'level' => 'nullable|string|max:100',
            'hours' => 'nullable|integer|min:0',
            'base_price' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,hidden',
            'quizzes_enabled' => 'boolean',
            'flashcards_enabled' => 'boolean',
            'tests_enabled' => 'boolean',
            'target_exam_name' => 'nullable|string|max:100',
            'target_exam_date' => 'nullable|date',
        ]);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = "{$base}-".++$i;
        }

        return $slug;
    }

    // --- Packages ---
    public function storePackage(Request $request, Course $course)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'validity_days' => 'nullable|integer|min:1',
        ]);

        $course->packages()->create($data + ['order' => $course->packages()->max('order') + 1, 'is_active' => true]);

        return back()->with('success', 'Package added.');
    }

    public function updatePackage(Request $request, CoursePackage $package)
    {
        $package->update($request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'validity_days' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]));

        return back()->with('success', 'Package updated.');
    }

    public function destroyPackage(CoursePackage $package)
    {
        $package->delete();

        return back()->with('success', 'Package removed.');
    }

    // --- Lessons ---
    public function storeLesson(Request $request, Course $course)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,audio,video_upload,video_youtube,document,link',
            'external_url' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'is_free_preview' => 'boolean',
        ]);

        $course->lessons()->create($data + ['order' => $course->lessons()->max('order') + 1]);

        return back()->with('success', 'Lesson added.');
    }

    public function updateLesson(Request $request, Lesson $lesson)
    {
        $lesson->update($request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,audio,video_upload,video_youtube,document,link',
            'external_url' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
            'is_free_preview' => 'boolean',
        ]));

        return back()->with('success', 'Lesson updated.');
    }

    public function destroyLesson(Lesson $lesson)
    {
        $lesson->delete();

        return back()->with('success', 'Lesson removed.');
    }
}
