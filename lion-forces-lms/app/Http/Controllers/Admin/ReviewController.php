<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => CourseReview::with(['course:id,title', 'user:id,name'])
                ->latest()
                ->get(),
            'courses' => Course::orderBy('title')->get(['id', 'title']),
        ]);
    }

    // "+ Add review" (admin reference screenshot): a student gave feedback
    // outside the site (WhatsApp, email, in person) and the admin wants it
    // to show alongside site-submitted reviews -- auto-approved since an
    // admin is entering it directly, unlike the student-submitted flow
    // which always starts 'pending'.
    public function store(Request $request)
    {
        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'student_email' => 'required|email',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:2000',
        ]);

        $student = User::where('email', $data['student_email'])->where('user_type', 'student')->first();
        abort_unless($student, 404, 'No student found with that email.');

        CourseReview::updateOrCreate(
            ['course_id' => $data['course_id'], 'user_id' => $student->id],
            ['rating' => $data['rating'], 'review_text' => $data['review_text'] ?? null, 'status' => 'approved'],
        );

        return back()->with('success', 'Review added.');
    }

    public function approve(CourseReview $review)
    {
        $review->update(['status' => 'approved']);

        return back()->with('success', 'Review approved and now visible on the course page.');
    }

    public function hide(CourseReview $review)
    {
        $review->update(['status' => 'hidden']);

        return back()->with('success', 'Review hidden from the course page.');
    }

    public function destroy(CourseReview $review)
    {
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }
}
