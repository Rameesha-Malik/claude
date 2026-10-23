<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CustomQuizConfig;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\Subject;
use App\Models\TestAttempt;
use App\Models\Topic;
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
 *
 * Client: this should only be usable "when a student buys a quiz [module]
 * of that course" -- originally reachable by any logged-in student
 * regardless of what they'd paid for. Gated the same way every other
 * question-bank assessment already is: an active (non-expired) enrollment
 * in a course whose quiz module is actually enabled. Reached either from
 * the generic nav link (any qualifying course counts) or, more precisely,
 * from inside one specific purchased course's Quizzes tab (?course_id=…),
 * which checks that exact course and remembers it so results lead back
 * there.
 *
 * Client: a student with no quiz access used to hit a bare "buy a
 * course" wall and never see the feature itself. Now they get a real
 * but capped taste of it instead -- same builder, same question bank,
 * just limited to FREE_TRIAL_MAX_QUESTIONS per quiz -- so they can
 * actually try it and get curious enough to buy, rather than being
 * told to buy something they've never used.
 */
class CustomQuizController extends Controller
{
    private const FREE_TRIAL_MAX_QUESTIONS = 5;

    public function create(Request $request): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $course = $request->integer('course_id') ? Course::find($request->integer('course_id')) : null;

        // No course given explicitly (the generic "Custom Quiz" nav entry,
        // not a specific course's Quizzes tab) -- auto-pick the one course
        // this student actually has quiz access to, so the bank is still
        // scoped correctly without an extra click for the common case of
        // one quiz purchase at a time. A student with quiz access to
        // several courses at once falls back to the whole bank below
        // (same as having no access at all) rather than guessing which
        // one they meant.
        if (! $course) {
            $accessibleCourses = Course::whereHas('enrollments', fn ($q) => $q->where('user_id', $request->user()->id)->active()->grantingModule('quiz'))
                ->where('quizzes_enabled', true)
                ->orderBy('title')
                ->get(['id', 'title', 'slug']);
            if ($accessibleCourses->count() === 1) {
                $course = $accessibleCourses->first();
            }
        }

        $hasAccess = $this->hasQuizAccess($request, $course);

        // Client: buying "Quiz Only" for one course was showing the
        // student the entire platform-wide bank, not just that course's
        // own questions -- Subject/Topic aren't tied to a course, but
        // QuestionBank.course_id now is, so scope through that. No course
        // in play (free trial, or a student with access to several
        // courses at once) keeps the old whole-bank behavior.
        $subjects = Subject::query()
            ->when($course, fn ($q) => $q->whereHas('questions', fn ($qq) => $qq->where('course_id', $course->id)))
            ->withCount(['questions' => fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id))])
            ->having('questions_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Every topic with at least one question -- the picker filters
        // this down client-side to whichever subject the student chose,
        // same pattern as the admin question form's topic dropdown.
        $topics = Topic::query()
            ->when($course, fn ($q) => $q->whereHas('questions', fn ($qq) => $qq->where('course_id', $course->id)))
            ->withCount(['questions' => fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id))])
            ->having('questions_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'subject_id', 'name']);

        return Inertia::render('Student/CustomQuiz/Create', [
            'subjects' => $subjects,
            'topics' => $topics,
            'hasAccess' => $hasAccess,
            'freeTrialMax' => self::FREE_TRIAL_MAX_QUESTIONS,
            'course' => $course?->only('id', 'title', 'slug'),
            // Client, from a UWorld QBank walkthrough: a student should be
            // able to see every test they've built, not just the one they
            // just finished. Kept on this same page (not a separate nav
            // entry/URL) rather than duplicating the builder's course
            // context and access gate on a second page. Shown regardless
            // of access so a free-trial student still sees their own
            // small history building up.
            'history' => CustomQuizConfig::where('user_id', $request->user()->id)
                ->with(['subject:id,name', 'topic:id,name', 'attempts'])
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (CustomQuizConfig $c) => [
                    'id' => $c->id,
                    'subject' => $c->subject?->name,
                    'topic' => $c->topic?->name,
                    'difficulty' => $c->difficulty,
                    'question_count' => $c->question_count,
                    'created_at' => $c->created_at,
                    'attempt_id' => $c->attempts->first()?->id,
                    'percentage' => $c->attempts->first()?->percentage,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'difficulty' => 'nullable|in:easy,medium,hard',
            'question_count' => 'required|integer|min:1|max:50',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        $course = ! empty($data['course_id']) ? Course::find($data['course_id']) : null;

        // No access -> not blocked outright, capped to a free-trial size
        // instead (enforced server-side, not just the frontend's max
        // attribute, since the request could otherwise be replayed with
        // any count).
        if (! $this->hasQuizAccess($request, $course)) {
            $data['question_count'] = min($data['question_count'], self::FREE_TRIAL_MAX_QUESTIONS);
        }

        $questionIds = $this->pickQuestionIds($data);

        $config = CustomQuizConfig::create([
            'user_id' => $request->user()->id,
            'subject_id' => $data['subject_id'] ?? null,
            'topic_id' => $data['topic_id'] ?? null,
            'course_id' => $course?->id,
            'difficulty' => $data['difficulty'] ?? null,
            'question_count' => count($questionIds),
            'question_ids' => $questionIds,
        ]);

        return redirect()->route('student.custom-quiz.show', $config);
    }

    // "Duplicate" (UWorld Tests tab): same filters, a fresh random pick --
    // not literally the same questions, since the point of retaking is
    // practice, not memorizing one frozen set.
    public function duplicate(Request $request, CustomQuizConfig $config)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);
        abort_unless($config->user_id === $request->user()->id, 403);

        $questionIds = $this->pickQuestionIds([
            'subject_id' => $config->subject_id,
            'topic_id' => $config->topic_id,
            'course_id' => $config->course_id,
            'difficulty' => $config->difficulty,
            'question_count' => $config->question_count,
        ]);

        $copy = CustomQuizConfig::create([
            'user_id' => $request->user()->id,
            'subject_id' => $config->subject_id,
            'topic_id' => $config->topic_id,
            'course_id' => $config->course_id,
            'difficulty' => $config->difficulty,
            'question_count' => count($questionIds),
            'question_ids' => $questionIds,
        ]);

        return redirect()->route('student.custom-quiz.show', $copy);
    }

    public function destroy(Request $request, CustomQuizConfig $config)
    {
        abort_unless($config->user_id === $request->user()->id, 403);

        $config->attempts->each->delete();
        $config->delete();

        return back()->with('success', 'Removed from your test history.');
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
            'topicName' => $config->topic?->name,
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

    // Same "active, non-expired enrollment" rule QuizController/
    // PracticeTestController/MockExamController/StagedTestController all
    // already use to gate access to their course's own assessments --
    // except Custom Quiz isn't tied to one course, so with no $course
    // given (the generic nav entry) any enrollment that unlocks a
    // quizzes-enabled course is enough; with $course given (entered from
    // that course's Quizzes tab) it must be an active enrollment in that
    // exact course.
    private function hasQuizAccess(Request $request, ?Course $course): bool
    {
        $query = $request->user()->enrollments()->active()->grantingModule('quiz')
            ->whereHas('course', fn ($q) => $q->where('quizzes_enabled', true));

        if ($course) {
            $query->where('course_id', $course->id);
        }

        return $query->exists();
    }

    // Shared by store() (new config) and duplicate() (retake with a fresh
    // random pick, same filters) -- kept as one place so both can never
    // drift apart on how a set of questions gets picked.
    private function pickQuestionIds(array $data): array
    {
        $questionIds = QuestionBank::query()
            ->when($data['subject_id'] ?? null, fn ($q, $id) => $q->where('subject_id', $id))
            ->when($data['topic_id'] ?? null, fn ($q, $id) => $q->where('topic_id', $id))
            ->when($data['difficulty'] ?? null, fn ($q, $d) => $q->where('difficulty', $d))
            ->when($data['course_id'] ?? null, fn ($q, $id) => $q->where('course_id', $id))
            ->inRandomOrder()
            ->limit($data['question_count'])
            ->pluck('id')
            ->values()
            ->all();

        abort_if(count($questionIds) === 0, 422, 'No questions match those filters yet -- try a different subject, topic, or difficulty.');

        return $questionIds;
    }
}
