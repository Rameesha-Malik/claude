<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePackage;
use App\Models\NotificationBroadcast;
use App\Models\User;
use App\Notifications\AdminBroadcastNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Notifications/Index', [
            'broadcasts' => NotificationBroadcast::with(['targetCourse:id,title', 'targetPackage:id,name', 'sender:id,name'])
                ->latest()
                ->get(),
            'courses' => Course::orderBy('title')->get(['id', 'title']),
            'packages' => CoursePackage::orderBy('name')->get(['id', 'name', 'course_id']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:2000',
            'target_type' => 'required|in:all,course,package',
            'target_course_id' => 'nullable|required_if:target_type,course|exists:courses,id',
            'target_package_id' => 'nullable|required_if:target_type,package|exists:course_packages,id',
        ]);

        $recipients = match ($data['target_type']) {
            'course' => User::whereHas('enrollments', fn ($q) => $q->where('course_id', $data['target_course_id'])->where('status', 'active'))->get(),
            'package' => User::whereHas('enrollments', fn ($q) => $q->where('package_id', $data['target_package_id'])->where('status', 'active'))->get(),
            default => User::where('user_type', 'student')->where('is_active', true)->get(),
        };

        $broadcast = NotificationBroadcast::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'target_type' => $data['target_type'],
            'target_course_id' => $data['target_course_id'] ?? null,
            'target_package_id' => $data['target_package_id'] ?? null,
            'sent_by' => $request->user()->id,
            'recipient_count' => $recipients->count(),
            'sent_at' => now(),
        ]);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new AdminBroadcastNotification($broadcast));
        }

        return back()->with('success', "Sent to {$recipients->count()} student(s).");
    }
}
