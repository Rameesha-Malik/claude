<?php

namespace App\Http\Controllers;

use App\Models\DemoQuiz;
use App\Models\Enrollment;
use App\Models\QuestionBank;
use App\Models\QuestionNote;
use App\Models\QuestionReport;
use App\Models\SavedQuestion;
use Illuminate\Http\Request;

/**
 * Every per-question interaction a candidate can make while attempting an
 * MCQ, shared by all 5 real attempt flows (demo quiz, quizzes, practice
 * tests, mock exams, staged tests) through the single QuestionRunner
 * component -- one controller instead of duplicating any of this per test
 * type, since they all pull from the same question_bank/question_options
 * tables.
 */
class QuestionCheckController extends Controller
{
    /**
     * Instant per-question feedback. This intentionally replaces the
     * previous submit-only grading model (see the old comment this
     * superseded in QuestionRunner.tsx): the client asked for candidates
     * to see right/wrong immediately after answering, everywhere, rather
     * than only on the results page.
     */
    public function check(Request $request, QuestionBank $question)
    {
        $data = $request->validate([
            'option_id' => 'required|integer|exists:question_options,id',
        ]);

        // This route has no auth middleware at all (the demo quiz is a
        // guest flow) and $question is bound by plain id with no scoping
        // -- without this check, anyone, logged in or not, could loop
        // every id in the whole question bank and read back
        // correct_option_id for free, extracting the entire answer key
        // for every paid course's bank.
        abort_unless($this->hasQuestionAccess($request, $question), 403);

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

    // A guest (no account) only has a legitimate reason to check a
    // question if it's part of some currently-public demo quiz's curated
    // set -- demo quizzes pick their own explicit question list
    // (DemoQuiz::questions()), not just "any question in this subject",
    // so this stays a real, bounded allowlist rather than reopening the
    // whole bank to anyone. A logged-in user needs an active enrollment
    // in the question's course; a question with no course_id at all (not
    // tied to any paid course) just needs a real account.
    private function hasQuestionAccess(Request $request, QuestionBank $question): bool
    {
        $user = $request->user();

        if (! $user) {
            return DemoQuiz::where('is_active', true)
                ->whereHas('questions', fn ($q) => $q->where('question_bank.id', $question->id))
                ->exists();
        }

        if (! $question->course_id) {
            return true;
        }

        return Enrollment::where('user_id', $user->id)
            ->where('course_id', $question->course_id)
            ->active()
            ->exists();
    }

    // "Reported questions" (admin reference screenshot): a candidate flags
    // a question as wrong/broken/confusing. Public like check() above --
    // the demo quiz is a guest flow too -- user_id is just nullable there.
    public function report(Request $request, QuestionBank $question)
    {
        $data = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        QuestionReport::create([
            'question_id' => $question->id,
            'user_id' => $request->user()?->id,
            'reason' => $data['reason'],
        ]);

        if (\App\Support\NotificationSettings::enabled('question_reported')) {
            $reporter = $request->user()?->name ?? 'A guest';
            \App\Models\User::notifyAdmins(
                'Question reported',
                "{$reporter} flagged a question: \"{$data['reason']}\"",
                '/admin/reported-questions',
            );
        }

        return response()->json(['reported' => true]);
    }

    // "Favourite questions" (admin reference screenshot): wires up the
    // existing SavedQuestion model, which had a migration and a model but
    // no controller anywhere in the app yet. Requires a real account --
    // unlike check()/report(), a favourites list only means something
    // per-user, so there's no guest case to support here.
    public function toggleFavourite(Request $request, QuestionBank $question)
    {
        $user = $request->user();
        abort_unless($user, 401);

        $existing = SavedQuestion::where('user_id', $user->id)->where('question_id', $question->id)->first();
        if ($existing) {
            $existing->delete();

            return response()->json(['favourited' => false]);
        }

        SavedQuestion::create(['user_id' => $user->id, 'question_id' => $question->id]);

        return response()->json(['favourited' => true]);
    }

    // "Student MCQ notes" (admin reference screenshot): a private free-text
    // note a student writes on a question, separate from favouriting/
    // reporting. Requires an account, same as favourite -- a note only
    // means something per-user. Saving again replaces the note rather
    // than keeping a history.
    public function saveNote(Request $request, QuestionBank $question)
    {
        $user = $request->user();
        abort_unless($user, 401);

        $data = $request->validate(['note_text' => 'nullable|string|max:2000']);

        if (trim($data['note_text'] ?? '') === '') {
            QuestionNote::where('user_id', $user->id)->where('question_id', $question->id)->delete();

            return response()->json(['saved' => true, 'note_text' => null]);
        }

        QuestionNote::updateOrCreate(
            ['user_id' => $user->id, 'question_id' => $question->id],
            ['note_text' => $data['note_text']],
        );

        return response()->json(['saved' => true, 'note_text' => $data['note_text']]);
    }
}
