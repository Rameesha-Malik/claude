<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Faq;
use App\Models\HomeSection;
use App\Models\Instructor;
use App\Models\NewsAnnouncement;
use App\Models\ServiceCard;
use App\Models\StatsItem;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        $sections = HomeSection::where('is_enabled', true)->orderBy('order')->get()
            ->keyBy('section_key')
            ->map(fn ($s) => ['title' => $s->title, 'content' => $s->content]);

        return Inertia::render('Public/Home', [
            'sections' => $sections,
            'stats' => StatsItem::orderBy('order')->get(['icon', 'number', 'label']),
            'services' => ServiceCard::orderBy('order')->get(['icon', 'title', 'description']),
            'featuredCourses' => Course::with(['category', 'sharedNotes:id,subject_id'])
                ->withCount(['enrollments' => fn ($q) => $q->where('status', 'active')])
                ->where('status', 'published')
                ->orderBy('order')
                ->limit(4)
                ->get(['id', 'title', 'slug', 'short_description', 'thumbnail_path', 'base_price', 'category_id', 'hours', 'level'])
                ->map(fn ($course) => $this->appendTopicsCount($course)),
            'faqs' => Faq::where('page', 'home')->where('is_active', true)->orderBy('order')->get(['question', 'answer']),
            'testimonials' => Testimonial::orderBy('order')->get(['student_name', 'photo_path', 'testimonial_text', 'rating']),
            'latestNews' => NewsAnnouncement::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('deadline_date')->orWhere('deadline_date', '>=', now()))
                ->orderByDesc('is_pinned')->orderByDesc('created_at')
                ->limit(3)
                ->get(['id', 'title', 'description', 'organization', 'deadline_date', 'created_at']),
        ]);
    }

    public function courses(Request $request): Response
    {
        $courses = Course::with(['category', 'instructor:id,name', 'sharedNotes:id,subject_id', 'tags:id,name'])
            ->withCount(['lessons', 'enrollments' => fn ($q) => $q->where('status', 'active')])
            ->where('status', 'published')
            ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($q) => $q->where('slug', $cat)))
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->tag, fn ($q, $tag) => $q->whereHas('tags', fn ($q) => $q->where('name', $tag)))
            ->orderBy('order')
            ->paginate(12)
            ->withQueryString();

        $courses->getCollection()->transform(fn ($course) => $this->appendTopicsCount($course));

        return Inertia::render('Public/Courses', [
            'courses' => $courses,
            'categories' => \App\Models\CourseCategory::where('is_active', true)->orderBy('order')->get(['name', 'slug']),
            'tags' => \App\Models\Tag::orderBy('name')->get(['name']),
            'filters' => $request->only(['category', 'search', 'tag']),
        ]);
    }

    // "Topics" isn't its own column anywhere -- the closest real concept in
    // the schema is the number of distinct Subjects covered by a course's
    // shared Notes Bank items, so that's what's surfaced on course cards
    // rather than a fabricated number.
    private function appendTopicsCount(Course $course): Course
    {
        $course->topics_count = $course->sharedNotes->pluck('subject_id')->filter()->unique()->count();
        unset($course->sharedNotes);

        return $course;
    }

    public function courseDetail(Course $course): Response
    {
        $course->load(['category', 'instructor', 'packages' => fn ($q) => $q->where('is_active', true), 'approvedReviews.user', 'lessons' => fn ($q) => $q->where('is_free_preview', true), 'tags:id,name']);

        return Inertia::render('Public/CourseDetail', ['course' => $course]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'instructors' => Instructor::where('is_active', true)->orderBy('order')->get(['name', 'photo_path', 'qualification', 'experience', 'bio']),
            'section' => HomeSection::where('section_key', 'why_choose_us')->first(['title', 'content']),
            'stats' => StatsItem::orderBy('order')->get(['icon', 'number', 'label']),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Public/Contact', [
            'faqs' => Faq::where('page', 'contact')->where('is_active', true)->orderBy('order')->get(['question', 'answer']),
        ]);
    }

    public function submitContact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        \App\Models\ContactSubmission::create($data);

        \App\Models\User::notifyAdmins(
            'New contact inquiry',
            "{$data['name']} sent a message".($data['subject'] ? ": {$data['subject']}" : '.'),
            '/admin/contact-inbox',
        );

        return back()->with('success', 'Your message has been sent. We typically reply within a day.');
    }

    public function news(): Response
    {
        return Inertia::render('Public/News', [
            'announcements' => NewsAnnouncement::with('category')
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('deadline_date')->orWhere('deadline_date', '>=', now()))
                ->orderByDesc('is_pinned')->orderByDesc('created_at')
                ->paginate(9),
        ]);
    }

    public function resources(): Response
    {
        return Inertia::render('Public/Resources', [
            'resources' => \App\Models\Resource::where('is_published', true)->orderByDesc('created_at')->paginate(12),
        ]);
    }

    public function howToBuy(): Response
    {
        $hero = \App\Models\HomeSection::where('section_key', 'how_to_buy_hero')->first();

        return Inertia::render('Public/HowToBuy', [
            'hero' => [
                'headline' => $hero?->content['headline'] ?? 'How to Buy',
                'subheading' => $hero?->content['subheading'] ?? 'Simple steps from registration to your first lesson.',
            ],
            'packages' => \App\Models\CoursePackage::with('course:id,title')
                ->where('is_active', true)
                ->orderBy('price')
                ->limit(12)
                ->get(['id', 'course_id', 'name', 'description', 'price', 'validity_days']),
            'paymentMethods' => \App\Models\PaymentMethod::orderBy('order')->get(['name', 'description']),
            'faqs' => Faq::where('page', 'how_to_buy')->where('is_active', true)->orderBy('order')->get(['question', 'answer']),
        ]);
    }

    // Practice tests are gated behind an active enrollment (they live inside
    // a course), so there's nothing anonymous to attempt here -- this is a
    // marketing/teaser page showing what's available per course, driving to
    // course detail / registration rather than a real test.
    public function practiceTests(): Response
    {
        $tests = \App\Models\PracticeTest::with('course:id,title,slug,category_id', 'course.category:id,name')
            ->where('is_active', true)
            ->withCount('questions')
            ->whereHas('course', fn ($q) => $q->where('status', 'published'))
            ->orderBy('course_id')
            ->get(['id', 'course_id', 'title', 'question_selection_mode', 'auto_question_count']);

        return Inertia::render('Public/PracticeTests', [
            'tests' => $tests,
            'totalQuestions' => \App\Models\QuestionBank::count(),
        ]);
    }

    public function notes(Request $request): Response
    {
        abort_unless(\App\Support\FeatureFlags::enabled('notes'), 404);

        $unlockedNoteIds = $this->unlockedNoteIds($request);

        $notes = \App\Models\NotesBank::with('subject:id,name', 'courses:id,title,slug')
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['id', 'subject_id', 'title', 'content', 'file_path', 'price'])
            ->map(fn ($n) => [
                ...$n->toArray(),
                'is_paid' => $n->isPaid(),
                'unlocked' => ! $n->isPaid() || $unlockedNoteIds->contains($n->id),
            ]);

        return Inertia::render('Public/Notes', ['notes' => $notes]);
    }

    public function noteDetail(Request $request, \App\Models\NotesBank $note): Response
    {
        abort_unless(\App\Support\FeatureFlags::enabled('notes'), 404);
        abort_unless($note->is_published, 404);

        $unlockedNoteIds = $this->unlockedNoteIds($request);
        $unlocked = ! $note->isPaid() || $unlockedNoteIds->contains($note->id);

        $note->load('subject:id,name', 'courses:id,title,slug');

        return Inertia::render('Public/NoteDetail', [
            'note' => [
                ...$note->only('id', 'subject_id', 'title', 'content', 'file_path', 'price', 'subject', 'courses'),
                'is_paid' => $note->isPaid(),
                'unlocked' => $unlocked,
            ],
            'faqs' => $note->faqs()->where('is_active', true)->get(['id', 'question', 'answer']),
            'testimonials' => $note->testimonials()->get(['id', 'student_name', 'photo_path', 'testimonial_text', 'rating']),
        ]);
    }

    // Access = free, or already granted via a purchase/package assignment
    // (App\Models\NoteAssignment -- the same tier-2 "Guaranteed Notes"
    // mechanism used for package-based access). Shared by notes() and
    // noteDetail() so the unlock rule can't drift between the listing and
    // the detail page.
    private function unlockedNoteIds(Request $request)
    {
        $userId = $request->user()?->id;

        return $userId
            ? \App\Models\NoteAssignment::where('assignable_type', \App\Models\User::class)->where('assignable_id', $userId)->pluck('note_id')
            : collect();
    }

    public function bundles(): Response
    {
        $bundles = \App\Models\Bundle::with(['courses:id,title,base_price'])
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return Inertia::render('Public/Bundles', ['bundles' => $bundles]);
    }

    public function bundleDetail(\App\Models\Bundle $bundle): Response
    {
        abort_unless($bundle->is_active, 404);
        $bundle->load(['courses' => fn ($q) => $q->orderBy('order')]);

        return Inertia::render('Public/BundleDetail', ['bundle' => $bundle]);
    }

    // Static CMS pages (Privacy Policy, Terms & Conditions, etc.) --
    // see Admin\PageController.
    public function page(string $slug): Response
    {
        $page = \App\Models\Page::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return Inertia::render('Public/Page', ['page' => $page->only('title', 'content')]);
    }
}
