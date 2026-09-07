<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SavedQuestion;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Favourite questions" (admin reference screenshot). Reads the existing
 * SavedQuestion model -- toggled by students via
 * QuestionCheckController::toggleFavourite -- there is no separate
 * "favourite" concept to build, just the admin view onto it.
 *
 * The reference filters by "Course", but question_bank has no course_id
 * (only subject_id/category_id -- questions are shared across whichever
 * quizzes/tests pull from a subject, not owned by one course) -- filters
 * by Subject instead, the closest real scope a question actually has.
 */
class FavouriteQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $subjectId = $request->get('subject_id');

        return Inertia::render('Admin/FavouriteQuestions/Index', [
            'favourites' => SavedQuestion::with(['question:id,question_text,subject_id', 'question.subject:id,name', 'user:id,name,email'])
                ->when($search, function ($q, $s) {
                    $q->where(function ($q2) use ($s) {
                        $q2->whereHas('question', fn ($q3) => $q3->where('question_text', 'like', "%{$s}%")->orWhere('id', $s))
                            ->orWhereHas('user', fn ($q3) => $q3->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
                    });
                })
                ->when($subjectId, fn ($q) => $q->whereHas('question', fn ($q2) => $q2->where('subject_id', $subjectId)))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search, 'subject_id' => $subjectId],
        ]);
    }
}
