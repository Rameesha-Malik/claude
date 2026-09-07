<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\NotificationBroadcast;
use App\Models\RevisionListItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $enrollments = $user->enrollments()
            ->where('status', 'active')
            ->with(['course.category', 'course.lessons'])
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
                    'progress' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                    'target_exam_name' => $user->target_exam_name ?? $course->target_exam_name,
                    'target_exam_date' => $user->target_exam_date ?? $course->target_exam_date,
                ];
            });

        return Inertia::render('Student/Dashboard', [
            'enrollments' => $enrollments,
            'revisionCount' => RevisionListItem::where('user_id', $user->id)->where('resolved', false)->count(),
            'unreadNotifications' => $user->unreadNotifications()->limit(5)->get(['id', 'data', 'created_at']),
            'recentBroadcasts' => NotificationBroadcast::latest('sent_at')->limit(3)->get(['title', 'body', 'sent_at']),
        ]);
    }
}
