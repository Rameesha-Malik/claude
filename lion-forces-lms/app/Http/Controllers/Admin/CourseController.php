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
use Illuminate\Validation\Rule;
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
        $tags = $data['tags'] ?? '';
        unset($data['tags']);

        $course = Course::create($data);
        $this->syncTags($course, $tags);

        return redirect()->route('admin.courses.edit', $course)->with('success', 'Course created. Add lessons and packages below.');
    }

    public function edit(Course $course): Response
    {
        $course->load([
            'packages',
            'lessons' => fn ($q) => $q->orderBy('order'),
            'sections' => fn ($q) => $q->orderBy('order')->with(['lessons' => fn ($q2) => $q2->orderBy('order')]),
            'tags',
        ]);

        return Inertia::render('Admin/Courses/Form', [
            'course' => $course,
            'categories' => CourseCategory::orderBy('name')->get(['id', 'name']),
            'instructors' => Instructor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $data = $this->validateCourse($request);
        $tags = $data['tags'] ?? '';
        unset($data['tags']);

        $course->update($data);
        $this->syncTags($course, $tags);

        return back()->with('success', 'Course updated.');
    }

    // Free-text, comma-separated tags -- find-or-create by name so admins
    // can type "Army, Navy, PAF" without ever managing a separate tags
    // screen. Kept deliberately lightweight since tags are a search/filter
    // aid, not a structural feature like Topics.
    private function syncTags(Course $course, string $raw): void
    {
        $names = collect(explode(',', $raw))
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique();

        $ids = $names->map(function ($name) {
            return \App\Models\Tag::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)],
            )->id;
        });

        $course->tags()->sync($ids);
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
            'tags' => 'nullable|string|max:500',
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
    //
    // Two content paths per type: video_youtube/link take a URL only;
    // pdf/audio/video_upload/document take an uploaded file. video_upload
    // is capped at 500MB / MP4-MOV-WEBM — see public/.user.ini for the
    // matching PHP-level upload_max_filesize/post_max_size raise, since
    // Laravel's own validation never runs if PHP rejects the upload first.
    public function storeLesson(Request $request, Course $course)
    {
        $data = collect($request->validate($this->lessonRules($request, required: true, course: $course)))->except('file')->toArray();

        $data['file_path'] = $this->handleLessonFile($request);

        $course->lessons()->create($data + ['order' => $course->lessons()->max('order') + 1]);

        return back()->with('success', 'Lesson added.');
    }

    public function updateLesson(Request $request, Lesson $lesson)
    {
        $data = collect($request->validate($this->lessonRules($request, required: false, course: $lesson->course)))->except('file')->toArray();

        if ($newPath = $this->handleLessonFile($request)) {
            if ($lesson->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($lesson->file_path);
            }
            $data['file_path'] = $newPath;
        }

        $lesson->update($data);

        return back()->with('success', 'Lesson updated.');
    }

    public function destroyLesson(Lesson $lesson)
    {
        if ($lesson->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($lesson->file_path);
        }
        $lesson->delete();

        return back()->with('success', 'Lesson removed.');
    }

    // "Topics" in Tutor LMS terms — a named group lessons can be filed
    // under. Ungrouped (section_id null) lessons still render fine on the
    // student side, so this is additive and doesn't require backfilling
    // existing courses.
    public function storeSection(Request $request, Course $course)
    {
        $data = $request->validate(['title' => 'required|string|max:150']);

        $course->sections()->create($data + ['order' => $course->sections()->max('order') + 1]);

        return back()->with('success', 'Section added.');
    }

    public function updateSection(Request $request, \App\Models\CourseSection $section)
    {
        $section->update($request->validate(['title' => 'required|string|max:150']));

        return back()->with('success', 'Section updated.');
    }

    public function destroySection(\App\Models\CourseSection $section)
    {
        // Lessons in this section aren't deleted -- they fall back to
        // ungrouped (section_id nullOnDelete handles this at the DB level
        // too, but we're explicit here since we're in the same request).
        $section->lessons()->update(['section_id' => null]);
        $section->delete();

        return back()->with('success', 'Section removed. Its lessons are now ungrouped.');
    }

    private function lessonRules(Request $request, bool $required, ?Course $course = null): array
    {
        $urlType = in_array($request->input('type'), ['video_youtube', 'link']);
        $fileRule = $urlType ? 'nullable' : ($required ? 'required' : 'nullable');

        return [
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,audio,video_upload,video_youtube,document,link',
            'external_url' => $urlType ? 'required|string|max:500' : 'nullable|string|max:500',
            'section_id' => [
                'nullable',
                Rule::exists('course_sections', 'id')->where(fn ($q) => $course ? $q->where('course_id', $course->id) : $q),
            ],
            'file' => match ($request->input('type')) {
                'pdf' => "{$fileRule}|file|mimes:pdf|max:20480",
                'audio' => "{$fileRule}|file|mimes:mp3,wav,m4a|max:102400",
                'video_upload' => "{$fileRule}|file|mimes:mp4,mov,webm|max:512000",
                'document' => "{$fileRule}|file|mimes:doc,docx,ppt,pptx,pdf|max:51200",
                default => 'nullable',
            },
            'description' => 'nullable|string|max:1000',
            'is_free_preview' => 'boolean',
        ];
    }

    private function handleLessonFile(Request $request): ?string
    {
        return $request->hasFile('file') ? $request->file('file')->store('lessons', 'public') : null;
    }
}
