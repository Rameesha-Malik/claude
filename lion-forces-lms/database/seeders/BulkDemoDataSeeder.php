<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Bundle;
use App\Models\BundlePurchase;
use App\Models\Course;
use App\Models\CourseQuestion;
use App\Models\CourseQuestionReply;
use App\Models\Enrollment;
use App\Models\NotePurchase;
use App\Models\NotesBank;
use App\Models\Payment;
use App\Models\QuestionBank;
use App\Models\QuestionNote;
use App\Models\QuestionReport;
use App\Models\SavedQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Volume pass on top of CatalogSeeder/DemoContentSeeder -- those give the
 * platform its shape (8 courses, one of everything), this gives it the
 * feel of a platform that's actually been running for months: dozens of
 * students, enrollments in every status and module combo, payments,
 * assignment grading, bundles + bundle purchases, note purchases, reported
 * questions, course Q&A, saved questions, and student MCQ notes -- every
 * admin list page that was still a "nothing yet" empty state. Also adds
 * one Content Manager and one Staff test account so the course-scoped
 * permission logic (several gaps found and fixed in this session's admin
 * audit) can actually be exercised by logging in as one.
 *
 * Idempotent (updateOrCreate/firstOrCreate) throughout, same convention as
 * every other seeder in this directory -- safe to re-run.
 */
class BulkDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $courses = Course::all()->keyBy('slug');
        $admin = User::where('email', 'admin@lionforcesacademy.com')->first() ?? User::role('owner')->first();

        $students = $this->seedStudents();
        $this->seedStaffAccounts($courses);
        $enrollments = $this->seedEnrollments($students, $courses);
        $this->seedPayments($enrollments, $admin);
        $this->seedAssignments($courses, $students, $admin);
        $this->seedBundlesAndPurchases($courses, $students, $admin);
        $this->seedNotePurchases($students, $admin);
        $this->seedQuestionReports($students, $admin);
        $this->seedCourseQA($courses, $students, $admin);
        $this->seedSavedQuestionsAndNotes($students);
    }

    /**
     * ~40 student accounts with staggered signup dates and varied profile
     * completeness -- a real signup funnel has a handful of fully-filled
     * profiles and a long tail of bare-minimum ones, not every row looking
     * identical.
     */
    private function seedStudents(): Collection
    {
        $names = [
            'Hira Siddiqui', 'Usman Tariq', 'Mariam Baig', 'Fahad Sheikh', 'Zainab Qureshi',
            'Hamza Chaudhry', 'Noor Fatima', 'Asad Mehmood', 'Sidra Yousaf', 'Kamran Abbasi',
            'Rabia Nawaz', 'Tariq Javed', 'Amina Rashid', 'Waqas Iqbal', 'Sana Pervez',
            'Imran Dar', 'Mehwish Akhtar', 'Shahzad Gill', 'Farah Naz', 'Adeel Khokhar',
            'Nida Shahid', 'Junaid Latif', 'Komal Aslam', 'Faisal Shaikh', 'Saba Rafique',
            'Zeeshan Haider', 'Mahnoor Ahmed', 'Bilawal Soomro', 'Anusha Riaz', 'Danish Niazi',
            'Hina Zafar', 'Omar Siddiq', 'Laiba Mughal', 'Tahir Mahmood', 'Iqra Bashir',
            'Sohail Anjum', 'Rida Waheed', 'Naveed Ashraf', 'Kinza Hameed', 'Arslan Butt',
        ];

        $cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Faisalabad'];
        $testCenters = ['Lahore Garrison Test Center', 'Karachi Cantt Test Center', 'Rawalpindi Selection Center', null, null];

        return collect($names)->map(function ($name, $i) use ($cities, $testCenters) {
            $email = 'demo.student'.($i + 1).'@example.com';
            $createdAt = now()->subDays(random_int(5, 180));

            $hasFullProfile = $i % 4 === 0; // roughly a quarter filled out, matching a real funnel

            $student = User::updateOrCreate(
                ['email' => $email],
                array_filter([
                    'name' => $name,
                    'user_type' => 'student',
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                    'phone' => $hasFullProfile ? '03'.random_int(100000000, 999999999) : null,
                    'address' => $hasFullProfile ? $cities[array_rand($cities)] : null,
                    'test_center' => $hasFullProfile ? $testCenters[array_rand($testCenters)] : null,
                    'target_exam_name' => $hasFullProfile ? ['LCC', 'PMA', 'ISSB', 'Navy', 'Air Force'][array_rand(['LCC', 'PMA', 'ISSB', 'Navy', 'Air Force'])] : null,
                    'matric_marks_percentage' => $hasFullProfile ? random_int(65, 95) : null,
                ], fn ($v) => $v !== null)
            );
            $student->assignRole('student');
            $student->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->save();

            return $student;
        });
    }

    /**
     * One Content Manager (scoped to 3 of the 8 courses) and one plain
     * Staff account -- logging in as the content manager is the only way
     * to actually exercise the canManageCourse() scoping fixed earlier
     * this session rather than just trusting the code reading.
     */
    private function seedStaffAccounts(Collection $courses): void
    {
        $manager = User::updateOrCreate(
            ['email' => 'demo.manager@example.com'],
            ['name' => 'Demo Content Manager', 'user_type' => 'admin', 'password' => bcrypt('password'), 'email_verified_at' => now()]
        );
        $manager->assignRole('content_manager');
        $managedSlugs = ['lcc-complete-prep', 'pma-complete-prep', 'issb-complete-prep'];
        $managedIds = $courses->only($managedSlugs)->pluck('id')->values();
        if ($managedIds->isNotEmpty()) {
            $manager->managedCourses()->sync($managedIds);
        }

        $staff = User::updateOrCreate(
            ['email' => 'demo.staff@example.com'],
            ['name' => 'Demo Staff Member', 'user_type' => 'admin', 'password' => bcrypt('password'), 'email_verified_at' => now()]
        );
        $staff->assignRole('staff');
    }

    /**
     * 1-2 enrollments per student spread across all 8 courses, with real
     * variety in both status and module combination -- exercises the
     * combo-module purchase system (grantsModule()) rather than every
     * enrollment just being "full access".
     *
     * @return Collection<int, Enrollment>
     */
    private function seedEnrollments(Collection $students, Collection $courses): Collection
    {
        $moduleCombos = [
            Enrollment::ALL_MODULES,
            Enrollment::ALL_MODULES,
            ['lectures'],
            ['quiz'],
            ['tests'],
            ['lectures', 'quiz'],
            ['tests', 'assignments'],
            ['quiz', 'tests'],
            ['lectures', 'assignments'],
        ];
        $courseList = $courses->values();
        $created = collect();

        foreach ($students as $student) {
            $courseCount = random_int(1, 2);
            $picked = $courseList->random(min($courseCount, $courseList->count()));
            if (! $picked instanceof Collection) {
                $picked = collect([$picked]);
            }

            foreach ($picked as $course) {
                $status = $this->randomEnrollmentStatus();
                $modules = $moduleCombos[array_rand($moduleCombos)];
                $package = $course->packages()->inRandomOrder()->first();

                if ($status === 'active') {
                    $enrollment = Enrollment::updateOrCreate(
                        ['user_id' => $student->id, 'course_id' => $course->id],
                        ['package_id' => $package?->id, 'modules' => $modules]
                    );
                    $enrollment->activate();
                } else {
                    $extra = $status === 'expired'
                        ? ['activated_at' => now()->subMonths(8), 'expires_at' => now()->subMonths(2)]
                        : [];
                    $enrollment = Enrollment::updateOrCreate(
                        ['user_id' => $student->id, 'course_id' => $course->id],
                        ['package_id' => $package?->id, 'modules' => $modules, 'status' => $status, ...$extra]
                    );
                }

                $created->push($enrollment->fresh());
            }
        }

        return $created;
    }

    private function randomEnrollmentStatus(): string
    {
        $roll = random_int(1, 100);

        return match (true) {
            $roll <= 65 => 'active',
            $roll <= 85 => 'pending',
            $roll <= 95 => 'expired',
            default => 'suspended',
        };
    }

    /**
     * One Payment per enrollment that actually went through a package
     * (package_id set) -- pending enrollment -> pending payment (awaiting
     * verification, the real everyday admin queue), active/expired/
     * suspended -> verified, and a handful of pending payments flipped to
     * rejected (payment rejected, student never resubmitted) since that's
     * a real, common edge case worth having test data for.
     */
    private function seedPayments(Collection $enrollments, ?User $admin): void
    {
        $methods = ['bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other'];

        foreach ($enrollments as $enrollment) {
            if (! $enrollment->package_id) {
                continue;
            }

            $amount = $enrollment->package?->price ?? 5000;
            $status = match ($enrollment->status) {
                'pending' => random_int(1, 10) === 1 ? 'rejected' : 'pending',
                default => 'verified',
            };

            Payment::updateOrCreate(
                ['enrollment_id' => $enrollment->id],
                [
                    'amount' => $amount,
                    'method' => $methods[array_rand($methods)],
                    'status' => $status,
                    'reference_number' => 'TXN'.str_pad((string) $enrollment->id, 6, '0', STR_PAD_LEFT),
                    'notes' => $status === 'rejected' ? 'Receipt did not match the amount due -- re-upload requested.' : null,
                    'verified_by' => in_array($status, ['verified', 'rejected'], true) ? $admin?->id : null,
                    'verified_at' => in_array($status, ['verified', 'rejected'], true) ? now()->subDays(random_int(1, 60)) : null,
                ]
            );
        }
    }

    /**
     * Assignments didn't exist anywhere in the seeded data at all (zero
     * Assignment:: calls in any prior seeder) -- 1-2 per course for the
     * first 4, plus a mix of submitted (ungraded) and graded submissions
     * so the grading queue has something real to click through.
     */
    private function seedAssignments(Collection $courses, Collection $students, ?User $admin): void
    {
        $defs = [
            'lcc-complete-prep' => ['Written English Test Essay', 'Verbal Reasoning Worksheet'],
            'pma-complete-prep' => ['Current Affairs Summary', 'Physical Fitness Log'],
            'issb-complete-prep' => ['Self-Appraisal Form'],
            'afns-complete-prep' => ['Nursing Aptitude Worksheet'],
        ];

        $studentPool = $students->values();

        foreach ($defs as $slug => $titles) {
            $course = $courses[$slug] ?? null;
            if (! $course) {
                continue;
            }
            $course->update(['assignments_enabled' => true]);

            foreach ($titles as $i => $title) {
                $assignment = Assignment::updateOrCreate(
                    ['course_id' => $course->id, 'title' => $title],
                    [
                        'instructions' => "Complete and submit \"{$title}\" before the due date. Placeholder instructions -- replace via Admin -> Assignments.",
                        'max_marks' => 20,
                        'due_date' => now()->addDays(random_int(10, 30)),
                        'is_active' => true,
                        'order' => $i + 1,
                    ]
                );

                $submitters = $studentPool->random(min(6, $studentPool->count()));
                foreach ($submitters as $student) {
                    $isGraded = random_int(1, 10) <= 4;
                    AssignmentSubmission::updateOrCreate(
                        ['assignment_id' => $assignment->id, 'user_id' => $student->id],
                        [
                            'submission_text' => 'Placeholder submission text for "'.$title.'".',
                            'status' => $isGraded ? 'graded' : 'submitted',
                            'marks_awarded' => $isGraded ? random_int(10, 20) : null,
                            'feedback' => $isGraded ? 'Good effort, review the weaker sections and resubmit practice attempts.' : null,
                            'graded_by' => $isGraded ? $admin?->id : null,
                            'graded_at' => $isGraded ? now()->subDays(random_int(1, 15)) : null,
                            'submitted_at' => now()->subDays(random_int(1, 20)),
                        ]
                    );
                }
            }
        }
    }

    /**
     * 3 bundles grouping 2-3 courses each, plus a few purchases per bundle
     * in mixed status. A verified bundle purchase fans out into a real
     * Enrollment per included course (bundle_purchase_id set, full-access
     * modules), the same way the real checkout flow does -- not just a
     * BundlePurchase row sitting on its own with nothing to show for it.
     */
    private function seedBundlesAndPurchases(Collection $courses, Collection $students, ?User $admin): void
    {
        $defs = [
            ['Army Entry Bundle', ['lcc-complete-prep', 'pma-complete-prep', 'issb-complete-prep'], 12000],
            ['Services Bundle', ['navy-complete-prep', 'air-force-complete-prep'], 9000],
            ['All Forces Bundle', $courses->keys()->all(), 25000],
        ];
        $methods = ['bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other'];
        $studentPool = $students->values();

        foreach ($defs as $i => [$title, $slugs, $price]) {
            $bundle = Bundle::updateOrCreate(
                ['slug' => Str::slug($title)],
                ['title' => $title, 'description' => "Combined access to multiple preparation tracks at one discounted price.", 'price' => $price, 'is_active' => true, 'order' => $i + 1]
            );
            $courseIds = $courses->only($slugs)->pluck('id')->values();
            if ($courseIds->isNotEmpty()) {
                $bundle->courses()->sync($courseIds);
            }

            $buyers = $studentPool->random(min(4, $studentPool->count()));
            foreach ($buyers as $j => $student) {
                $status = match (true) {
                    $j === 0 => 'pending',
                    $j === 1 => 'rejected',
                    default => 'verified',
                };

                $purchase = BundlePurchase::updateOrCreate(
                    ['user_id' => $student->id, 'bundle_id' => $bundle->id],
                    [
                        'amount' => $price,
                        'method' => $methods[array_rand($methods)],
                        'status' => $status,
                        'reference_number' => 'BNDL'.str_pad((string) ($bundle->id * 100 + $j), 6, '0', STR_PAD_LEFT),
                        'verified_by' => $status !== 'pending' ? $admin?->id : null,
                        'verified_at' => $status !== 'pending' ? now()->subDays(random_int(1, 30)) : null,
                    ]
                );

                if ($status === 'verified' && $courseIds->isNotEmpty()) {
                    foreach ($courseIds as $courseId) {
                        $enrollment = Enrollment::updateOrCreate(
                            ['user_id' => $student->id, 'course_id' => $courseId],
                            ['bundle_purchase_id' => $purchase->id, 'modules' => Enrollment::ALL_MODULES]
                        );
                        $enrollment->activate();
                    }
                }
            }
        }
    }

    /**
     * Needs at least one priced note to purchase -- DemoContentSeeder's 5
     * Notes Bank entries are all free, so two paid ones are added here
     * first, then a handful of purchase requests in mixed status. A
     * verified one also creates the real NoteAssignment unlock, same as
     * GuaranteedNotesController::verify() does.
     */
    private function seedNotePurchases(Collection $students, ?User $admin): void
    {
        $englishSubjectId = \App\Models\Subject::where('name', 'English')->value('id');

        $paidNotes = collect([
            ['Advanced Verbal Reasoning Pack', 1200],
            ['Guaranteed Current Affairs 2026', 800],
        ])->map(fn ($def) => NotesBank::updateOrCreate(
            ['title' => $def[0]],
            ['subject_id' => $englishSubjectId, 'content' => 'Placeholder paid note content -- replace via Admin -> Question Bank -> Notes.', 'price' => $def[1], 'is_published' => true]
        ));

        $methods = ['bank_transfer', 'easypaisa', 'jazzcash'];
        $buyers = $students->values()->random(min(10, $students->count()));

        foreach ($buyers as $i => $student) {
            $note = $paidNotes[$i % $paidNotes->count()];
            $status = match ($i % 4) {
                0 => 'pending',
                1 => 'rejected',
                default => 'verified',
            };

            $purchase = NotePurchase::updateOrCreate(
                ['user_id' => $student->id, 'note_id' => $note->id],
                [
                    'amount' => $note->price,
                    'method' => $methods[array_rand($methods)],
                    'status' => $status,
                    'reference_number' => 'NOTE'.str_pad((string) ($note->id * 100 + $i), 6, '0', STR_PAD_LEFT),
                    'verified_by' => $status !== 'pending' ? $admin?->id : null,
                    'verified_at' => $status !== 'pending' ? now()->subDays(random_int(1, 20)) : null,
                ]
            );

            if ($status === 'verified') {
                \App\Models\NoteAssignment::updateOrCreate([
                    'note_id' => $note->id,
                    'assignable_type' => User::class,
                    'assignable_id' => $student->id,
                ]);
            }
        }
    }

    /**
     * A handful of students flagging existing question bank entries --
     * mixed pending/resolved/dismissed so the Reported Questions queue
     * isn't all-pending.
     */
    private function seedQuestionReports(Collection $students, ?User $admin): void
    {
        $reasons = [
            'The marked correct answer looks wrong to me.',
            'This question has a typo in option B.',
            'Two of the options seem to mean the same thing.',
            'The explanation doesn\'t match the correct answer shown.',
            'This question seems out of scope for this subject.',
        ];

        $questions = QuestionBank::inRandomOrder()->limit(10)->get();
        $reporters = $students->values()->random(min(10, $students->count()));

        foreach ($questions as $i => $question) {
            $reporter = $reporters[$i % $reporters->count()];
            $status = match ($i % 3) {
                0 => 'pending',
                1 => 'resolved',
                default => 'dismissed',
            };

            QuestionReport::updateOrCreate(
                ['question_id' => $question->id, 'user_id' => $reporter->id],
                [
                    'reason' => $reasons[$i % count($reasons)],
                    'status' => $status,
                    'resolved_by' => $status !== 'pending' ? $admin?->id : null,
                    'resolved_at' => $status !== 'pending' ? now()->subDays(random_int(1, 25)) : null,
                ]
            );
        }
    }

    /**
     * Course Q&A threads -- a mix of unanswered (the real admin queue) and
     * already-answered-with-a-reply, across a few courses.
     */
    private function seedCourseQA(Collection $courses, Collection $students, ?User $admin): void
    {
        $questions = [
            ['How many attempts do I get for the practice tests?', 'You can retake any repeatable practice test as many times as you like before your access expires.'],
            ['Is the mock exam timed the same way as the real test?', 'Yes, section durations and negative marking mirror the real exam pattern as closely as possible.'],
            ['When will the guaranteed notes be updated for this year?', null],
            ['Can I switch my target exam date after enrolling?', null],
            ['Are the flashcards covering the full syllabus?', 'They currently cover the core topics -- more are added regularly.'],
        ];

        $courseList = $courses->values();
        $studentPool = $students->values();

        foreach ($questions as $i => [$text, $reply]) {
            $course = $courseList[$i % $courseList->count()];
            $student = $studentPool[$i % $studentPool->count()];

            $question = CourseQuestion::updateOrCreate(
                ['course_id' => $course->id, 'user_id' => $student->id, 'question_text' => $text],
                ['status' => $reply ? 'answered' : 'unanswered']
            );

            if ($reply) {
                CourseQuestionReply::updateOrCreate(
                    ['question_id' => $question->id, 'admin_id' => $admin?->id],
                    ['reply_text' => $reply]
                );
            }
        }
    }

    /**
     * Saved (starred) questions and personal MCQ notes -- both unique per
     * (user, question), so firstOrCreate/updateOrCreate on that pair.
     */
    private function seedSavedQuestionsAndNotes(Collection $students): void
    {
        $questions = QuestionBank::inRandomOrder()->limit(15)->get();
        if ($questions->isEmpty()) {
            return;
        }

        $saversPool = $students->values()->random(min(15, $students->count()));
        foreach ($saversPool as $student) {
            foreach ($questions->random(min(random_int(2, 4), $questions->count())) as $question) {
                SavedQuestion::firstOrCreate(['user_id' => $student->id, 'question_id' => $question->id]);
            }
        }

        $notesPool = $students->values()->random(min(10, $students->count()));
        $noteTexts = [
            'Remember the trick: eliminate the obviously wrong options first.',
            'Came up in a past paper -- review this one again before the test.',
            'Mixed this up with a similar question, double-check the wording.',
            'Easy one, just reviewing to stay sharp.',
        ];
        foreach ($notesPool as $i => $student) {
            foreach ($questions->random(min(random_int(1, 3), $questions->count())) as $question) {
                QuestionNote::updateOrCreate(
                    ['user_id' => $student->id, 'question_id' => $question->id],
                    ['note_text' => $noteTexts[$i % count($noteTexts)]]
                );
            }
        }
    }
}
