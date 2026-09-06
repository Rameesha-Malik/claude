<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Note Testimonials" / "Note FAQs" (admin reference screenshot): FAQs and
 * testimonials shown on a Guaranteed Note's detail page. Both concepts
 * already exist site-wide (Faq scoped by `page`, Testimonial scoped by
 * `course_id`) -- this adds the same kind of scope for notes rather than
 * creating parallel "NoteFaq"/"NoteTestimonial" tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->foreignId('note_id')->nullable()->after('page')->constrained('notes_bank')->cascadeOnDelete();
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->foreignId('note_id')->nullable()->after('course_id')->constrained('notes_bank')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('note_id');
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropConstrainedForeignId('note_id');
        });
    }
};
