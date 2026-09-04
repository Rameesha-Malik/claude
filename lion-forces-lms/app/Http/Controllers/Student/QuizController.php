<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Quiz;
use App\Models\RevisionListItem;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function show(Request $request, Quiz $quiz): Response
    {
        $this->authorizeEnrollment($request, $quiz);

        $questions = $this->resolveQuestions($quiz);
        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        $questions = $questions->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'image_path' => $q->image_path,
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text])->values(),
        ])->values();

        return Inertia::render('Student/Quizzes/Take', [
            'quiz' => $quiz->only('id', 'title', 'marks_per_question', 'negative_marking'),
            'questions' => $questions,
        ]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $this->authorizeEnrollment($request, $quiz);

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:question_bank,id',
            'answers.*.selected_option_id' => 'nullable|exists:question_options,id',
        ]);

        $user = $request->user();
        $questionIds = collect($data['answers'])->pluck('question_id');
        $questions = QuestionBank::with('options')->whereIn('id', $questionIds)->get()->keyBy('id');

        $attempt = TestAttempt::create([
            'user_id' => $user->id,
            'attemptable_type' => Quiz::class,
            'attemptable_id' => $quiz->id,
            'status' => 'submitted',
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $score = 0;
        $totalMarks = $questions->count() * (float) $quiz->marks_per_question;

        foreach ($data['answers'] as $i => $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;
            $isCorrect = $selectedOption ? (bool) $selectedOption->is_correct : null;

            $marksAwarded = match (true) {
                $isCorrect === true => (float) $quiz->marks_per_question,
                $isCorrect === false => -1 * (float) $quiz->negative_marking,
                default => 0,
            };
            $score += $marksAwarded;

            $attempt->answers()->create([
                'question_id' => $question->id,
                'selected_option_id' => $selectedOption?->id,
                'is_correct' => $isCorrect,
                'marks_awarded' => $marksAwarded,
                'order' => $i + 1,
            ]);

            if ($isCorrect === false) {
                $item = RevisionListItem::firstOrNew(['user_id' => $user->id, 'question_id' => $question->id]);
                $item->times_wrong = ($item->exists ? $item->times_wrong : 0) + 1;
                $item->resolved = false;
                $item->last_wrong_at = now();
                $item->save();
            } elseif ($isCorrect === true) {
                RevisionListItem::where('user_id', $user->id)->where('question_id', $question->id)->update(['resolved' => true]);
            }
        }

        $percentage = $totalMarks > 0 ? round(max($score, 0) / $totalMarks * 100, 1) : 0;
        $attempt->update([
            'score' => $score,
            'total_marks' => $totalMarks,
            'percentage' => $percentage,
            'passed' => $percentage >= 50, // same soft benchmark as practice tests -- quizzes are low-stakes too
        ]);

        return redirect()->route('student.attempts.show', $attempt);
    }

    private function resolveQuestions(Quiz $quiz)
    {
        if ($quiz->question_selection_mode === 'manual') {
            return $quiz->questions()->with('options')->get();
        }

        return QuestionBank::with('options')
            ->where('subject_id', $quiz->subject_id)
            ->inRandomOrder()
            ->limit($quiz->auto_question_count ?? 10)
            ->get();
    }

    private function authorizeEnrollment(Request $request, Quiz $quiz): void
    {
        $enrolled = $request->user()->enrollments()
            ->where('course_id', $quiz->course_id)
            ->active()
            ->exists();

        abort_unless($enrolled, 403, 'You must be enrolled in this course.');
    }
}
