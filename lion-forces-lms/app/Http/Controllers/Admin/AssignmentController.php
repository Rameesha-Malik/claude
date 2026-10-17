<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Course $course): Response
    {
        return Inertia::render('Admin/Assignments/Index', [
            'course' => $course->only('id', 'title'),
            'assignments' => $course->assignments()->withCount([
                'submissions',
                'submissions as ungraded_count' => fn ($q) => $q->where('status', 'submitted'),
            ])->get(),
            'sections' => $course->sections()->get(['id', 'title']),
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $data = $this->validateAssignment($request);

        $course->assignments()->create($data + ['order' => $course->assignments()->max('order') + 1]);

        return back()->with('success', 'Assignment added.');
    }

    public function update(Request $request, Course $course, Assignment $assignment)
    {
        $assignment->update($this->validateAssignment($request));

        return back()->with('success', 'Assignment updated.');
    }

    public function destroy(Course $course, Assignment $assignment)
    {
        $assignment->submissions->each(function ($s) {
            if ($s->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($s->file_path);
            }
        });
        $assignment->delete();

        return back()->with('success', 'Assignment removed.');
    }

    public function submissions(Course $course, Assignment $assignment): Response
    {
        return Inertia::render('Admin/Assignments/Submissions', [
            'assignment' => $assignment->only('id', 'title', 'max_marks', 'course_id'),
            'course' => $assignment->course()->first(['id', 'title']),
            'submissions' => $assignment->submissions()->with('user:id,name,email')->latest('submitted_at')->get(),
        ]);
    }

    public function grade(Request $request, Course $course, AssignmentSubmission $submission)
    {
        $data = $request->validate([
            'marks_awarded' => 'nullable|integer|min:0|max:'.($submission->assignment->max_marks ?? 1000),
            'feedback' => 'nullable|string|max:2000',
        ]);

        $submission->update($data + [
            'status' => 'graded',
            'graded_by' => $request->user()->id,
            'graded_at' => now(),
        ]);

        return back()->with('success', 'Submission graded.');
    }

    private function validateAssignment(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'instructions' => 'nullable|string|max:5000',
            'max_marks' => 'nullable|integer|min:1',
            'due_date' => 'nullable|date',
            'section_id' => 'nullable|exists:course_sections,id',
            'is_active' => 'boolean',
        ]);
    }
}
