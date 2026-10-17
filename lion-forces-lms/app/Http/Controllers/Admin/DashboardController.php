<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\QuestionBank;
use App\Models\TestAttempt;
use App\Models\TestAttemptAnswer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $students = User::where('user_type', 'student');

        // Client, from a UWorld QBank screenshot shown in a meeting: he
        // wants a dashboard that surfaces "important things" -- for admin
        // that reads as bank health (is the question bank actually being
        // used, and where) plus an actionable signal (which questions are
        // most often getting missed), not just enrollment/revenue numbers.
        $answered = TestAttemptAnswer::whereNotNull('is_correct');
        $correctCount = (clone $answered)->where('is_correct', true)->count();
        $totalAnswered = (clone $answered)->count();

        $mostMissed = TestAttemptAnswer::where('is_correct', false)
            ->select('question_id', DB::raw('count(*) as wrong_count'))
            ->groupBy('question_id')
            ->orderByDesc('wrong_count')
            ->limit(5)
            ->with('question:id,question_text')
            ->get()
            ->filter(fn ($row) => $row->question !== null)
            ->map(fn ($row) => ['question_text' => $row->question->question_text, 'wrong_count' => $row->wrong_count])
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'questionBank' => [
                'total_questions' => QuestionBank::count(),
                'platform_accuracy' => $totalAnswered > 0 ? round($correctCount / $totalAnswered * 100, 1) : null,
                'total_answered' => $totalAnswered,
            ],
            'mostMissedQuestions' => $mostMissed,
            'stats' => [
                'total_students' => (clone $students)->count(),
                'active_students' => (clone $students)->where('is_active', true)->count(),
                'new_this_week' => (clone $students)->where('created_at', '>=', now()->subWeek())->count(),
                'total_courses' => Course::count(),
                'total_enrollments' => Enrollment::count(),
                'recent_payments_total' => Payment::where('status', 'verified')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->sum('amount'),
                'pending_payments' => Payment::where('status', 'pending')->count(),
                'recent_attempts' => TestAttempt::where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'recentEnrollments' => Enrollment::with(['user:id,name,email', 'course:id,title'])
                ->latest()
                ->limit(6)
                ->get(),
            'recentPayments' => Payment::with('enrollment.user:id,name')
                ->latest()
                ->limit(6)
                ->get(['id', 'enrollment_id', 'amount', 'method', 'status', 'created_at']),
            'popularCourses' => Course::withCount('enrollments')
                ->orderByDesc('enrollments_count')
                ->limit(5)
                ->get(['id', 'title'])
                ->map(fn ($c) => ['title' => $c->title, 'enrollments' => $c->enrollments_count]),
        ]);
    }
}
