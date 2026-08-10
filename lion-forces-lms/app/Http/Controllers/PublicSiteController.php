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
            'featuredCourses' => Course::with('category')
                ->where('status', 'published')
                ->orderBy('order')
                ->limit(4)
                ->get(['id', 'title', 'slug', 'short_description', 'thumbnail_path', 'base_price', 'category_id', 'hours']),
            'faqs' => Faq::where('page', 'home')->where('is_active', true)->orderBy('order')->get(['question', 'answer']),
            'testimonials' => Testimonial::orderBy('order')->get(['student_name', 'photo_path', 'testimonial_text', 'rating']),
            'latestNews' => NewsAnnouncement::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('deadline_date')->orWhere('deadline_date', '>=', now()))
                ->orderByDesc('is_pinned')->orderByDesc('created_at')
                ->limit(3)
                ->get(['title', 'description', 'organization', 'deadline_date']),
        ]);
    }

    public function courses(Request $request): Response
    {
        $courses = Course::with('category')
            ->where('status', 'published')
            ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($q) => $q->where('slug', $cat)))
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->orderBy('order')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Public/Courses', [
            'courses' => $courses,
            'categories' => \App\Models\CourseCategory::where('is_active', true)->orderBy('order')->get(['name', 'slug']),
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function courseDetail(Course $course): Response
    {
        $course->load(['category', 'instructor', 'packages' => fn ($q) => $q->where('is_active', true), 'approvedReviews.user', 'lessons' => fn ($q) => $q->where('is_free_preview', true)]);

        return Inertia::render('Public/CourseDetail', ['course' => $course]);
    }

    public function about(): Response
    {
        return Inertia::render('Public/About', [
            'instructors' => Instructor::where('is_active', true)->orderBy('order')->get(['name', 'photo_path', 'qualification', 'experience', 'bio']),
            'section' => HomeSection::where('section_key', 'why_choose_us')->first(['title', 'content']),
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
        return Inertia::render('Public/HowToBuy', [
            'packages' => \App\Models\CoursePackage::with('course:id,title')
                ->where('is_active', true)
                ->orderBy('price')
                ->limit(12)
                ->get(['id', 'course_id', 'name', 'description', 'price', 'validity_days']),
            'faqs' => Faq::where('page', 'how_to_buy')->where('is_active', true)->orderBy('order')->get(['question', 'answer']),
        ]);
    }
}
