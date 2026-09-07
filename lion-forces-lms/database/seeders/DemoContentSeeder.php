<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\DemoQuiz;
use App\Models\Enrollment;
use App\Models\Flashcard;
use App\Models\HallOfFame;
use App\Models\Instructor;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\MockExam;
use App\Models\MockExamSection;
use App\Models\NoteAssignment;
use App\Models\NotesBank;
use App\Models\PracticeTest;
use App\Models\Quiz;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\StagedTest;
use App\Models\StagedTestStage;
use App\Models\Subject;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Fills in every module that was still empty for client review: the
 * question bank only had 1 question (so every test/quiz feature was
 * unusable), and Practice Tests / Mock Exams / Staged Tests / Demo Quiz /
 * Hall of Fame / most reviews had zero rows anywhere. Everything here is
 * placeholder content (same demo-data approach as CatalogSeeder/
 * SiteContentSeeder) and is safe to re-run (updateOrCreate throughout).
 */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = Subject::pluck('id', 'name');
        $courses = Course::all()->keyBy('slug');

        $questions = $this->seedQuestionBank($subjects);
        $instructors = $this->seedInstructors($courses);
        $notes = $this->seedNotesBank($subjects, $courses);
        $this->seedQuizzesAndFlashcards($courses, $questions);
        $this->seedPracticeTests($courses, $questions);
        $this->seedMockExam($courses, $questions);
        $this->seedStagedTest($courses, $questions);
        $this->seedDemoQuiz($questions);
        $reviewers = $this->seedDemoReviewers();
        $this->seedReviews($courses, $reviewers);
        $this->seedTestimonials($courses, $reviewers);
        $this->seedHallOfFame($courses);
        $this->seedDemoStudentExperience($courses);
    }

    /**
     * @return \Illuminate\Support\Collection<string, QuestionBank> keyed by "Subject|question text" for easy lookup below
     */
    private function seedQuestionBank($subjects)
    {
        $bank = [
            'English' => [
                ['Choose the correctly spelled word.', ['Recieve', 'Receive', 'Receeve', 'Receve'], 1, 'The correct spelling is "Receive" — i before e except after c.'],
                ['Choose the best synonym for "Abundant".', ['Scarce', 'Plentiful', 'Empty', 'Modest'], 1, '"Abundant" means existing in large quantities — "Plentiful" is the closest synonym.'],
                ['Fill in the blank: "She ___ to the market every day."', ['go', 'goes', 'going', 'gone'], 1, 'Third-person singular present tense takes "goes".'],
            ],
            'Current Affairs' => [
                ['In which year did Pakistan conduct its first nuclear tests?', ['1965', '1971', '1998', '2001'], 2, 'Pakistan conducted its first nuclear tests in May 1998.'],
                ['Which country hosted the 2022 FIFA World Cup?', ['Russia', 'Brazil', 'Qatar', 'Germany'], 2, 'Qatar hosted the 2022 FIFA World Cup.'],
                ['Pakistan gained independence in which year?', ['1945', '1946', '1947', '1948'], 2, 'Pakistan gained independence on 14 August 1947.'],
            ],
            'Intelligence / IQ' => [
                ['Find the odd one out.', ['Apple', 'Banana', 'Carrot', 'Mango'], 2, 'Carrot is a vegetable; the rest are fruits.'],
                ['Complete the series: 2, 6, 12, 20, 30, ?', ['36', '40', '42', '44'], 2, 'The differences increase by 2 each time (4,6,8,10,12), so the next term is 30+12=42.'],
                ['If A=1, B=2, C=3 ... Z=26, what is the value of D+O+G?', ['24', '25', '26', '27'], 2, 'D=4, O=15, G=7, so 4+15+7=26.'],
            ],
            'Mathematics' => [
                ['What is 15% of 200?', ['20', '25', '30', '35'], 2, '15% of 200 = 0.15 × 200 = 30.'],
                ['Solve: 7 × 8 − 6 = ?', ['48', '50', '52', '56'], 1, '7 × 8 = 56, 56 − 6 = 50.'],
                ['What is the square root of 144?', ['10', '11', '12', '14'], 2, '12 × 12 = 144.'],
            ],
            'Pakistan Studies' => [
                ['Who is known as the founder of Pakistan?', ['Liaquat Ali Khan', 'Muhammad Ali Jinnah', 'Allama Iqbal', 'Ayub Khan'], 1, 'Muhammad Ali Jinnah is recognized as the founder (Quaid-e-Azam) of Pakistan.'],
                ['What is the national language of Pakistan?', ['Punjabi', 'Sindhi', 'Urdu', 'Pashto'], 2, 'Urdu is the national language of Pakistan.'],
                ['Which river is the longest in Pakistan?', ['Jhelum', 'Chenab', 'Ravi', 'Indus'], 3, 'The Indus River is the longest river in Pakistan.'],
            ],
            'General Science' => [
                ['What is the chemical symbol for water?', ['H2O', 'HO2', 'H2O2', 'OH'], 0, 'Water is composed of two hydrogen atoms and one oxygen atom: H2O.'],
                ['Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Saturn'], 1, 'Mars appears red due to iron oxide on its surface.'],
                ['How many bones are in the adult human body?', ['186', '196', '206', '216'], 2, 'The adult human skeleton has 206 bones.'],
            ],
        ];

        $created = collect();
        foreach ($bank as $subjectName => $items) {
            $subjectId = $subjects[$subjectName] ?? null;
            foreach ($items as [$text, $options, $correctIndex, $explanation]) {
                $question = QuestionBank::updateOrCreate(['question_text' => $text], [
                    'subject_id' => $subjectId,
                    'explanation' => $explanation,
                    'difficulty' => 'medium',
                ]);
                $question->options()->delete();
                foreach ($options as $i => $optionText) {
                    $question->options()->create([
                        'option_text' => $optionText,
                        'is_correct' => $i === $correctIndex,
                        'order' => $i + 1,
                    ]);
                }
                $created->put($subjectName.'|'.$text, $question);
            }
        }

        return $created->groupBy(fn ($q, $key) => explode('|', $key)[0]);
    }

    private function seedInstructors($courses): \Illuminate\Support\Collection
    {
        $roster = [
            'Lead Instructor' => ['qualification' => 'M.Phil, Ex-Services', 'experience' => '10+ years training academy candidates'],
            'English Faculty' => ['qualification' => 'MA English Literature', 'experience' => '8 years teaching verbal & written English'],
            'Mathematics Faculty' => ['qualification' => 'MSc Mathematics', 'experience' => '6 years teaching quantitative aptitude'],
        ];

        $instructors = collect();
        $order = 1;
        foreach ($roster as $name => $details) {
            $instructors->push(Instructor::updateOrCreate(['name' => $name], [
                'qualification' => $details['qualification'],
                'experience' => $details['experience'],
                'bio' => 'Placeholder instructor profile — replace with real faculty details via Admin -> Instructors.',
                'order' => $order++,
                'is_active' => true,
            ]));
        }

        // Spread the 8 courses across the 3 instructors round-robin instead
        // of every course pointing at the same one.
        $courses->values()->each(function (Course $course, $i) use ($instructors) {
            $course->update(['instructor_id' => $instructors[$i % $instructors->count()]->id]);
        });

        return $instructors;
    }

    private function seedNotesBank($subjects, $courses): \Illuminate\Support\Collection
    {
        $notes = [
            ['English Grammar Essentials', 'English', 'Placeholder notes content. Replace via Admin -> Content Library -> Notes Bank.'],
            ['Verbal & Non-Verbal Reasoning Shortcuts', 'Intelligence / IQ', 'Placeholder notes content covering common reasoning patterns and shortcuts.'],
            ['Quick Math Formulas', 'Mathematics', 'Placeholder notes content with commonly-used formulas for quick revision.'],
            ['Pakistan Studies Key Facts', 'Pakistan Studies', 'Placeholder notes content summarizing key dates, figures, and facts.'],
            ['Current Affairs Digest', 'Current Affairs', 'Placeholder notes content — replace with a real, regularly-updated digest.'],
        ];

        $created = collect();
        foreach ($notes as [$title, $subjectName, $content]) {
            $created->push(NotesBank::updateOrCreate(['title' => $title], [
                'subject_id' => $subjects[$subjectName] ?? null,
                'content' => $content,
            ]));
        }

        // Attach the first two notes as shared "Notes" tab content on every course.
        $courses->each(function (Course $course) use ($created) {
            $course->sharedNotes()->syncWithoutDetaching([
                $created[0]->id => ['order' => 1],
                $created[1]->id => ['order' => 2],
            ]);
        });

        // Two-tier "Guaranteed Notes": assign the Current Affairs digest to
        // every "Guaranteed Package" specifically (package-tier targeting).
        $courses->each(function (Course $course) use ($created) {
            $guaranteedPackage = $course->packages()->where('name', 'like', '%Guaranteed%')->first();
            if ($guaranteedPackage) {
                NoteAssignment::updateOrCreate([
                    'note_id' => $created[4]->id,
                    'assignable_type' => \App\Models\CoursePackage::class,
                    'assignable_id' => $guaranteedPackage->id,
                ]);
            }
        });

        return $created;
    }

    private function seedQuizzesAndFlashcards($courses, $questionsBySubject): void
    {
        $subjectCycle = $questionsBySubject->keys()->values();

        $courses->values()->each(function (Course $course, $i) use ($questionsBySubject, $subjectCycle) {
            $subjectName = $subjectCycle[$i % $subjectCycle->count()];
            $pool = $questionsBySubject[$subjectName] ?? collect();

            $quiz = Quiz::updateOrCreate(['course_id' => $course->id, 'title' => "{$course->target_exam_name} Quick Quiz"], [
                'question_selection_mode' => 'manual',
                'shuffle_questions' => true,
                'marks_per_question' => 1,
                'negative_marking' => 0,
                'is_repeatable' => true,
                'is_active' => true,
            ]);
            $sync = [];
            foreach ($pool->values() as $order => $question) {
                $sync[$question->id] = ['order' => $order + 1];
            }
            $quiz->questions()->sync($sync);

            $short = $course->target_exam_name;
            $flashcards = [
                ["What does {$short} stand for?", $course->category->description ?? $course->title],
                ['What is the recommended first step in preparation?', 'Understand the exact test pattern and syllabus before starting practice.'],
                ['How should negative marking change your strategy?', "Skip a question rather than guess if you aren't reasonably confident — wrong answers cost more than skips."],
            ];
            foreach ($flashcards as [$front, $back]) {
                Flashcard::updateOrCreate(['course_id' => $course->id, 'front_text' => $front], [
                    'back_text' => $back,
                    'status' => 'approved',
                    'reviewed_at' => now(),
                ]);
            }
        });
    }

    private function seedPracticeTests($courses, $questionsBySubject): void
    {
        $iq = $questionsBySubject['Intelligence / IQ'] ?? collect();

        $courses->each(function (Course $course) use ($iq) {
            $test = PracticeTest::updateOrCreate(['course_id' => $course->id, 'title' => 'Verbal & Non-Verbal Practice Set'], [
                'timer_enabled' => false,
                'question_selection_mode' => 'manual',
                'shuffle_questions' => true,
                'marks_per_question' => 1,
                'negative_marking' => 0.25,
                'is_repeatable' => true,
                'is_active' => true,
            ]);
            $sync = [];
            foreach ($iq->values() as $order => $question) {
                $sync[$question->id] = ['order' => $order + 1];
            }
            $test->questions()->sync($sync);
        });
    }

    private function seedMockExam($courses, $questionsBySubject): void
    {
        // Full sectioned mock exam, built for two representative courses
        // rather than all eight -- enough to demonstrate the section-wise
        // scoring without hand-writing the same structure 8 times.
        foreach (['lcc-complete-prep', 'pma-complete-prep'] as $slug) {
            $course = $courses[$slug] ?? null;
            if (! $course) {
                continue;
            }

            $exam = MockExam::updateOrCreate(['course_id' => $course->id, 'title' => "{$course->target_exam_name} Full-Length Mock Exam"], [
                'target_exam_name' => $course->target_exam_name,
                'fullscreen_required' => true,
                'disallow_back_navigation' => false,
                'is_active' => true,
            ]);

            $sections = [
                'Verbal Intelligence' => $questionsBySubject['Intelligence / IQ'] ?? collect(),
                'English' => $questionsBySubject['English'] ?? collect(),
                'General Science' => $questionsBySubject['General Science'] ?? collect(),
            ];
            $order = 1;
            foreach ($sections as $name => $pool) {
                $section = MockExamSection::updateOrCreate(['mock_exam_id' => $exam->id, 'name' => $name], [
                    'order' => $order++,
                    'duration_minutes' => 15,
                    'marks_per_question' => 1,
                    'negative_marking' => 0.25,
                ]);
                $sync = [];
                foreach ($pool->values() as $i => $question) {
                    $sync[$question->id] = ['order' => $i + 1];
                }
                $section->questions()->sync($sync);
            }
        }
    }

    private function seedStagedTest($courses, $questionsBySubject): void
    {
        // Sequential pass-gated stages, built for two other representative
        // courses.
        foreach (['issb-complete-prep', 'navy-complete-prep'] as $slug) {
            $course = $courses[$slug] ?? null;
            if (! $course) {
                continue;
            }

            $staged = StagedTest::updateOrCreate(['course_id' => $course->id, 'title' => "{$course->target_exam_name} Staged Assessment"], [
                'target_exam_name' => $course->target_exam_name,
                'is_active' => true,
            ]);

            $stages = [
                'Stage 1: Verbal IQ' => $questionsBySubject['Intelligence / IQ'] ?? collect(),
                'Stage 2: Academic Knowledge' => $questionsBySubject['Pakistan Studies'] ?? collect(),
            ];
            $order = 1;
            foreach ($stages as $name => $pool) {
                $stage = StagedTestStage::updateOrCreate(['staged_test_id' => $staged->id, 'name' => $name], [
                    'order' => $order++,
                    'duration_minutes' => 15,
                    'pass_threshold_percent' => 50,
                    'marks_per_question' => 1,
                    'negative_marking' => 0,
                ]);
                $sync = [];
                foreach ($pool->values() as $i => $question) {
                    $sync[$question->id] = ['order' => $i + 1];
                }
                $stage->questions()->sync($sync);
            }
        }
    }

    private function seedDemoQuiz($questionsBySubject): void
    {
        $quiz = DemoQuiz::updateOrCreate(['title' => 'Sample Aptitude Demo'], [
            'duration_minutes' => 10,
            'shuffle_questions' => true,
            'is_active' => true,
        ]);

        $pool = ($questionsBySubject['Intelligence / IQ'] ?? collect())
            ->concat($questionsBySubject['General Science'] ?? collect())
            ->concat($questionsBySubject['Current Affairs'] ?? collect());

        $sync = [];
        foreach ($pool->values() as $i => $question) {
            $sync[$question->id] = ['order' => $i + 1];
        }
        $quiz->questions()->sync($sync);
    }

    /**
     * A few extra demo student accounts purely to author reviews/testimonials
     * under a real name rather than everything being attributed to the same
     * one seeded student -- same "clearly a placeholder" convention as the
     * rest of this seeder, just extended to reviewer identities since
     * CourseReview/Testimonial need a real users.id to belong to.
     */
    private function seedDemoReviewers(): \Illuminate\Support\Collection
    {
        $names = ['Ayesha Khan', 'Bilal Raza', 'Sana Malik'];

        return collect($names)->map(function ($name, $i) {
            $user = User::updateOrCreate(
                ['email' => 'demo.reviewer'.($i + 1).'@example.com'],
                ['name' => $name, 'user_type' => 'student', 'password' => bcrypt('password'), 'email_verified_at' => now()],
            );
            $user->assignRole('student');

            return $user;
        });
    }

    private function seedReviews($courses, $reviewers): void
    {
        $reviewData = [
            ['lcc-complete-prep', 0, 5, 'Structured and easy to follow. The practice tests really helped me understand the pattern.'],
            ['lcc-complete-prep', 1, 4, 'Good course overall, would like more video lectures though.'],
            ['pma-complete-prep', 1, 5, 'Excellent guidance from the instructor. Highly recommended for PMA aspirants.'],
            ['issb-complete-prep', 2, 5, 'The mock exams felt very close to the real test experience.'],
            ['navy-complete-prep', 0, 4, 'Solid content, notes were especially helpful for quick revision.'],
            ['air-force-complete-prep', 2, 5, 'Clear explanations and a well-organized syllabus.'],
        ];

        foreach ($reviewData as [$slug, $reviewerIndex, $rating, $text]) {
            $course = $courses[$slug] ?? null;
            if (! $course) {
                continue;
            }
            CourseReview::updateOrCreate(
                ['course_id' => $course->id, 'user_id' => $reviewers[$reviewerIndex]->id],
                ['rating' => $rating, 'review_text' => $text, 'status' => 'approved'],
            );
        }
    }

    private function seedTestimonials($courses, $reviewers): void
    {
        $testimonials = [
            ['Ayesha Khan', 'lcc-complete-prep', 5, 'This platform made my LCC preparation so much easier. The guaranteed notes were a lifesaver before the test.'],
            ['Bilal Raza', 'pma-complete-prep', 5, 'Cleared my PMA test on the first attempt thanks to the structured mock exams here.'],
            ['Sana Malik', 'issb-complete-prep', 4, 'Great question bank and very responsive support team whenever I had questions.'],
            ['Ali Hassan', 'navy-complete-prep', 5, 'The staged tests helped me identify exactly where I was weak before the real exam.'],
        ];

        foreach ($testimonials as $i => [$name, $slug, $rating, $text]) {
            Testimonial::updateOrCreate(['student_name' => $name], [
                'course_id' => $courses[$slug]->id ?? null,
                'testimonial_text' => $text,
                'rating' => $rating,
                'is_featured' => $i < 2,
                'order' => $i + 2, // +2 to sit after the original "Sample Testimonial"
            ]);
        }
    }

    private function seedHallOfFame($courses): void
    {
        $entries = [
            ['Ayesha Khan', 'lcc-complete-prep', 'Selected for Lady Cadet Course, 2025 batch.'],
            ['Bilal Raza', 'pma-complete-prep', 'Cleared PMA Long Course entry test on first attempt.'],
            ['Sana Malik', 'issb-complete-prep', 'Recommended by ISSB board after structured preparation.'],
            ['Ali Hassan', 'navy-complete-prep', 'Selected for Pakistan Navy commission entry.'],
        ];

        foreach ($entries as $i => [$name, $slug, $achievement]) {
            HallOfFame::updateOrCreate(['name' => $name], [
                'achievement_text' => $achievement,
                'course_id' => $courses[$slug]->id ?? null,
                'order' => $i + 1,
                'is_active' => true,
            ]);
        }
    }

    /**
     * The credentials handed to the client (student@example.com) should
     * land on a populated dashboard, not an all-zeros empty state -- one
     * active enrollment with real progress, one pending enrollment (shows
     * the checkout-verification flow), a revision item, and an unread
     * notification.
     */
    private function seedDemoStudentExperience($courses): void
    {
        $student = User::where('email', 'student@example.com')->first();
        if (! $student) {
            return;
        }

        $lcc = $courses['lcc-complete-prep'] ?? null;
        $pma = $courses['pma-complete-prep'] ?? null;

        if ($lcc) {
            $enrollment = Enrollment::updateOrCreate(
                ['user_id' => $student->id, 'course_id' => $lcc->id],
                ['status' => 'active', 'activated_at' => now()->subDays(10), 'package_id' => $lcc->packages()->first()?->id],
            );
            $student->update(['target_exam_name' => $lcc->target_exam_name, 'target_exam_date' => now()->addDays(30)]);

            // Mark the first lesson complete so progress isn't 0%.
            $firstLesson = Lesson::where('course_id', $lcc->id)->orderBy('order')->first();
            if ($firstLesson) {
                LessonProgress::updateOrCreate(
                    ['user_id' => $student->id, 'lesson_id' => $firstLesson->id],
                    ['is_completed' => true, 'completed_at' => now()->subDays(2)],
                );
            }
        }

        if ($pma) {
            // Pending enrollment -- demonstrates the checkout/verification
            // flow's "Awaiting activation" state without an admin action.
            Enrollment::updateOrCreate(
                ['user_id' => $student->id, 'course_id' => $pma->id],
                ['status' => 'pending', 'package_id' => $pma->packages()->first()?->id],
            );
        }

        $sampleQuestion = QuestionBank::first();
        if ($sampleQuestion) {
            RevisionListItem::updateOrCreate(
                ['user_id' => $student->id, 'question_id' => $sampleQuestion->id],
                ['times_wrong' => 1, 'resolved' => false, 'last_wrong_at' => now()->subDay()],
            );
        }

        if (! $student->unreadNotifications()->exists()) {
            // Use the real notification path (AdminBroadcastNotification via
            // a NotificationBroadcast row) rather than a raw table insert,
            // so the shape ({broadcast_id, title, body}) matches what the
            // student-facing Notifications page actually expects.
            $broadcast = \App\Models\NotificationBroadcast::updateOrCreate(
                ['title' => 'Welcome to Lion Forces Academy'],
                [
                    'body' => 'Your demo account has been set up with sample courses -- explore your dashboard to get started.',
                    'target_type' => 'all',
                    'sent_by' => User::where('user_type', 'admin')->value('id'),
                    'recipient_count' => 1,
                    'sent_at' => now(),
                ],
            );
            $student->notify(new \App\Notifications\AdminBroadcastNotification($broadcast));
        }
    }
}
