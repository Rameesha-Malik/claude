<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AssignmentController extends Controller
{
    public function submit(Request $request, Assignment $assignment)
    {
        $enrolled = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $assignment->course_id)
            ->active()
            ->exists();
        abort_unless($enrolled, 403);

        $data = $request->validate([
            'submission_text' => 'nullable|string|max:10000',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:20480',
        ]);
        // Was a plain abort(422, ...) -- that throws a raw HttpException with
        // no redirect-back behaviour, so it crashed out of the Inertia SPA
        // to Laravel's bare error page instead of showing on the form the
        // student is already looking at. ValidationException is what
        // $request->validate() throws for every other failure here, so
        // this one now behaves identically: redirect back, error in the
        // same form.errors bag the page already renders.
        if (empty($data['submission_text']) && ! $request->hasFile('file')) {
            throw ValidationException::withMessages(['submission_text' => 'Submit some text or a file.']);
        }

        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $request->user()->id)
            ->first();

        // Resubmitting (before or after grading) replaces the previous
        // attempt and clears any prior grade -- the admin sees the new
        // work, not stale marks against a since-changed submission.
        if ($existing?->file_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($existing->file_path);
        }

        $filePath = $request->hasFile('file') ? $request->file('file')->store('assignment-submissions', 'public') : $existing?->file_path;

        AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'user_id' => $request->user()->id],
            [
                'submission_text' => $data['submission_text'] ?? null,
                'file_path' => $filePath,
                'status' => 'submitted',
                'marks_awarded' => null,
                'feedback' => null,
                'graded_by' => null,
                'graded_at' => null,
                'submitted_at' => now(),
            ],
        );

        return back()->with('success', 'Assignment submitted.');
    }
}
