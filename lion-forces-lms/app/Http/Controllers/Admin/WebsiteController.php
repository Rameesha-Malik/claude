<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnnouncementBar;
use App\Models\Faq;
use App\Models\HomeSection;
use App\Models\PaymentMethod;
use App\Models\ServiceCard;
use App\Models\Setting;
use App\Models\StatsItem;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Website/Index', [
            'settings' => [
                'site_name' => Setting::get('site_name'),
                'tagline' => Setting::get('tagline'),
                'support_email' => Setting::get('support_email'),
                'office_location' => Setting::get('office_location'),
                'office_hours' => Setting::get('office_hours'),
                'whatsapp_number' => Setting::get('whatsapp_number'),
                'whatsapp_enabled' => Setting::get('whatsapp_enabled', false),
                'social_facebook' => Setting::get('social_facebook'),
                'social_instagram' => Setting::get('social_instagram'),
                'social_youtube' => Setting::get('social_youtube'),
            ],
            'logoPath' => Setting::get('site_logo_path'),
            'announcement' => AnnouncementBar::first(),
            'heroSection' => HomeSection::where('section_key', 'hero')->first(),
            'ctaSection' => HomeSection::where('section_key', 'cta_footer')->first(),
            'howToBuyHeroSection' => HomeSection::firstOrCreate(
                ['section_key' => 'how_to_buy_hero'],
                ['title' => 'How to Buy Hero', 'order' => 0, 'is_enabled' => true, 'content' => [
                    'headline' => 'How to Buy',
                    'subheading' => 'Simple steps from registration to your first lesson.',
                ]],
            ),
            'statsItems' => StatsItem::orderBy('order')->get(),
            'serviceCards' => ServiceCard::orderBy('order')->get(),
            'paymentMethods' => PaymentMethod::orderBy('order')->get(),
            'faqs' => Faq::orderBy('page')->orderBy('order')->get(),
            'testimonials' => Testimonial::orderBy('order')->get(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'site_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:500',
            'support_email' => 'nullable|email|max:255',
            'office_location' => 'nullable|string|max:255',
            'office_hours' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:30',
            'whatsapp_enabled' => 'boolean',
            'social_facebook' => 'nullable|url|max:255',
            'social_instagram' => 'nullable|url|max:255',
            'social_youtube' => 'nullable|url|max:255',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value, $key === 'whatsapp_enabled' ? 'boolean' : 'string');
        }

        return back()->with('success', 'Settings updated.');
    }

    // Stored separately from the rest of the settings form -- a file input
    // can't ride along with the plain-text PUT above without turning that
    // into a multipart request, and a bad image upload shouldn't be able to
    // fail the whole settings save.
    public function updateLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        $old = Setting::get('site_logo_path');
        $path = $request->file('logo')->store('branding', 'public');
        Setting::set('site_logo_path', $path);

        if ($old) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }

        return back()->with('success', 'Logo updated.');
    }

    public function destroyLogo()
    {
        $old = Setting::get('site_logo_path');
        if ($old) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }
        Setting::set('site_logo_path', null);

        return back()->with('success', 'Logo removed.');
    }

    public function updateAnnouncement(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string|max:500',
            'link_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        AnnouncementBar::updateOrCreate(['id' => 1], $data);

        return back()->with('success', 'Announcement bar updated.');
    }

    public function updateHomeSection(Request $request, HomeSection $homeSection)
    {
        $data = $request->validate(['content' => 'required|array']);
        $homeSection->update(['content' => $data['content']]);

        return back()->with('success', "{$homeSection->title} updated.");
    }

    // --- Stats items ---
    public function storeStat(Request $request)
    {
        $data = $request->validate(['icon' => 'nullable|string|max:50', 'number' => 'required|string|max:20', 'label' => 'required|string|max:100']);
        StatsItem::create($data + ['order' => StatsItem::max('order') + 1]);

        return back()->with('success', 'Stat added.');
    }

    public function updateStat(Request $request, StatsItem $stat)
    {
        $stat->update($request->validate(['icon' => 'nullable|string|max:50', 'number' => 'required|string|max:20', 'label' => 'required|string|max:100']));

        return back()->with('success', 'Stat updated.');
    }

    public function destroyStat(StatsItem $stat)
    {
        $stat->delete();

        return back()->with('success', 'Stat removed.');
    }

    // --- Service cards ---
    public function storeService(Request $request)
    {
        $data = $request->validate(['icon' => 'nullable|string|max:50', 'title' => 'required|string|max:150', 'description' => 'nullable|string|max:500']);
        ServiceCard::create($data + ['order' => ServiceCard::max('order') + 1]);

        return back()->with('success', 'Service added.');
    }

    public function updateService(Request $request, ServiceCard $service)
    {
        $service->update($request->validate(['icon' => 'nullable|string|max:50', 'title' => 'required|string|max:150', 'description' => 'nullable|string|max:500']));

        return back()->with('success', 'Service updated.');
    }

    public function destroyService(ServiceCard $service)
    {
        $service->delete();

        return back()->with('success', 'Service removed.');
    }

    // --- Payment methods (How to Buy page) ---
    public function storePaymentMethod(Request $request)
    {
        $data = $request->validate(['icon' => 'nullable|string|max:50', 'name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);
        PaymentMethod::create($data + ['order' => PaymentMethod::max('order') + 1]);

        return back()->with('success', 'Payment method added.');
    }

    public function updatePaymentMethod(Request $request, PaymentMethod $paymentMethod)
    {
        $paymentMethod->update($request->validate(['icon' => 'nullable|string|max:50', 'name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']));

        return back()->with('success', 'Payment method updated.');
    }

    public function destroyPaymentMethod(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        return back()->with('success', 'Payment method removed.');
    }

    // --- FAQs ---
    // `note_id` scopes a FAQ to a Guaranteed Note's detail page instead of
    // a site `page` -- same Faq model/table for both (see the migration
    // that added note_id), so this one pair of endpoints serves both the
    // site Website page and the admin Note FAQs page.
    public function storeFaq(Request $request)
    {
        $data = $request->validate([
            'page' => 'required_without:note_id|nullable|string|max:50',
            'note_id' => 'nullable|exists:notes_bank,id',
            'question' => 'required|string|max:255',
            'answer' => 'required|string|max:2000',
        ]);
        $data['page'] = $data['note_id'] ?? null ? 'note' : ($data['page'] ?? 'home');
        $order = Faq::where('note_id', $data['note_id'] ?? null)->when(empty($data['note_id']), fn ($q) => $q->where('page', $data['page']))->max('order') + 1;
        Faq::create($data + ['order' => $order, 'is_active' => true]);

        return back()->with('success', 'FAQ added.');
    }

    public function updateFaq(Request $request, Faq $faq)
    {
        $data = $request->validate([
            'page' => 'required_without:note_id|nullable|string|max:50',
            'note_id' => 'nullable|exists:notes_bank,id',
            'question' => 'required|string|max:255',
            'answer' => 'required|string|max:2000',
            'is_active' => 'boolean',
        ]);
        $data['page'] = $data['note_id'] ?? null ? 'note' : ($data['page'] ?? 'home');
        $faq->update($data);

        return back()->with('success', 'FAQ updated.');
    }

    public function destroyFaq(Faq $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ removed.');
    }

    // --- Testimonials ---
    // `note_id` scopes a testimonial to a Guaranteed Note's detail page
    // instead of (or alongside) a `course_id` -- same reuse as storeFaq
    // above, serving both the site Website page and the admin Note
    // Testimonials page.
    public function storeTestimonial(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'note_id' => 'nullable|exists:notes_bank,id',
            'student_name' => 'required|string|max:150',
            'testimonial_text' => 'required|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_featured' => 'boolean',
        ]);
        Testimonial::create($data + ['order' => Testimonial::max('order') + 1]);

        return back()->with('success', 'Testimonial added.');
    }

    public function updateTestimonial(Request $request, Testimonial $testimonial)
    {
        $testimonial->update($request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'note_id' => 'nullable|exists:notes_bank,id',
            'student_name' => 'required|string|max:150',
            'testimonial_text' => 'required|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_featured' => 'boolean',
        ]));

        return back()->with('success', 'Testimonial updated.');
    }

    public function destroyTestimonial(Testimonial $testimonial)
    {
        $testimonial->delete();

        return back()->with('success', 'Testimonial removed.');
    }
}
