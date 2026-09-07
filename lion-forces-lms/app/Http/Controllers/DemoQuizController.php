<?php

namespace App\Http\Controllers;

use App\Models\DemoQuiz;
use App\Models\DemoQuizAnswer;
use App\Models\DemoQuizAttempt;
use App\Models\QuestionBank;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public, no-login trial quiz (blueprint SS2.8). A guest is identified by a
 * token stashed in their session -- no account, no cookie banner surprises,
 * just enough identity to stop someone re-submitting the same attempt twice
 * via the back button.
 */
class DemoQuizController extends Controller
{
    public function show(): Response
    {
        // Multiple active demo quizzes -- e.g. one per subject -- show as
        // category cards to pick from; exactly one active quiz keeps the
        // original direct "here's the quiz, start it" layout unchanged.
        $activeQuizzes = DemoQuiz::where('is_active', true)->with('subject:id,name')->withCount('questions')->latest()->get();

        return Inertia::render('Public/DemoQuiz/Intro', [
            'quiz' => $activeQuizzes->count() === 1 ? $activeQuizzes->first() : null,
            'quizzes' => $activeQuizzes->count() > 1 ? $activeQuizzes->values() : [],
            'pageContent' => [
                'title' => Setting::get('demo_quiz_page_title', 'Free Demo Quizzes'),
                'subtitle' => Setting::get('demo_quiz_page_subtitle', 'Try a sample of the real thing — the same question bank, timer, and scoring our enrolled students use.'),
            ],
        ]);
    }

    public function start(Request $request)
    {
        $quizId = $request->input('quiz_id');
        $quiz = $quizId
            ? DemoQuiz::where('is_active', true)->findOrFail($quizId)
            : DemoQuiz::where('is_active', true)->latest()->firstOrFail();

        $guestToken = $request->session()->get('demo_quiz_guest_token') ?? (string) Str::uuid();
        $request->session()->put('demo_quiz_guest_token', $guestToken);

        $attempt = DemoQuizAttempt::create([
            'demo_quiz_id' => $quiz->id,
            'guest_token' => $guestToken,
            'started_at' => now(),
        ]);

        return redirect()->route('demo-quiz.take', $attempt);
    }

    public function take(Request $request, DemoQuizAttempt $attempt): Response
    {
        $this->authorizeGuest($request, $attempt);
        abort_if($attempt->submitted_at, 403, 'This demo quiz attempt has already been submitted.');

        $quiz = $attempt->demoQuiz;
        $questions = $quiz->questions()->with('options:id,question_id,option_text')->get();
        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        $questions = $questions->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'image_path' => $q->image_path,
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text])->values(),
        ])->values();

        return Inertia::render('Public/DemoQuiz/Take', [
            'quiz' => $quiz->only('id', 'title', 'duration_minutes'),
            'attemptId' => $attempt->id,
            'questions' => $questions,
        ]);
    }

    public function submit(Request $request, DemoQuizAttempt $attempt)
    {
        $this->authorizeGuest($request, $attempt);
        abort_if($attempt->submitted_at, 403, 'This demo quiz attempt has already been submitted.');

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:question_bank,id',
            'answers.*.selected_option_id' => 'nullable|exists:question_options,id',
        ]);

        $questionIds = collect($data['answers'])->pluck('question_id');
        $questions = QuestionBank::with('options')->whereIn('id', $questionIds)->get()->keyBy('id');

        $score = 0;
        $total = $questions->count();
        $correctCount = 0;
        $wrongCount = 0;
        $skippedCount = 0;

        foreach ($data['answers'] as $i => $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;

            $isCorrect = $selectedOption ? (bool) $selectedOption->is_correct : null;

            if (! $selectedOption) {
                $skippedCount++;
            } elseif ($isCorrect) {
                $score++;
                $correctCount++;
            } else {
                $wrongCount++;
            }

            // Saved per-question (not just the aggregate score) so the
            // result page can show which specific questions were right,
            // wrong, or skipped -- same review other test types already
            // offer via test_attempt_answers.
            DemoQuizAnswer::create([
                'demo_quiz_attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'selected_option_id' => $selectedOption?->id,
                'is_correct' => $isCorrect,
                'order' => $i + 1,
            ]);
        }

        $attempt->update([
            'score' => $score,
            'total_marks' => $total,
            'correct_count' => $correctCount,
            'wrong_count' => $wrongCount,
            'skipped_count' => $skippedCount,
            'submitted_at' => now(),
        ]);

        if (\App\Support\NotificationSettings::enabled('quiz_submitted')) {
            \App\Models\User::notifyAdmins('Demo quiz submitted', "A guest submitted a demo quiz ({$correctCount} correct, {$wrongCount} wrong).", '/admin/demo-quiz');
        }

        return redirect()->route('demo-quiz.result', $attempt);
    }

    public function result(Request $request, DemoQuizAttempt $attempt): Response
    {
        $this->authorizeGuest($request, $attempt);
        abort_unless($attempt->submitted_at, 403);

        $attempt->load(['answers' => fn ($q) => $q->orderBy('order'), 'answers.question.options', 'answers.selectedOption']);

        return Inertia::render('Public/DemoQuiz/Result', [
            'attempt' => [
                ...$attempt->only('id', 'score', 'total_marks', 'correct_count', 'wrong_count', 'skipped_count'),
                'answers' => $attempt->answers,
            ],
            'quizTitle' => $attempt->demoQuiz->title,
        ]);
    }

    private function authorizeGuest(Request $request, DemoQuizAttempt $attempt): void
    {
        abort_unless($request->session()->get('demo_quiz_guest_token') === $attempt->guest_token, 403);
    }
}
