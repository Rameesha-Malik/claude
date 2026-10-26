<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CustomQuizConfig;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\Subject;
use App\Models\TestAttempt;
use App\Models\TestAttemptAnswer;
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
        // whereHas() (a WHERE EXISTS, portable to both MySQL and SQLite)
        // rather than HAVING on withCount()'s subquery-derived column --
        // SQLite rejects a HAVING clause with no GROUP BY even when the
        // referenced column is a valid select-list alias, which MySQL
        // allows as a convenience. withCount() is kept only for display
        // (the count badge each picker shows), not for filtering.
        $subjects = Subject::query()
            ->whereHas('questions', fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id)))
            ->withCount(['questions' => fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id))])
            ->orderBy('name')
            ->get(['id', 'name']);

        // Every topic with at least one question -- the picker filters
        // this down client-side to whichever subject the student chose,
        // same pattern as the admin question form's topic dropdown.
        $topics = Topic::query()
            ->whereHas('questions', fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id)))
            ->withCount(['questions' => fn ($q) => $q->when($course, fn ($qq) => $qq->where('course_id', $course->id))])
            ->orderBy('name')
            ->get(['id', 'subject_id', 'name']);

        return Inertia::render('Student/CustomQuiz/Create', [
            'subjects' => $subjects,
            'topics' => $topics,
            'hasAccess' => $hasAccess,
            'freeTrialMax' => self::FREE_TRIAL_MAX_QUESTIONS,
            'course' => $course?->only('id', 'title', 'slug'),
        ]);
    }

    // UWorld's own "Tests" tab -- previously folded inline under the
    // Create Test form (same history data, see historyFor() below); now
    // its own page so the three can sit behind one consistent tab bar
    // (Create Test / Tests / Favorites) rather than history living only
    // on the builder page.
    public function tests(Request $request): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        return Inertia::render('Student/CustomQuiz/Tests', [
            'history' => $this->historyFor($request->user()->id),
        ]);
    }

    // UWorld's own "Browse questions" view -- distinct from Create Test's
    // Subject picker (which only ever shows a subject name + count to
    // build filters from, never an actual question) and from Favorites
    // (only questions the student starred). This is read-only exploration
    // of the real question bank: pick a subject, see every question in
    // it with its answer. Gated the same way the per-course Question Bank
    // tab already is -- a real purchased quiz module, no free-trial
    // carve-out here, since unlimited answer browsing would undercut the
    // paywall far more than a 5-question quiz cap does.
    public function browse(Request $request): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $courseIds = Course::whereHas('enrollments', fn ($q) => $q->where('user_id', $request->user()->id)->active()->grantingModule('quiz'))
            ->where('quizzes_enabled', true)
            ->pluck('id');

        $questions = QuestionBank::with(['subject:id,name', 'options'])
            ->whereIn('course_id', $courseIds)
            ->orderBy('subject_id')
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'image_path' => $q->image_path,
                'explanation' => $q->explanation,
                'difficulty' => $q->difficulty,
                'subject' => $q->subject,
                'options' => $q->options->map(fn ($o) => [
                    'id' => $o->id, 'option_text' => $o->option_text, 'image_path' => $o->image_path, 'is_correct' => $o->is_correct,
                ])->values(),
            ])
            ->values();

        return Inertia::render('Student/CustomQuiz/Browse', [
            'questions' => $questions,
            'hasAccess' => $courseIds->isNotEmpty(),
        ]);
    }

    // UWorld's own "Progress" tab -- cross-assessment analytics over the
    // same question pool browse() exposes. TestAttemptAnswer already
    // spans every assessment type this app has (Quiz, Practice Test,
    // Mock Exam, Staged Test, Custom Quiz -- see matchingQuestionsQuery()
    // above), so a question answered via a regular Quiz still counts
    // here, not just ones answered inside a Custom Quiz. Gated the same
    // way browse() is (a real purchased quiz module, no free-trial
    // carve-out), since detailed analytics over the full bank would
    // undercut the paywall far more than a 5-question quiz cap does.
    //
    // Computed entirely in PHP Collection logic rather than SQL window
    // functions -- SQLite has none of the ones MySQL offers, and this
    // app has already hit that exact portability gap twice this session
    // (see LeaderboardController and the HAVING fix in create() above).
    public function progress(Request $request): Response
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $userId = $request->user()->id;

        $courseIds = Course::whereHas('enrollments', fn ($q) => $q->where('user_id', $userId)->active()->grantingModule('quiz'))
            ->where('quizzes_enabled', true)
            ->pluck('id');

        if ($courseIds->isEmpty()) {
            return Inertia::render('Student/CustomQuiz/Progress', ['hasAccess' => false, 'stats' => null]);
        }

        $poolIds = QuestionBank::whereIn('course_id', $courseIds)->pluck('id');
        $totalQuestions = $poolIds->count();

        // Every answer this student has ever submitted for a question in
        // this pool, oldest first per question -- grouped so each
        // question's own history (first try, every retry, latest
        // standing) can be read off in plain PHP instead of a SQL
        // aggregate.
        $answers = TestAttemptAnswer::whereIn('question_id', $poolIds)
            ->whereHas('attempt', fn ($q) => $q->where('user_id', $userId))
            ->orderBy('created_at')
            ->get()
            ->groupBy('question_id');

        $usedCount = $answers->count();
        $firstTryCount = 0;
        $everWrongCount = 0;
        $wrongToRightCount = 0;
        $regressionCount = 0;
        $latestCorrectCount = 0;
        $skippedCount = 0;
        $totalAttempts = 0;

        foreach ($answers as $group) {
            $ordered = $group->values();
            $first = $ordered->first();
            $latest = $ordered->last();
            $totalAttempts += $ordered->count();

            $everWrong = $ordered->contains(fn ($a) => $a->is_correct === false);
            $everCorrect = $ordered->contains(fn ($a) => $a->is_correct === true);
            $latestCorrect = $latest->is_correct === true;

            if ($first->is_correct === true) {
                $firstTryCount++;
            }

            if ($everWrong) {
                $everWrongCount++;
                if ($latestCorrect) {
                    $wrongToRightCount++;
                }
            }

            // Got it right at some point, but the most recent attempt on
            // this exact question slipped back to wrong -- a worse
            // signal than "never learned it" since it means the student
            // forgot something they already had.
            if ($everCorrect && ! $latestCorrect) {
                $regressionCount++;
            }

            if ($latestCorrect) {
                $latestCorrectCount++;
            }

            if ($latest->selected_option_id === null) {
                $skippedCount++;
            }
        }

        $customQuizAttempts = TestAttempt::where('user_id', $userId)
            ->where('attemptable_type', CustomQuizConfig::class)
            ->whereNotNull('submitted_at')
            ->orderByDesc('submitted_at')
            ->get();

        return Inertia::render('Student/CustomQuiz/Progress', [
            'hasAccess' => true,
            'stats' => [
                'totalQuestions' => $totalQuestions,
                'usedCount' => $usedCount,
                'unusedCount' => max($totalQuestions - $usedCount, 0),
                'bankCoveragePct' => $totalQuestions > 0 ? round($usedCount / $totalQuestions * 100, 1) : 0,
                'uniqueAccuracyPct' => $usedCount > 0 ? round($latestCorrectCount / $usedCount * 100, 1) : 0,
                'firstTryPct' => $usedCount > 0 ? round($firstTryCount / $usedCount * 100, 1) : 0,
                'wrongToRightCount' => $wrongToRightCount,
                'wrongToRightPct' => $everWrongCount > 0 ? round($wrongToRightCount / $everWrongCount * 100, 1) : 0,
                'regressionsCount' => $regressionCount,
                'avgRetries' => $usedCount > 0 ? round($totalAttempts / $usedCount, 1) : 0,
                'correctCount' => $latestCorrectCount,
                'incorrectCount' => max($usedCount - $latestCorrectCount - $skippedCount, 0),
                'skippedCount' => $skippedCount,
                'sessionsCount' => $customQuizAttempts->count(),
                // percentage is cast decimal:2 (a string like "65.00") --
                // round to a plain number so the tile shows "65%", not
                // "65.00%".
                'lastTestPercentage' => $customQuizAttempts->first()?->percentage !== null
                    ? round((float) $customQuizAttempts->first()->percentage, 1)
                    : null,
                'favoritesCount' => \App\Models\SavedQuestion::where('user_id', $userId)->whereIn('question_id', $poolIds)->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $data = $request->validate([
            'name' => 'nullable|string|max:150',
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'topic_ids' => 'nullable|array',
            'topic_ids.*' => 'exists:topics,id',
            'difficulty' => 'nullable|in:easy,medium,hard',
            'question_count' => 'required|integer|min:1|max:50',
            'course_id' => 'nullable|exists:courses,id',
            'mode' => 'required|in:tutor,timed',
            'timer_enabled' => 'boolean',
            'timer_mode' => 'required_if:timer_enabled,1|nullable|in:total,per_question',
            'timer_minutes' => 'required_if:timer_mode,total|nullable|integer|min:1|max:180',
            'timer_seconds_per_question' => 'required_if:timer_mode,per_question|nullable|integer|min:10|max:600',
            'filter' => 'nullable|in:unused,wrong,correct,favorited',
        ]);

        $course = ! empty($data['course_id']) ? Course::find($data['course_id']) : null;

        // No access -> not blocked outright, capped to a free-trial size
        // instead (enforced server-side, not just the frontend's max
        // attribute, since the request could otherwise be replayed with
        // any count).
        if (! $this->hasQuizAccess($request, $course)) {
            $data['question_count'] = min($data['question_count'], self::FREE_TRIAL_MAX_QUESTIONS);
        }

        $questionIds = $this->pickQuestionIds($data, $request->user()->id);

        $config = CustomQuizConfig::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'] ?? null,
            'subject_ids' => $data['subject_ids'] ?? [],
            'topic_ids' => $data['topic_ids'] ?? [],
            'course_id' => $course?->id,
            'difficulty' => $data['difficulty'] ?? null,
            'question_count' => count($questionIds),
            'question_ids' => $questionIds,
            'mode' => $data['mode'],
            'timer_enabled' => $data['timer_enabled'] ?? false,
            'timer_mode' => ($data['timer_enabled'] ?? false) ? $data['timer_mode'] : null,
            'timer_minutes' => ($data['timer_enabled'] ?? false) && $data['timer_mode'] === 'total' ? $data['timer_minutes'] : null,
            'timer_seconds_per_question' => ($data['timer_enabled'] ?? false) && $data['timer_mode'] === 'per_question' ? $data['timer_seconds_per_question'] : null,
            'filter' => $data['filter'] ?? null,
        ]);

        return redirect()->route('student.custom-quiz.show', $config);
    }

    // "Duplicate" (UWorld Tests tab): same filters, a fresh random pick --
    // not literally the same questions, since the point of retaking is
    // practice, not memorizing one frozen set. Carries mode/timer/filter
    // over too, so a retake behaves identically to the original attempt
    // rather than silently reverting to tutor-mode-no-timer-no-filter.
    public function duplicate(Request $request, CustomQuizConfig $config)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);
        abort_unless($config->user_id === $request->user()->id, 403);

        $questionIds = $this->pickQuestionIds([
            'subject_ids' => $config->subject_ids,
            'topic_ids' => $config->topic_ids,
            'course_id' => $config->course_id,
            'difficulty' => $config->difficulty,
            'question_count' => $config->question_count,
            'filter' => $config->filter,
        ], $request->user()->id);

        $copy = CustomQuizConfig::create([
            'user_id' => $request->user()->id,
            'name' => $config->name,
            'subject_ids' => $config->subject_ids,
            'topic_ids' => $config->topic_ids,
            'course_id' => $config->course_id,
            'difficulty' => $config->difficulty,
            'question_count' => count($questionIds),
            'question_ids' => $questionIds,
            'mode' => $config->mode,
            'timer_enabled' => $config->timer_enabled,
            'timer_mode' => $config->timer_mode,
            'timer_minutes' => $config->timer_minutes,
            'timer_seconds_per_question' => $config->timer_seconds_per_question,
            'filter' => $config->filter,
        ]);

        return redirect()->route('student.custom-quiz.show', $copy);
    }

    // Live "X questions match these filters" preview on the create form,
    // fetched as the student adjusts subjects/topics/difficulty/filter --
    // shares matchingQuestionsQuery() with pickQuestionIds() so the two
    // can never drift apart on what counts as a match.
    public function previewCount(Request $request)
    {
        abort_unless(FeatureFlags::enabled('custom_quiz'), 404);

        $data = $request->validate([
            'subject_ids' => 'nullable|array',
            'subject_ids.*' => 'exists:subjects,id',
            'topic_ids' => 'nullable|array',
            'topic_ids.*' => 'exists:topics,id',
            'difficulty' => 'nullable|in:easy,medium,hard',
            'course_id' => 'nullable|exists:courses,id',
            'filter' => 'nullable|in:unused,wrong,correct,favorited',
        ]);

        $count = $this->matchingQuestionsQuery($data, $request->user()->id)->count();

        return response()->json(['count' => $count]);
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
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text, 'image_path' => $o->image_path])->values(),
        ])->values();

        return Inertia::render('Student/CustomQuiz/Take', [
            'config' => $config->only('id', 'question_count'),
            'subjectNames' => $config->subjects()->pluck('name'),
            'topicNames' => $config->topics()->pluck('name'),
            'questions' => $questions,
            'name' => $config->name,
            'mode' => $config->mode,
            // Which of the two timer behaviours this config actually
            // used -- a single whole-quiz countdown, or a fresh one per
            // question that auto-advances when it hits zero. Take.tsx
            // picks which (if either) to run from these four together.
            'timerEnabled' => $config->timer_enabled,
            'timerMode' => $config->timer_mode,
            'timerMinutes' => $config->timer_minutes,
            'timerSecondsPerQuestion' => $config->timer_seconds_per_question,
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

    // Client, from a UWorld QBank walkthrough: a student should be able to
    // see every test they've built, not just the one they just finished.
    // Kept on this same page (not a separate nav entry/URL) rather than
    // duplicating the builder's course context and access gate on a
    // second page. Shown regardless of access so a free-trial student
    // still sees their own small history building up.
    //
    // subject_ids/topic_ids are plain JSON arrays, not a relation, so
    // names are resolved with one bulk lookup across the whole page of
    // history rather than a query per row.
    private function historyFor(int $userId)
    {
        $configs = CustomQuizConfig::where('user_id', $userId)
            ->with('attempts')
            ->latest()
            ->limit(20)
            ->get();

        $subjectNames = Subject::whereIn('id', $configs->pluck('subject_ids')->flatten()->filter()->unique())->pluck('name', 'id');
        $topicNames = Topic::whereIn('id', $configs->pluck('topic_ids')->flatten()->filter()->unique())->pluck('name', 'id');

        return $configs->map(fn (CustomQuizConfig $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'subject' => CustomQuizConfig::summarizeNames(collect($c->subject_ids ?? [])->map(fn ($id) => $subjectNames->get($id))->filter()->all()),
            'topic' => CustomQuizConfig::summarizeNames(collect($c->topic_ids ?? [])->map(fn ($id) => $topicNames->get($id))->filter()->all()),
            'difficulty' => $c->difficulty,
            'question_count' => $c->question_count,
            'mode' => $c->mode,
            'created_at' => $c->created_at,
            'attempt_id' => $c->attempts->first()?->id,
            'percentage' => $c->attempts->first()?->percentage,
        ]);
    }

    // Shared by pickQuestionIds() and previewCount() -- every filter that
    // narrows down which questions a config can draw from, minus the
    // random-order/limit/pluck that only pickQuestionIds() needs. Kept as
    // one place so the live "X questions found" count on the create form
    // and the actual question pick can never drift apart on what counts
    // as a match.
    //
    // 'unused'/'wrong'/'correct'/'favorited' reuse data this app already
    // tracks rather than a new table: RevisionListItem.resolved=false is
    // "still getting this wrong" (flipped to true the moment it's
    // answered correctly since -- see submit() below), TestAttemptAnswer
    // is this student's full answer history across every assessment type
    // (not just Custom Quiz), SavedQuestion is the same favourites list
    // QuestionRunner's star button already writes to.
    private function matchingQuestionsQuery(array $data, int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return QuestionBank::query()
            ->when(! empty($data['subject_ids']), fn ($q) => $q->whereIn('subject_id', $data['subject_ids']))
            ->when(! empty($data['topic_ids']), fn ($q) => $q->whereIn('topic_id', $data['topic_ids']))
            ->when($data['difficulty'] ?? null, fn ($q, $d) => $q->where('difficulty', $d))
            ->when($data['course_id'] ?? null, fn ($q, $id) => $q->where('course_id', $id))
            ->when($data['filter'] ?? null, function ($q, $filter) use ($userId) {
                if ($filter === 'unused') {
                    $attempted = TestAttemptAnswer::whereHas('attempt', fn ($aq) => $aq->where('user_id', $userId))
                        ->distinct()
                        ->pluck('question_id');
                    $q->whereNotIn('id', $attempted);

                    return;
                }

                $ids = match ($filter) {
                    'wrong' => RevisionListItem::where('user_id', $userId)->where('resolved', false)->pluck('question_id'),
                    'correct' => TestAttemptAnswer::where('is_correct', true)
                        ->whereHas('attempt', fn ($aq) => $aq->where('user_id', $userId))
                        ->distinct()
                        ->pluck('question_id'),
                    'favorited' => \App\Models\SavedQuestion::where('user_id', $userId)->pluck('question_id'),
                };
                $q->whereIn('id', $ids);
            });
    }

    // Shared by store() (new config) and duplicate() (retake with a fresh
    // random pick, same filters) -- kept as one place so both can never
    // drift apart on how a set of questions gets picked.
    private function pickQuestionIds(array $data, int $userId): array
    {
        $questionIds = $this->matchingQuestionsQuery($data, $userId)
            ->inRandomOrder()
            ->limit($data['question_count'])
            ->pluck('id')
            ->values()
            ->all();

        abort_if(count($questionIds) === 0, 422, 'No questions match those filters yet. Try different subjects, topics, or a different difficulty.');

        return $questionIds;
    }
}
