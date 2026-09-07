<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\TestAttempt;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $students = User::where('user_type', 'student');

        return Inertia::render('Admin/Dashboard', [
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
