<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Content managers" -- team members who can add or edit content in
 * assigned courses only. Narrower than the existing Settings > Staff
 * roles (owner/staff): a content manager can't manage students,
 * enrollments, or settings (enforced by RestrictContentManagers
 * middleware) and is scoped to specific courses (enforced in
 * CourseController via User::canManageCourse()). Owner-only to manage,
 * same convention as Settings' staff accounts.
 */
class ContentManagerController extends Controller
{
    public function index(Request $request): Response
    {
        $managers = User::role('content_manager')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->with('managedCourses:id,title')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/ContentManagers/Index', [
            'managers' => $managers,
            'courses' => Course::orderBy('title')->get(['id', 'title']),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage content managers.');

        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::defaults()],
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $manager = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'user_type' => 'admin',
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('content_manager');
        $manager->managedCourses()->sync($data['course_ids'] ?? []);

        return back()->with('success', 'Content manager added.');
    }

    public function updateCourses(Request $request, User $manager)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage content managers.');
        abort_unless($manager->hasRole('content_manager'), 404);

        $data = $request->validate(['course_ids' => 'nullable|array', 'course_ids.*' => 'exists:courses,id']);
        $manager->managedCourses()->sync($data['course_ids'] ?? []);

        return back()->with('success', 'Permissions updated.');
    }

    public function destroy(Request $request, User $manager)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage content managers.');
        abort_unless($manager->hasRole('content_manager'), 404);

        $manager->delete();

        return back()->with('success', 'Content manager removed.');
    }
}
