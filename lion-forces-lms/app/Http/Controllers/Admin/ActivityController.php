<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Who added or edited course content, and when." Logged from
 * CourseController (Course/Topic/Lecture) and ContentLibraryController
 * (MCQ/Note) via ActivityLog::record() -- see app/Models/ActivityLog.php.
 */
class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ActivityLog::with(['user:id,name', 'course:id,title'])
            ->when($request->course_id, fn ($q, $v) => $q->where('course_id', $v))
            ->when($request->subject_type, fn ($q, $v) => $q->where('subject_type', $v))
            ->when($request->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->date_from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Activity/Index', [
            'logs' => $logs,
            'courses' => Course::orderBy('title')->get(['id', 'title']),
            'users' => User::whereIn('id', ActivityLog::query()->distinct()->pluck('user_id'))->get(['id', 'name']),
            'filters' => $request->only(['course_id', 'subject_type', 'user_id', 'date_from', 'date_to']),
        ]);
    }
}
