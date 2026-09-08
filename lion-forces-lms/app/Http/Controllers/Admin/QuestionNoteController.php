<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionNote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Student MCQ notes" (admin reference screenshot): read-only admin view
 * onto the personal notes students write per question via
 * QuestionCheckController::saveNote.
 */
class QuestionNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        return Inertia::render('Admin/StudentQuestionNotes/Index', [
            'notes' => QuestionNote::with(['user:id,name,email', 'question:id,question_text'])
                ->when($search, function ($q, $s) {
                    $q->where(function ($q2) use ($s) {
                        $q2->where('note_text', 'like', "%{$s}%")
                            ->orWhere('question_id', $s)
                            ->orWhereHas('user', fn ($q3) => $q3->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }
}
