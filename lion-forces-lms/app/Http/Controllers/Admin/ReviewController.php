<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
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
        ]);
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
