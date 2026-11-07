<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Anything that appears anywhere in the system, the admin must be able
     * to control and edit without touching any code." This group is the
     * literal implementation of that rule for the public website.
     */
    public function up(): void
    {
        // Free-form key/value store for one-off global settings (site name,
        // logo, favicon, brand colour overrides, WhatsApp toggle/number,
        // contact details, hours, map embed, social links, payment gateway
        // config). Deliberately schemaless: new settings never need a
        // migration, just a new key from the admin Settings screen.
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('type')->default('string'); // string|text|json|boolean|image
            $table->timestamps();
        });

        Schema::create('announcement_bar', function (Blueprint $table) {
            $table->id();
            $table->string('message');
            $table->string('link_url')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Nav labels, order, visibility — editable, including the
        // Resources/Legal groupings seen on the reference site.
        Schema::create('nav_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('nav_items')->cascadeOnDelete();
            $table->string('label');
            $table->string('url');
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->string('location')->default('header'); // header|footer
            $table->timestamps();
        });

        // Home page sections toggle/order/title — one row per section type,
        // e.g. hero, stats, services, featured_courses, why_choose_us,
        // how_it_works, latest_news, demo_quiz_teaser, faqs, testimonials,
        // cta_footer. `content` carries the section's own free-form fields
        // (headline, subheading, CTA text/link, media path, etc.) so each
        // section type isn't forced into a rigid shared column set.
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('title')->nullable();
            $table->json('content')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('stats_items', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('number');
            $table->string('label');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('service_cards', function (Blueprint $table) {
            $table->id();
            $table->string('icon')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        // page: home|contact|how_to_buy|faq — so one table serves every
        // FAQ accordion in the system.
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('page')->default('home');
            $table->string('question');
            $table->longText('answer'); // rich text
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Admin-created real stories ONLY — no student self-submission
        // (blueprint override #2).
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->string('student_name');
            $table->string('photo_path')->nullable();
            $table->text('testimonial_text');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('service_cards');
        Schema::dropIfExists('stats_items');
        Schema::dropIfExists('home_sections');
        Schema::dropIfExists('nav_items');
        Schema::dropIfExists('announcement_bar');
        Schema::dropIfExists('settings');
    }
};
