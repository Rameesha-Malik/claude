<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = $request->user()->enrollments()
            ->with(['course.category', 'package'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Student/MyCourses', ['enrollments' => $enrollments]);
    }

    public function show(Request $request, Course $course): Response
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        // A pending/suspended/expired enrollment is a real, expected state
        // (e.g. just submitted payment, awaiting verification) -- distinct
        // from a 404, which should stay reserved for "not enrolled at all".
        // isActive() (not the raw status column) is what actually gates
        // access here -- an enrollment can still say status: active in the
        // database past its package's validity_days if nothing has flipped
        // it to 'expired' yet, and content access must not outlive that.
        if (! $enrollment || ! $enrollment->isActive()) {
            return Inertia::render('Student/CourseLearning', [
                'course' => $course->only('title'),
                'enrollmentStatus' => $enrollment && ! $enrollment->isActive() && $enrollment->status === 'active'
                    ? 'expired'
                    : $enrollment?->status ?? null,
            ]);
        }

        $user = $request->user();

        $course->load([
            'lessons' => fn ($q) => $q->orderBy('order'),
            'sections' => fn ($q) => $q->orderBy('order')->with(['lessons' => fn ($q2) => $q2->orderBy('order')]),
            'sharedNotes',
            'instructor',
            'practiceTests' => fn ($q) => $q->where('is_active', true)->withCount('questions'),
            'quizzes' => fn ($q) => $q->where('is_active', true)->withCount('questions'),
            'mockExams' => fn ($q) => $q->where('is_active', true)->withCount('sections'),
            'stagedTests' => fn ($q) => $q->where('is_active', true)->withCount('stages'),
            'flashcards' => fn ($q) => $q->where('status', 'approved'),
            'assignments' => fn ($q) => $q->where('is_active', true)->with(['submissions' => fn ($q2) => $q2->where('user_id', $user->id)]),
            'approvedReviews',
        ]);
        $course->loadCount(['enrollments' => fn ($q) => $q->where('status', 'active')]);
        $this->attachLatestAttempts($course, $user->id);

        // Personal/Guaranteed notes: assigned directly to this student, or
        // to the package they're enrolled under.
        $personalNotes = \App\Models\NoteAssignment::where(function ($q) use ($user, $enrollment) {
            $q->where('assignable_type', \App\Models\User::class)->where('assignable_id', $user->id);
            if ($enrollment->package_id) {
                $q->orWhere(function ($q2) use ($enrollment) {
                    $q2->where('assignable_type', \App\Models\CoursePackage::class)->where('assignable_id', $enrollment->package_id);
                });
            }
        })->with('note')->get()->pluck('note');

        $lessonProgress = $user->lessonProgress()
            ->whereIn('lesson_id', $course->lessons->pluck('id'))
            ->get()
            ->keyBy('lesson_id');

        $questions = \App\Models\CourseQuestion::where('course_id', $course->id)
            ->where('user_id', $user->id) // private 1:1 — only this student's own thread
            ->with('replies.admin:id,name')
            ->latest()
            ->get();

        $myReview = CourseReview::where('course_id', $course->id)->where('user_id', $user->id)->first();

        return Inertia::render('Student/CourseLearning', [
            'course' => $course,
            'enrollment' => $enrollment,
            'personalNotes' => $personalNotes,
            'lessonProgress' => $lessonProgress,
            'questions' => $questions,
            'myReview' => $myReview,
        ]);
    }

    // Attaches each test/quiz's most recent *submitted* attempt id (or null)
    // so the frontend can offer a "View Results" link alongside "Start" --
    // previously a finished attempt's result page was only reachable once,
    // right after submission, with no way to come back and review it later.
    private function attachLatestAttempts(Course $course, int $userId): void
    {
        $groups = [
            \App\Models\PracticeTest::class => $course->practiceTests,
            \App\Models\Quiz::class => $course->quizzes,
            \App\Models\MockExam::class => $course->mockExams,
            \App\Models\StagedTest::class => $course->stagedTests,
        ];

        foreach ($groups as $type => $items) {
            if ($items->isEmpty()) {
                continue;
            }

            $latestByAttemptable = \App\Models\TestAttempt::where('user_id', $userId)
                ->where('attemptable_type', $type)
                ->whereIn('attemptable_id', $items->pluck('id'))
                ->where('status', 'submitted')
                ->orderByDesc('submitted_at')
                ->get(['id', 'attemptable_id'])
                ->unique('attemptable_id')
                ->keyBy('attemptable_id');

            $items->each(function ($item) use ($latestByAttemptable) {
                $item->latest_attempt_id = $latestByAttemptable->get($item->id)?->id;
            });
        }
    }

    public function submitReview(Request $request, Course $course)
    {
        Enrollment::where('user_id', $request->user()->id)->where('course_id', $course->id)->where('status', 'active')->firstOrFail();

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        // Editing an existing review sends it back to pending -- moderation
        // applies to the current content, not just the first submission.
        CourseReview::updateOrCreate(
            ['course_id' => $course->id, 'user_id' => $request->user()->id],
            ['rating' => $data['rating'], 'review_text' => $data['review_text'] ?? null, 'status' => 'pending'],
        );

        return back()->with('success', 'Thanks! Your review will appear once approved.');
    }

    public function markLessonComplete(Request $request, \App\Models\Lesson $lesson)
    {
        \App\Models\LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['is_completed' => true, 'completed_at' => now()],
        );

        return back();
    }

    public function askQuestion(Request $request, Course $course)
    {
        $data = $request->validate([
            'lesson_id' => 'nullable|exists:lessons,id',
            'question_text' => 'required|string|max:2000',
        ]);

        \App\Models\CourseQuestion::create([
            'course_id' => $course->id,
            'user_id' => $request->user()->id,
            'lesson_id' => $data['lesson_id'] ?? null,
            'question_text' => $data['question_text'],
        ]);

        return back()->with('success', 'Your question has been sent.');
    }
}
