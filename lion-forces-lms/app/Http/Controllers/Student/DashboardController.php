<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\NotificationBroadcast;
use App\Models\RevisionListItem;
use App\Models\SavedQuestion;
use App\Models\TestAttempt;
use App\Models\TestAttemptAnswer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Client, from a UWorld QBank reference shown in a meeting: wants
        // a dashboard that shows the student "what they need to know" --
        // their own accuracy/performance, not just course-completion %.
        $answered = TestAttemptAnswer::whereHas('attempt', fn ($q) => $q->where('user_id', $user->id))->whereNotNull('is_correct');
        $correctCount = (clone $answered)->where('is_correct', true)->count();
        $totalAnswered = (clone $answered)->count();

        $lastTest = TestAttempt::where('user_id', $user->id)
            ->where('status', 'submitted')
            ->whereNotNull('percentage')
            ->latest('submitted_at')
            ->first(['id', 'percentage', 'submitted_at']);

        $performance = [
            'questions_attempted' => $totalAnswered,
            'correct' => $correctCount,
            'incorrect' => $totalAnswered - $correctCount,
            'accuracy' => $totalAnswered > 0 ? round($correctCount / $totalAnswered * 100, 1) : null,
            'favourites' => SavedQuestion::where('user_id', $user->id)->count(),
            'sessions' => TestAttempt::where('user_id', $user->id)->where('status', 'submitted')->count(),
            'last_test_percentage' => $lastTest?->percentage,
        ];

        // Bar chart of the student's own daily question-answering activity
        // over the last 14 days -- a count, not a daily accuracy %, since
        // accuracy from just a handful of questions on a light day would
        // be noisy and misleading as a trend line.
        $activitySince = now()->subDays(13)->startOfDay();
        $answersByDay = TestAttemptAnswer::whereHas('attempt', fn ($q) => $q->where('user_id', $user->id))
            ->whereNotNull('is_correct')
            ->where('created_at', '>=', $activitySince)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');
        $activityTrend = collect(range(0, 13))->map(function (int $i) use ($activitySince, $answersByDay) {
            $date = $activitySince->copy()->addDays($i);
            return ['label' => $date->format('M j'), 'value' => (int) ($answersByDay[$date->format('Y-m-d')] ?? 0)];
        });

        $enrollments = $user->enrollments()
            ->where('status', 'active')
            ->with(['course.category', 'course.lessons', 'course.instructor'])
            ->get()
            ->map(function ($enrollment) use ($user) {
                $course = $enrollment->course;
                $totalLessons = $course->lessons->count();
                $completedLessons = $totalLessons > 0
                    ? $user->lessonProgress()
                        ->whereIn('lesson_id', $course->lessons->pluck('id'))
                        ->where('is_completed', true)
                        ->count()
                    : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'category' => $course->category?->name,
                    'instructor_name' => $course->instructor?->name,
                    'progress' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                    'completed_lessons' => $completedLessons,
                    'total_lessons' => $totalLessons,
                    'target_exam_name' => $user->target_exam_name ?? $course->target_exam_name,
                    'target_exam_date' => $user->target_exam_date ?? $course->target_exam_date,
                ];
            });

        // Real "what needs attention" items instead of decorative stat tiles --
        // the actual questions flagged for revision (worst-missed first), not
        // just the count that was already shown elsewhere on this page.
        $revisionItems = RevisionListItem::where('user_id', $user->id)
            ->where('resolved', false)
            ->with('question:id,question_text')
            ->orderByDesc('times_wrong')
            ->limit(4)
            ->get()
            ->filter(fn ($item) => $item->question !== null)
            ->map(fn ($item) => ['id' => $item->id, 'question_text' => $item->question->question_text, 'times_wrong' => $item->times_wrong])
            ->values();

        $nextExam = $enrollments
            ->filter(fn ($e) => $e['target_exam_date'] !== null && now()->lt($e['target_exam_date']))
            ->sortBy('target_exam_date')
            ->first();

        // Which course gets the highlighted "current" treatment on its card:
        // the one with the nearest upcoming exam, falling back to one that's
        // been started but not finished, then just the first enrollment.
        $currentCourseId = $nextExam['id']
            ?? $enrollments->first(fn ($e) => $e['progress'] > 0 && $e['progress'] < 100)['id']
            ?? $enrollments->first()['id']
            ?? null;
        $enrollments = $enrollments->map(fn ($e) => [...$e, 'is_current' => $e['id'] === $currentCourseId]);

        return Inertia::render('Student/Dashboard', [
            'enrollments' => $enrollments,
            'performance' => $performance,
            'activityTrend' => $activityTrend,
            'revisionCount' => RevisionListItem::where('user_id', $user->id)->where('resolved', false)->count(),
            'revisionItems' => $revisionItems,
            'nextExam' => $nextExam ? ['name' => $nextExam['target_exam_name'], 'date' => $nextExam['target_exam_date']] : null,
            'unreadNotifications' => $user->unreadNotifications()->limit(5)->get(['id', 'data', 'created_at']),
            'recentBroadcasts' => NotificationBroadcast::latest('sent_at')->limit(3)->get(['title', 'body', 'sent_at']),
        ]);
    }
}
