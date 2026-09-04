<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = User::where('user_type', 'student')
            ->withCount('enrollments')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($request->status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->status === 'suspended', fn ($q) => $q->where('is_active', false))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $student): Response
    {
        abort_unless($student->user_type === 'student', 404);

        $student->load(['enrollments.course.category', 'enrollments.package', 'enrollments.payments']);

        return Inertia::render('Admin/Students/Show', [
            'student' => $student,
            'courses' => Course::where('status', 'published')->orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function toggleSuspend(User $student)
    {
        abort_unless($student->user_type === 'student', 404);

        $student->update([
            'is_active' => ! $student->is_active,
            'suspended_at' => $student->is_active ? now() : null,
        ]);

        return back()->with('success', $student->is_active ? 'Student reactivated.' : 'Student suspended.');
    }

    public function enroll(Request $request, User $student)
    {
        abort_unless($student->user_type === 'student', 404);

        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'package_id' => 'nullable|exists:course_packages,id',
        ]);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $data['course_id'],
            'package_id' => $data['package_id'] ?? null,
        ]);
        $enrollment->activate();

        return back()->with('success', 'Student enrolled.');
    }

    public function updateEnrollmentStatus(Request $request, Enrollment $enrollment)
    {
        $data = $request->validate(['status' => 'required|in:pending,active,suspended,expired']);

        if ($data['status'] === 'active') {
            $enrollment->activate();
        } else {
            $enrollment->update(['status' => $data['status']]);
        }

        return back()->with('success', 'Enrollment status updated.');
    }
}
