<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuestionNote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Same gap as FavouriteQuestionController: the per-question note a student
 * can write (QuestionCheckController::saveNote) had no page of its own to
 * review later -- only the admin's Student MCQ Notes list read these rows.
 */
class QuestionNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $notes = QuestionNote::where('user_id', $request->user()->id)
            ->with(['question.options', 'question.subject:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Student/QuestionNotes/Index', [
            'notes' => $notes,
        ]);
    }
}
