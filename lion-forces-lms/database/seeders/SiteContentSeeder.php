<?php

namespace Database\Seeders;

use App\Models\AnnouncementBar;
use App\Models\Faq;
use App\Models\HomeSection;
use App\Models\NavItem;
use App\Models\ServiceCard;
use App\Models\Setting;
use App\Models\StatsItem;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    /**
     * Every value below marked REAL came verbatim from the client (chat
     * pastes of the old beta.issbacademy.com site, 09 Aug 2026). Everything
     * marked PLACEHOLDER is invented content the admin panel is meant to
     * replace — never real numbers, never a real testimonial. This is the
     * whole point of the architecture: nothing below requires a developer
     * to change later.
     */
    public function run(): void
    {
        // --- Global settings ---
        Setting::set('site_name', 'Lion Forces Academy');
        Setting::set('tagline', "Pakistan's largest online forces preparation platform — preparing candidates for Pak Army, Navy and PAF since 2021."); // REAL
        Setting::set('support_email', 'support.lionforcesacademy@gmail.com'); // REAL
        Setting::set('office_location', 'Pakistan'); // REAL
        Setting::set('office_hours', '9:00 AM – 12:00 AM'); // REAL
        Setting::set('whatsapp_number', '+923481154174'); // REAL — client's chat number
        Setting::set('whatsapp_enabled', true, 'boolean');
        Setting::set('copyright_text', '© '.date('Y').' Lion Forces Academy. All rights reserved.'); // REAL pattern
        Setting::set('primary_color', '#04A79D'); // client brand swatch
        Setting::set('secondary_color', '#054F4C'); // client brand swatch

        // --- Announcement bar (off by default — admin activates per SRS §2.2) ---
        AnnouncementBar::updateOrCreate(['id' => 1], [
            'message' => 'Lady Cadet Course open — apply before the deadline.', // PLACEHOLDER
            'link_url' => '/courses',
            'is_active' => false,
            'expires_at' => null,
        ]);

        // --- Navigation — REAL structure from the old site ---
        $home = NavItem::updateOrCreate(['label' => 'Home', 'location' => 'header'], ['url' => '/', 'order' => 1, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Courses', 'location' => 'header'], ['url' => '/courses', 'order' => 2, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'About Us', 'location' => 'header'], ['url' => '/about', 'order' => 3, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Contact Us', 'location' => 'header'], ['url' => '/contact', 'order' => 4, 'is_visible' => true]);

        $resources = NavItem::updateOrCreate(['label' => 'Resources', 'location' => 'footer'], ['url' => '#', 'order' => 1, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Practice Tests', 'parent_id' => $resources->id], ['url' => '/practice-tests', 'order' => 1, 'is_visible' => true, 'location' => 'footer']);
        NavItem::updateOrCreate(['label' => 'Notes', 'parent_id' => $resources->id], ['url' => '/notes', 'order' => 2, 'is_visible' => true, 'location' => 'footer']);
        NavItem::updateOrCreate(['label' => 'How to Buy', 'parent_id' => $resources->id], ['url' => '/how-to-buy', 'order' => 3, 'is_visible' => true, 'location' => 'footer']);
        NavItem::updateOrCreate(['label' => 'Free Demo', 'parent_id' => $resources->id], ['url' => '/demo-quiz', 'order' => 4, 'is_visible' => true, 'location' => 'footer']);

        $legal = NavItem::updateOrCreate(['label' => 'Legal', 'location' => 'footer'], ['url' => '#', 'order' => 2, 'is_visible' => true]);
        NavItem::updateOrCreate(['label' => 'Privacy Policy', 'parent_id' => $legal->id], ['url' => '/privacy-policy', 'order' => 1, 'is_visible' => true, 'location' => 'footer']);
        NavItem::updateOrCreate(['label' => 'Terms & Conditions', 'parent_id' => $legal->id], ['url' => '/terms', 'order' => 2, 'is_visible' => true, 'location' => 'footer']);
        NavItem::updateOrCreate(['label' => 'FAQ', 'parent_id' => $legal->id], ['url' => '/faq', 'order' => 3, 'is_visible' => true, 'location' => 'footer']);

        // --- Home page sections ---
        HomeSection::updateOrCreate(['section_key' => 'hero'], [
            'title' => 'Hero',
            'order' => 1,
            'is_enabled' => true,
            'content' => [
                'headline' => 'Train Like You Mean to Get Selected', // PLACEHOLDER
                'subheading' => "Pakistan's largest online forces preparation platform — preparing candidates for Pak Army, Navy and PAF since 2021.", // REAL tagline
                'cta_primary_text' => 'Explore Courses',
                'cta_primary_link' => '/courses',
                'cta_secondary_text' => 'Try Free Demo Quiz',
                'cta_secondary_link' => '/demo-quiz',
            ],
        ]);

        HomeSection::updateOrCreate(['section_key' => 'why_choose_us'], [
            'title' => 'Why Choose Our Platform?',
            'order' => 5,
            'is_enabled' => true,
            'content' => [
                'paragraph' => 'Smarter preparation. Better performance. Guaranteed direction.',
                'items' => [
                    ['icon' => 'medal', 'title' => 'Retired Officers', 'description' => 'Guidance from ex-Army & PAF officers with real selection experience.'],
                    ['icon' => 'infinity', 'title' => 'Unlimited Practice Tests', 'description' => 'Attempt as many tests as you need with no restrictions.'],
                    ['icon' => 'chart', 'title' => 'Performance Graph', 'description' => 'Track your progress visually and identify weak areas fast.'],
                    ['icon' => 'play', 'title' => 'Video Lectures', 'description' => 'Concept-focused video lessons for every topic and subject.'],
                    ['icon' => 'gift', 'title' => 'Free Demos', 'description' => 'Try before you buy — explore courses with no commitment.'],
                    ['icon' => 'headset', 'title' => '24/7 Support', 'description' => 'Get help from our team at any time, any day of the week.'],
                    ['icon' => 'tag', 'title' => 'Reasonable Fee', 'description' => 'Premium preparation at a price every candidate can afford.'],
                    ['icon' => 'shield-check', 'title' => 'Test Guarantee', 'description' => "Retake key assessments risk-free until you're confident and ready."],
                ],
            ],
        ]);

        HomeSection::updateOrCreate(['section_key' => 'how_it_works'], [
            'title' => 'How It Works',
            'order' => 6,
            'is_enabled' => true,
            'content' => [
                'steps' => [ // REAL — from the old site's "Why use this platform"
                    ['title' => 'Register', 'description' => 'Structured curriculum so you learn in the right order.'],
                    ['title' => 'Learn & Test', 'description' => 'Quizzes and assessments to reinforce knowledge, with progress saved as you go.'],
                    ['title' => 'Succeed', 'description' => 'Certificate on completion to document your training.'],
                ],
            ],
        ]);

        HomeSection::updateOrCreate(['section_key' => 'demo_quiz_teaser'], [
            'title' => 'Demo Quiz',
            'order' => 8,
            'is_enabled' => true,
            'content' => [
                'banner_text' => 'Try a free demo quiz — no login required.',
                'button_text' => 'Start Demo Quiz',
                'button_link' => '/demo-quiz',
            ],
        ]);

        HomeSection::updateOrCreate(['section_key' => 'cta_footer'], [
            'title' => 'CTA Footer Banner',
            'order' => 10,
            'is_enabled' => true,
            'content' => [
                'heading' => 'Ready to start training?', // REAL
                'subheading' => 'Browse courses and enroll in the training you need.', // REAL
                'button_text' => 'Register Now',
                'button_link' => '/register',
            ],
        ]);

        foreach (['services', 'featured_courses', 'faqs', 'testimonials', 'latest_news', 'stats'] as $i => $key) {
            HomeSection::updateOrCreate(['section_key' => $key], [
                'title' => str($key)->headline(),
                'order' => 2 + $i,
                'is_enabled' => true,
                'content' => [],
            ]);
        }

        // --- Stats — PLACEHOLDER numbers, REAL labels (old site had these
        // 4 categories but rendered the numbers via JS counters we couldn't
        // read from a static fetch) ---
        StatsItem::updateOrCreate(['label' => 'Courses'], ['icon' => 'book-open', 'number' => '20+', 'order' => 1]);
        StatsItem::updateOrCreate(['label' => 'Personnel'], ['icon' => 'users', 'number' => '1,500+', 'order' => 2]);
        StatsItem::updateOrCreate(['label' => 'Assessments'], ['icon' => 'check-circle', 'number' => '5,000+', 'order' => 3]);
        StatsItem::updateOrCreate(['label' => 'Certified'], ['icon' => 'award', 'number' => '300+', 'order' => 4]);

        // --- Services (PLACEHOLDER copy, real category structure) ---
        ServiceCard::updateOrCreate(['title' => 'PMA & Army Preparation'], ['icon' => 'shield', 'description' => 'Complete preparation for PMA Long Course and Army entry tests.', 'order' => 1]);
        ServiceCard::updateOrCreate(['title' => 'Navy & Air Force'], ['icon' => 'anchor', 'description' => 'Structured courses for Navy and PAF recruitment exams.', 'order' => 2]);
        ServiceCard::updateOrCreate(['title' => 'ISSB & Intelligence'], ['icon' => 'brain', 'description' => 'ISSB-pattern practice and IQ test preparation.', 'order' => 3]);
        ServiceCard::updateOrCreate(['title' => 'Lady Cadet Course'], ['icon' => 'star', 'description' => 'Dedicated LCC preparation track for female candidates.', 'order' => 4]);

        // --- FAQs — REAL question from the old site's Contact page, the
        // rest PLACEHOLDER pending the full FAQ page content ---
        Faq::updateOrCreate(['question' => 'How do I enroll in a course?', 'page' => 'home'], [
            'answer' => 'Register or sign in, then open a course and click "Enroll now". You can start learning right away.', // REAL
            'order' => 1,
            'is_active' => true,
        ]);
        Faq::updateOrCreate(['question' => 'When will I get a response?', 'page' => 'contact'], [
            'answer' => 'We typically reply within a day.', // REAL (from contact page copy)
            'order' => 1,
            'is_active' => true,
        ]);
        Faq::updateOrCreate(['question' => 'Can I get a certificate?', 'page' => 'contact'], [
            'answer' => 'Yes — a certificate is issued on completion of a course.', // PLACEHOLDER, confirm wording
            'order' => 2,
            'is_active' => true,
        ]);
        Faq::updateOrCreate(['question' => 'What is your refund policy?', 'page' => 'how_to_buy'], [
            'answer' => 'Contact support within 3 days of purchase if you have not started the course.', // PLACEHOLDER, confirm wording
            'order' => 1,
            'is_active' => true,
        ]);
        Faq::updateOrCreate(['question' => 'How long do I have access after payment?', 'page' => 'how_to_buy'], [
            'answer' => 'Access duration depends on the package you choose — see validity on each package above.', // PLACEHOLDER
            'order' => 2,
            'is_active' => true,
        ]);
        Faq::updateOrCreate(['question' => 'What happens after I pay?', 'page' => 'how_to_buy'], [
            'answer' => 'Our team verifies your payment and activates your access, usually within a day.', // PLACEHOLDER
            'order' => 3,
            'is_active' => true,
        ]);

        // --- Testimonials — PLACEHOLDER only. Per the client's explicit
        // instruction, real testimonials must be admin-created real
        // stories; none are invented here beyond a clearly fake sample. ---
        Testimonial::updateOrCreate(['student_name' => 'Sample Testimonial — replace me'], [
            'testimonial_text' => 'Replace this with a real, admin-entered success story before launch.',
            'rating' => 5,
            'is_featured' => false,
            'order' => 1,
        ]);
    }
}
