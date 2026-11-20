<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SavedQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client (WhatsApp): "Mcqs -- Favourite / Wrongs / Mcq Notes" listed as
 * three student-dashboard sections, referencing the old site. "Wrongs"
 * already existed here as Revision List; the star toggle for favouriting
 * a question (QuestionCheckController::toggleFavourite) has existed since
 * earlier this session too, but only the admin could see everyone's
 * favourites in one place -- a student had no page of their own to review
 * questions they'd starred. This is that page, reading the same
 * SavedQuestion rows the admin's Favourite Questions list already reads.
 */
class FavouriteQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        $favourites = SavedQuestion::where('user_id', $request->user()->id)
            ->with(['question.options', 'question.subject:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Student/FavouriteQuestions/Index', [
            'favourites' => $favourites,
        ]);
    }
}
