<?php

use App\Models\Course;
use App\Models\CoursePackage;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Real package content the client sent (via WhatsApp, pasted into the
     * session) for the "Initial Test Preparation 2026" AFNS/AMC campaign --
     * two audience tracks, FSc-level and Graduate-level applicants, each
     * with different package options and prices. Replaces the placeholder
     * "Standard" package on the AFNS course with this real, priced content
     * so the How to Buy pricing cards show actual offerings.
     *
     * validity_days is set to 180 for all five (matching this course's
     * existing package convention) since the client's message didn't state
     * a validity period per package -- adjustable in Admin -> Courses ->
     * AFNS Complete Preparation -> Packages if a different period was meant.
     */
    public function up(): void
    {
        $course = Course::where('slug', 'afns-complete-prep')->first();
        if (! $course) {
            return; // seed data can differ per environment; don't fail a deploy over it
        }

        // Superseded by the real packages below.
        CoursePackage::where('course_id', $course->id)->where('name', 'Standard')->delete();

        $packages = [
            [
                'name' => 'FSc — Notes + App Access',
                'price' => 6000,
                'features' => [
                    'Android App Access',
                    'Verbal Intelligence Notes',
                    'Non-Verbal Intelligence Notes',
                    'Academic Notes',
                    'Past Papers',
                    'Teacher Support',
                ],
            ],
            [
                'name' => 'FSc — Crash Course Classes',
                'price' => 11000,
                'features' => [
                    'Complete Notes',
                    'Verbal Intelligence Live Lectures',
                    'Non-Verbal Intelligence Live Lectures',
                    'Guess Papers',
                    'Teacher Support',
                ],
            ],
            [
                'name' => 'FSc — Full Online Classes',
                'price' => 16000,
                'features' => [
                    'Complete Notes',
                    'Verbal + Non-Verbal Lectures',
                    'Academic Lectures',
                    'Past Paper Lectures',
                    'Practice MCQs',
                ],
            ],
            [
                'name' => 'Graduate — Notes + App Access',
                'price' => 6500,
                'features' => [
                    'Android App Access',
                    'Verbal Intelligence Notes',
                    'Non-Verbal Intelligence Notes',
                    'Academic Notes',
                    'Past Papers',
                    'Teacher Support',
                ],
            ],
            [
                'name' => 'Graduate — Full Online Classes',
                'price' => 16000,
                'features' => [
                    'Complete Notes',
                    'Verbal + Non-Verbal Lectures',
                    'Academic Lectures',
                    'Past Paper Lectures',
                    'Practice MCQs',
                ],
            ],
        ];

        foreach ($packages as $i => $p) {
            CoursePackage::create([
                'course_id' => $course->id,
                'name' => $p['name'],
                'description' => implode("\n", $p['features']),
                'price' => $p['price'],
                'validity_days' => 180,
                'order' => $i + 1,
                'is_active' => true,
            ]);
        }
    }

    public function down(): void
    {
        $course = Course::where('slug', 'afns-complete-prep')->first();
        if (! $course) {
            return;
        }

        CoursePackage::where('course_id', $course->id)
            ->whereIn('name', [
                'FSc — Notes + App Access',
                'FSc — Crash Course Classes',
                'FSc — Full Online Classes',
                'Graduate — Notes + App Access',
                'Graduate — Full Online Classes',
            ])
            ->delete();
    }
};
