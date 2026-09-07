<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CustomQuizConfig;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\Subject;
use App\Models\TestAttempt;
use App\Support\FeatureFlags;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Custom quiz" (Settings > Features): a student builds an ad-hoc quiz
 * from the question bank -- subject + difficulty + count -- instead of
 * taking one an admin authored. Question selection reuses the same
 * subject-scoped random-pick pattern Quiz::resolveQuestions() already
 * uses for 'auto' mode; grading reuses the exact QuizController::submit
 * pattern (1 mark per question, no negative marking, no time limit --
 * the simplest version of that same flow); results reuse
 * Student/Quizzes/Result.tsx as-is (see AttemptController).
 */
class CustomQuizController extends Controller
{
    public function create(Request $request): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $subjects = Subject::withCount('questions')->having('questions_count', '>', 0)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Student/CustomQuiz/Create', ['subjects' => $subjects]);
    }

    public function store(Request $request)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'difficulty' => 'nullable|in:easy,medium,hard',
            'question_count' => 'required|integer|min:1|max:50',
        ]);

        $questionIds = QuestionBank::query()
            ->when($data['subject_id'] ?? null, fn ($q, $id) => $q->where('subject_id', $id))
            ->when($data['difficulty'] ?? null, fn ($q, $d) => $q->where('difficulty', $d))
            ->inRandomOrder()
            ->limit($data['question_count'])
            ->pluck('id')
            ->values()
            ->all();

        abort_if(count($questionIds) === 0, 422, 'No questions match those filters yet -- try a different subject or difficulty.');

        $config = CustomQuizConfig::create([
            'user_id' => $request->user()->id,
            'subject_id' => $data['subject_id'] ?? null,
            'difficulty' => $data['difficulty'] ?? null,
            'question_count' => count($questionIds),
            'question_ids' => $questionIds,
        ]);

        return redirect()->route('student.custom-quiz.show', $config);
    }

    public function show(Request $request, CustomQuizConfig $config): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);
        abort_unless($config->user_id === $request->user()->id, 403);

        $questions = $config->questions()->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'image_path' => $q->image_path,
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text])->values(),
        ])->values();

        return Inertia::render('Student/CustomQuiz/Take', [
            'config' => $config->only('id', 'question_count'),
            'subjectName' => $config->subject?->name,
            'questions' => $questions,
        ]);
    }

    public function submit(Request $request, CustomQuizConfig $config)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);
        abort_unless($config->user_id === $request->user()->id, 403);

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
            'attemptable_type' => CustomQuizConfig::class,
            'attemptable_id' => $config->id,
            'status' => 'submitted',
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $score = 0;
        $totalMarks = $questions->count();

        foreach ($data['answers'] as $i => $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;
            $isCorrect = $selectedOption ? (bool) $selectedOption->is_correct : null;
            $marksAwarded = $isCorrect === true ? 1 : 0;
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
            'passed' => $percentage >= 50,
        ]);

        if (\App\Support\NotificationSettings::enabled('quiz_submitted')) {
            \App\Models\User::notifyAdmins('Custom quiz submitted', "{$user->name} submitted a custom quiz ({$percentage}%).", '/admin/reports');
        }

        return redirect()->route('student.attempts.show', $attempt);
    }
}
