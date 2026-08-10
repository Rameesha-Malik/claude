<?php

namespace App\Http\Controllers;

use App\Models\DemoQuiz;
use App\Models\DemoQuizAttempt;
use App\Models\QuestionBank;
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
        $quiz = DemoQuiz::where('is_active', true)->withCount('questions')->latest()->first();

        return Inertia::render('Public/DemoQuiz/Intro', [
            'quiz' => $quiz,
        ]);
    }

    public function start(Request $request)
    {
        $quiz = DemoQuiz::where('is_active', true)->latest()->firstOrFail();

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

        foreach ($data['answers'] as $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;
            if ($selectedOption?->is_correct) {
                $score++;
            }
        }

        $attempt->update([
            'score' => $score,
            'total_marks' => $total,
            'submitted_at' => now(),
        ]);

        return redirect()->route('demo-quiz.result', $attempt);
    }

    public function result(Request $request, DemoQuizAttempt $attempt): Response
    {
        $this->authorizeGuest($request, $attempt);
        abort_unless($attempt->submitted_at, 403);

        return Inertia::render('Public/DemoQuiz/Result', [
            'attempt' => $attempt->only('id', 'score', 'total_marks'),
            'quizTitle' => $attempt->demoQuiz->title,
        ]);
    }

    private function authorizeGuest(Request $request, DemoQuizAttempt $attempt): void
    {
        abort_unless($request->session()->get('demo_quiz_guest_token') === $attempt->guest_token, 403);
    }
}
