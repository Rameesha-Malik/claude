<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A dedicated "all enrollments" list -- previously an admin could only see
 * enrollments 6-at-a-time on the dashboard's "Recent Enrollments" table, or
 * per-student on the Students page. This is also where an admin enrolls a
 * student after confirming an offline payment (bank transfer/Easypaisa/
 * JazzCash proof sent outside the automated flow), and manages the
 * lifecycle of any enrollment: cancel, or remove entirely.
 */
class EnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = Enrollment::with(['user:id,name,email', 'course:id,title', 'package:id,name', 'payments' => fn ($q) => $q->latest()->limit(1)])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->course_id, fn ($q, $v) => $q->where('course_id', $v))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'user',
                fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            ))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Progress per row -- same lessons-completed calculation the
        // student dashboard uses, just run for whichever page of
        // enrollments is showing rather than one user's own list.
        $enrollments->getCollection()->transform(function (Enrollment $e) {
            $totalLessons = $e->course ? $e->course->lessons()->count() : 0;
            $completedLessons = $totalLessons > 0
                ? $e->user->lessonProgress()->whereIn('lesson_id', $e->course->lessons()->pluck('id'))->where('is_completed', true)->count()
                : 0;
            $payment = $e->payments->first();

            return [
                'id' => $e->id,
                'status' => $e->status,
                'assigned' => $e->package_id === null, // granted directly by an admin, not tied to a specific paid package
                'activated_at' => $e->activated_at,
                'expires_at' => $e->expires_at,
                'progress' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                'user' => $e->user?->only('name', 'email'),
                'course' => $e->course?->only('title'),
                'package' => $e->package?->only('name'),
                'payment' => $payment ? ['amount' => $payment->amount, 'proof_file_path' => $payment->proof_file_path] : null,
            ];
        });

        return Inertia::render('Admin/Enrollments/Index', [
            'enrollments' => $enrollments,
            'courses' => Course::orderBy('title')->get(['id', 'title'])
                ->map(fn ($c) => ['id' => $c->id, 'title' => $c->title, 'packages' => $c->packages()->where('is_active', true)->get(['id', 'name'])]),
            'filters' => $request->only(['status', 'course_id', 'search']),
        ]);
    }

    // Admin manually enrolling a student -- e.g. after confirming an
    // offline payment sent outside the automated bank-transfer flow.
    // Mirrors StudentController::enroll but reachable from this page
    // without navigating to a specific student first.
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'package_id' => 'nullable|exists:course_packages,id',
        ]);

        $student = User::where('id', $data['user_id'])->where('user_type', 'student')->firstOrFail();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $data['course_id'],
            'package_id' => $data['package_id'] ?? null,
        ]);
        $enrollment->activate();

        return back()->with('success', "Enrolled {$student->name}.");
    }

    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('success', 'Enrollment removed.');
    }

    // One round trip for "select several rows, cancel/remove them" instead
    // of the frontend firing one request per row. "cancel" here means
    // enrollments.status = 'suspended' -- the schema's actual enum is
    // pending/active/suspended/expired, there's no separate "cancelled"
    // state (see 2026_08_10_000008_create_enrollment_payment_tables.php).
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => 'required|in:cancel,delete',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:enrollments,id',
        ]);

        if ($data['action'] === 'cancel') {
            Enrollment::whereIn('id', $data['ids'])->update(['status' => 'suspended']);
        } else {
            Enrollment::whereIn('id', $data['ids'])->delete();
        }

        return back()->with('success', count($data['ids']).' enrollment(s) updated.');
    }
}
