<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SavedQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Favourite questions" (admin reference screenshot). Reads the existing
 * SavedQuestion model -- toggled by students via
 * QuestionCheckController::toggleFavourite -- there is no separate
 * "favourite" concept to build, just the admin view onto it.
 */
class FavouriteQuestionController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/FavouriteQuestions/Index', [
            'favourites' => SavedQuestion::with(['question:id,question_text,subject_id', 'question.subject:id,name', 'user:id,name,email'])
                ->latest()
                ->paginate(15),
        ]);
    }
}
