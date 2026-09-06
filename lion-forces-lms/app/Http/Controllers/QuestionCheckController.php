<?php

namespace App\Http\Controllers;

use App\Models\QuestionBank;
use Illuminate\Http\Request;

class QuestionCheckController extends Controller
{
    /**
     * Instant per-question feedback, shared by every attempt flow (demo
     * quiz, quizzes, practice tests, mock exams, staged tests) through the
     * single QuestionRunner component -- one endpoint instead of
     * duplicating this check in each of the 5 student controllers, since
     * they all pull questions from the same question_bank/question_options
     * tables.
     *
     * This intentionally replaces the previous submit-only grading model
     * (see the old comment this superseded in QuestionRunner.tsx): the
     * client asked for candidates to see right/wrong immediately after
     * answering, everywhere, rather than only on the results page.
     */
    public function check(Request $request, QuestionBank $question)
    {
        $data = $request->validate([
            'option_id' => 'required|integer|exists:question_options,id',
        ]);

        $options = $question->options;
        $selected = $options->firstWhere('id', (int) $data['option_id']);
        abort_unless($selected, 404);

        $correctOption = $options->firstWhere('is_correct', true);

        return response()->json([
            'correct' => (bool) $selected->is_correct,
            'correct_option_id' => $correctOption?->id,
            'explanation' => $question->explanation,
        ]);
    }
}
