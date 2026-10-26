<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CoursePackage;
use App\Models\Enrollment;
use App\Models\Instructor;
use App\Models\Lesson;
use App\Models\NotesBank;
use App\Models\QuestionBank;
use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Category names are REAL — the exact service list from the SRS.
     * Courses, prices, and lesson titles below are PLACEHOLDER: the client
     * has not yet supplied a real course list, so these exist purely to
     * make the system demoable. Replace via Admin -> Course Management,
     * no code change required.
     */
    public function run(): void
    {
        $categories = [
            'LCC' => 'Lady Cadet Course',
            'PMA' => 'Pakistan Military Academy',
            'ISSB' => 'Inter Services Selection Board',
            'AFNS' => 'Army Female Nursing Service',
            'Navy' => 'Pakistan Navy',
            'Air Force' => 'Pakistan Air Force',
            'ASF' => 'Airport Security Force',
            'Police' => 'Police Service',
        ];

        $subjectNames = ['English', 'Current Affairs', 'Intelligence / IQ', 'Mathematics', 'Pakistan Studies', 'General Science'];
        $subjects = collect($subjectNames)->mapWithKeys(fn ($name) => [
            $name => Subject::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name]),
        ]);

        $instructor = Instructor::updateOrCreate(['name' => 'Lead Instructor'], [
            'qualification' => 'M.Phil, Ex-Services', // PLACEHOLDER
            'experience' => '10+ years training academy candidates', // PLACEHOLDER
            'bio' => 'Placeholder instructor profile — replace with real faculty details via Admin -> Instructors.',
            'order' => 1,
            'is_active' => true,
        ]);

        $order = 1;
        foreach ($categories as $short => $full) {
            $category = CourseCategory::updateOrCreate(['slug' => Str::slug($short)], [
                'name' => $short,
                'description' => $full,
                'order' => $order,
                'is_active' => true,
            ]);

            $course = Course::updateOrCreate(['slug' => Str::slug($short).'-complete-prep'], [
                'category_id' => $category->id,
                'instructor_id' => $instructor->id,
                'title' => "{$short} Complete Preparation", // PLACEHOLDER
                'short_description' => "Structured preparation course for {$full} candidates.",
                'description' => "A complete preparation track covering the {$full} test pattern, with lectures, guaranteed notes, and practice tests.",
                'syllabus' => "English, Current Affairs, Intelligence/IQ, and category-specific subjects for {$short}.",
                'level' => 'All levels',
                'hours' => 40,
                'base_price' => 5000, // PLACEHOLDER (PKR)
                'status' => 'published',
                'quizzes_enabled' => true,
                'flashcards_enabled' => true,
                'tests_enabled' => true,
                'target_exam_name' => $short,
                'order' => $order,
            ]);

            // firstOrCreate, not updateOrCreate: this placeholder pricing is
            // meant to be replaced with real content once, in the admin --
            // updateOrCreate would silently overwrite that real content
            // every time this seeder runs again, e.g. if SEED_ON_BOOT is
            // left on in a deploy environment.
            //
            // is_active: false -- these are fake PLACEHOLDER prices for 8
            // demo courses, not something that should ever be live pricing
            // a real visitor sees. On a fresh deploy, Laravel runs every
            // migration before any seeder, so the migration that adds the
            // one course's real package content (and deactivates
            // everything else) ran first and no-opped -- the course it
            // targets didn't exist yet. These placeholders would otherwise
            // be the only "packages" a fresh install ever shows: a page
            // full of fake pricing across every demo course at once,
            // exactly the "packages are a mess" complaint.
            CoursePackage::firstOrCreate(['course_id' => $course->id, 'name' => 'Standard'], [
                'description' => 'Full course access, lectures, notes, and practice tests.',
                'price' => 5000, // PLACEHOLDER
                'validity_days' => 180,
                'order' => 1,
                'is_active' => false,
                'modules' => Enrollment::ALL_MODULES,
            ]);
            CoursePackage::firstOrCreate(['course_id' => $course->id, 'name' => "{$short} Guaranteed Package"], [
                'description' => 'Everything in Standard, plus guaranteed notes and mock exams.',
                'price' => 7500, // PLACEHOLDER
                'validity_days' => 365,
                'order' => 2,
                'is_active' => false,
                'modules' => Enrollment::ALL_MODULES,
            ]);

            // Real priced packages (client WhatsApp paste, "Initial Test
            // Preparation 2026") for the AFNS course specifically -- moved
            // here from a migration (2026_09_04_000003) because that
            // migration ran before this seeder created the course it
            // targets, so it silently did nothing on a fresh deploy. Kept
            // idempotent the same way: firstOrCreate so an admin's later
            // edits to these aren't overwritten by a re-seed.
            if ($short === 'AFNS') {
                $fscPackages = [
                    ['name' => 'FSc — Notes + App Access', 'price' => 6000, 'features' => [
                        'Android App Access', 'Verbal Intelligence Notes', 'Non-Verbal Intelligence Notes',
                        'Academic Notes', 'Past Papers', 'Teacher Support',
                    ]],
                    ['name' => 'FSc — Crash Course Classes', 'price' => 11000, 'features' => [
                        'Complete Notes', 'Verbal Intelligence Live Lectures', 'Non-Verbal Intelligence Live Lectures',
                        'Guess Papers', 'Teacher Support',
                    ]],
                    ['name' => 'FSc — Full Online Classes', 'price' => 16000, 'features' => [
                        'Complete Notes', 'Verbal + Non-Verbal Lectures', 'Academic Lectures',
                        'Past Paper Lectures', 'Practice MCQs',
                    ]],
                ];
                foreach ($fscPackages as $i => $p) {
                    CoursePackage::firstOrCreate(['course_id' => $course->id, 'name' => $p['name']], [
                        'description' => implode("\n", $p['features']),
                        'price' => $p['price'],
                        'validity_days' => 180,
                        'order' => $i + 3,
                        'is_active' => true,
                        'modules' => Enrollment::ALL_MODULES,
                    ]);
                }
            }

            foreach (['Introduction & Test Pattern', 'Core Concepts', 'Practice Strategy'] as $i => $lessonTitle) {
                Lesson::updateOrCreate(['course_id' => $course->id, 'title' => $lessonTitle], [
                    'type' => 'video_youtube',
                    'external_url' => null,
                    'description' => "Placeholder lecture for {$short}.",
                    'order' => $i + 1,
                    'is_free_preview' => $i === 0,
                ]);
            }

            $order++;
        }

        // A handful of sample Question Bank + Notes Bank entries, tagged by
        // subject, to prove the shared-content-library architecture works
        // end to end (one item usable across every course).
        $iq = $subjects['Intelligence / IQ'];
        $q = QuestionBank::updateOrCreate(['question_text' => 'If CAT is coded as 3120, how is DOG coded?'], [
            'subject_id' => $iq->id,
            'explanation' => 'Each letter is replaced by its position in the alphabet minus 1.',
            'difficulty' => 'medium',
        ]);
        $q->options()->delete();
        $q->options()->createMany([
            ['option_text' => '3146', 'is_correct' => false, 'order' => 1],
            ['option_text' => '3157', 'is_correct' => false, 'order' => 2],
            ['option_text' => '4157', 'is_correct' => false, 'order' => 3],
            ['option_text' => '3156', 'is_correct' => true, 'order' => 4],
        ]);

        NotesBank::updateOrCreate(['title' => 'English Grammar Essentials'], [
            'subject_id' => $subjects['English']->id,
            'content' => 'Placeholder notes content. Replace via Admin -> Content Library -> Notes Bank.',
        ]);
    }
}
