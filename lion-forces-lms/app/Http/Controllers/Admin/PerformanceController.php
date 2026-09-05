<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\TestAttempt;
use App\Models\TestAttemptAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Per-student deep dive: quiz score trend, per-course scores, lecture/
 * course completion, and a simple weighted "overall score" used to rank
 * students against each other. Everything here is computed live from
 * data already recorded elsewhere (TestAttempt, LessonProgress,
 * Enrollment) -- no new schema, no separate analytics table to keep in
 * sync.
 */
class PerformanceController extends Controller
{
    public function index(Request $request): Response
    {
        $students = User::where('user_type', 'student')->orderBy('name')->get(['id', 'name', 'email']);
        $studentId = (int) ($request->student_id ?? $students->first()?->id ?? 0);
        $student = $students->firstWhere('id', $studentId);

        if (! $student) {
            return Inertia::render('Admin/Performance/Index', [
                'students' => $students,
                'selectedStudentId' => null,
                'data' => null,
            ]);
        }

        $attempts = TestAttempt::where('user_id', $studentId)->where('status', 'submitted')
            ->with('attemptable.course:id,title')
            ->orderBy('created_at')
            ->get();

        $avgScore = round($attempts->avg('percentage') ?? 0, 1);
        $passRate = $attempts->count() > 0 ? round($attempts->where('passed', true)->count() / $attempts->count() * 100, 1) : 0;

        $scoreByCourse = $attempts->groupBy(fn ($a) => $a->attemptable?->course?->title ?? 'Other')
            ->map(fn ($group, $title) => ['course' => $title, 'avg' => round($group->avg('percentage'), 1)])
            ->values();

        $enrollments = Enrollment::where('user_id', $studentId)->with('course.lessons:id,course_id')->get();
        $coursesEnrolled = $enrollments->count();
        $totalLessons = 0;
        $completedLessons = 0;
        $completedCourses = 0;
        foreach ($enrollments as $enrollment) {
            $lessonIds = $enrollment->course?->lessons->pluck('id') ?? collect();
            $total = $lessonIds->count();
            $done = $total > 0
                ? LessonProgress::where('user_id', $studentId)->whereIn('lesson_id', $lessonIds)->where('is_completed', true)->count()
                : 0;
            $totalLessons += $total;
            $completedLessons += $done;
            if ($total > 0 && $done === $total) {
                $completedCourses++;
            }
        }
        $lecturePercent = $totalLessons > 0 ? round($completedLessons / $totalLessons * 100, 1) : 0;
        $courseCompletionPercent = $coursesEnrolled > 0 ? round($completedCourses / $coursesEnrolled * 100, 1) : 0;

        $overallScore = round(($avgScore + $passRate + $lecturePercent + $courseCompletionPercent) / 4, 1);

        // Weekly attempt counts, last 6 weeks -- a lightweight activity
        // pulse rather than a full year-long histogram (Leaderboard's
        // monthly chart already covers the bigger picture).
        $attemptsPerWeek = collect(range(5, 0))->map(function ($i) use ($attempts) {
            $start = now()->subWeeks($i)->startOfWeek();
            $end = now()->subWeeks($i)->endOfWeek();

            return [
                'label' => $start->format('M j'),
                'count' => $attempts->filter(fn ($a) => $a->created_at->between($start, $end))->count(),
            ];
        })->values();

        // Strong/weak subjects -- from every answer across this student's
        // attempts, grouped by the question's subject.
        $answers = TestAttemptAnswer::whereIn('attempt_id', $attempts->pluck('id'))->with('question.subject:id,name')->get();
        $bySubject = $answers->groupBy(fn ($a) => $a->question?->subject?->name ?? 'General')
            ->map(function ($group, $subject) {
                $total = $group->count();
                $correct = $group->where('is_correct', true)->count();

                return ['subject' => $subject, 'accuracy' => $total > 0 ? round($correct / $total * 100, 1) : 0, 'total' => $total];
            })
            ->values();
        $strongPoints = $bySubject->filter(fn ($s) => $s['accuracy'] >= 70)->sortByDesc('accuracy')->values();
        $weakPoints = $bySubject->filter(fn ($s) => $s['accuracy'] < 50)->sortBy('accuracy')->values();

        // Rank/percentile against every other student, on the same
        // overall-score formula so it matches the headline number above.
        $allScores = $students->map(fn ($s) => ['user_id' => $s->id, 'score' => $s->id === $studentId ? $overallScore : $this->overallScoreFor($s->id)])
            ->sortByDesc('score')
            ->values();
        $rank = $allScores->search(fn ($row) => $row['user_id'] === $studentId) + 1;
        $total = $allScores->count();
        $percentile = $total > 1 ? round(($total - $rank) / ($total - 1) * 100, 1) : 0;
        $systemAverage = round(TestAttempt::where('status', 'submitted')->avg('percentage') ?? 0, 1);

        return Inertia::render('Admin/Performance/Index', [
            'students' => $students,
            'selectedStudentId' => $studentId,
            'data' => [
                'student' => $student,
                'overall_score' => $overallScore,
                'avg_score' => $avgScore,
                'pass_rate' => $passRate,
                'lecture_percent' => $lecturePercent,
                'course_completion_percent' => $courseCompletionPercent,
                'rank' => $rank,
                'total_students' => $total,
                'percentile' => $percentile,
                'system_average' => $systemAverage,
                'quiz_score_trend' => $attempts->map(fn ($a) => ['date' => $a->created_at->format('M j'), 'score' => (float) $a->percentage])->values(),
                'score_by_course' => $scoreByCourse,
                'course_completion' => ['completed' => $completedCourses, 'in_progress' => $coursesEnrolled - $completedCourses],
                'lectures' => ['completed' => $completedLessons, 'total' => $totalLessons],
                'attempts_per_week' => $attemptsPerWeek,
                'quizzes_attempted' => $attempts->count(),
                'courses_enrolled' => $coursesEnrolled,
                'courses_completed' => $completedCourses,
                'strong_points' => $strongPoints,
                'weak_points' => $weakPoints,
            ],
        ]);
    }

    private function overallScoreFor(int $userId): float
    {
        $attempts = TestAttempt::where('user_id', $userId)->where('status', 'submitted')->get(['id', 'percentage', 'passed']);
        $avgScore = $attempts->avg('percentage') ?? 0;
        $passRate = $attempts->count() > 0 ? $attempts->where('passed', true)->count() / $attempts->count() * 100 : 0;

        $enrollments = Enrollment::where('user_id', $userId)->with('course.lessons:id,course_id')->get();
        $coursesEnrolled = $enrollments->count();
        $totalLessons = 0;
        $completedLessons = 0;
        $completedCourses = 0;
        foreach ($enrollments as $enrollment) {
            $lessonIds = $enrollment->course?->lessons->pluck('id') ?? collect();
            $total = $lessonIds->count();
            $done = $total > 0
                ? LessonProgress::where('user_id', $userId)->whereIn('lesson_id', $lessonIds)->where('is_completed', true)->count()
                : 0;
            $totalLessons += $total;
            $completedLessons += $done;
            if ($total > 0 && $done === $total) {
                $completedCourses++;
            }
        }
        $lecturePercent = $totalLessons > 0 ? $completedLessons / $totalLessons * 100 : 0;
        $courseCompletionPercent = $coursesEnrolled > 0 ? $completedCourses / $coursesEnrolled * 100 : 0;

        return round(($avgScore + $passRate + $lecturePercent + $courseCompletionPercent) / 4, 1);
    }
}
