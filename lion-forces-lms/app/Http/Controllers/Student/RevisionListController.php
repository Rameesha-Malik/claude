<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\RevisionListItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Every wrong-answered question (across practice tests, quizzes, staged
 * tests, mock exams) already gets recorded here automatically -- it just
 * had no page of its own, so the dashboard's "Questions to Revise" count
 * was a dead end with nothing to click through to.
 */
class RevisionListController extends Controller
{
    public function index(Request $request): Response
    {
        $items = RevisionListItem::where('user_id', $request->user()->id)
            ->where('resolved', false)
            ->with('question.options')
            ->orderByDesc('last_wrong_at')
            ->get();

        return Inertia::render('Student/RevisionList/Index', [
            'items' => $items,
        ]);
    }
}
