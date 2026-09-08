<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\StagedTest;
use App\Models\StagedTestAttemptStage;
use App\Models\StagedTestStage;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StagedTestController extends Controller
{
    public function show(Request $request, StagedTest $stagedTest): Response
    {
        abort_unless(\App\Support\FeatureFlags::enabled('full_test'), 404);
        $this->authorizeEnrollment($request, $stagedTest);
        $stagedTest->load(['stages' => fn ($q) => $q->withCount('questions')]);

        $userId = $request->user()->id;
        $inProgress = TestAttempt::where('user_id', $userId)
            ->where('attemptable_type', StagedTest::class)
            ->where('attemptable_id', $stagedTest->id)
            ->where('status', 'in_progress')
            ->latest()
            ->first();

        return Inertia::render('Student/StagedTests/Intro', [
            'stagedTest' => $stagedTest,
            'inProgressAttemptId' => $inProgress?->id,
            'resumeStageId' => $inProgress ? $this->nextStageFor($stagedTest, $inProgress)?->id : null,
        ]);
    }

    public function start(Request $request, StagedTest $stagedTest)
    {
        $this->authorizeEnrollment($request, $stagedTest);

        $firstStage = $stagedTest->stages()->orderBy('order')->first();
        abort_unless($firstStage, 422, 'This staged test has no stages yet.');

        $attempt = TestAttempt::create([
            'user_id' => $request->user()->id,
            'attemptable_type' => StagedTest::class,
            'attemptable_id' => $stagedTest->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return redirect()->route('student.staged-tests.stage', [$stagedTest, $attempt, $firstStage]);
    }

    public function showStage(Request $request, StagedTest $stagedTest, TestAttempt $attempt, StagedTestStage $stage): Response
    {
        $this->authorizeAttempt($request, $attempt, $stagedTest);

        $stages = $stagedTest->stages()->orderBy('order')->get();
        $alreadyCompleted = StagedTestAttemptStage::where('attempt_id', $attempt->id)->where('stage_id', $stage->id)->exists();

        if ($alreadyCompleted) {
            $next = $this->stageAfter($stages, $stage);

            return $next
                ? redirect()->route('student.staged-tests.stage', [$stagedTest, $attempt, $next])
                : redirect()->route('student.attempts.show', $attempt);
        }

        $questions = $stage->questions()->with('options:id,question_id,option_text')->get()->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'image_path' => $q->image_path,
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text])->values(),
        ])->values();

        return Inertia::render('Student/StagedTests/Stage', [
            'stagedTest' => $stagedTest->only('id', 'title'),
            'attemptId' => $attempt->id,
            'stage' => $stage->only('id', 'name', 'order', 'duration_minutes', 'marks_per_question', 'negative_marking', 'pass_threshold_percent'),
            'stages' => $stages->map->only('id', 'name', 'order')->values(),
            'isLastStage' => $stage->id === $stages->last()->id,
            'questions' => $questions,
        ]);
    }

    public function submitStage(Request $request, StagedTest $stagedTest, TestAttempt $attempt, StagedTestStage $stage)
    {
        $this->authorizeAttempt($request, $attempt, $stagedTest);

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:question_bank,id',
            'answers.*.selected_option_id' => 'nullable|exists:question_options,id',
        ]);

        $user = $request->user();
        $questionIds = collect($data['answers'])->pluck('question_id');
        $questions = QuestionBank::with('options')->whereIn('id', $questionIds)->get()->keyBy('id');

        $attempt->answers()->whereIn('question_id', $questionIds)->delete();

        $stageScore = 0;
        $stageTotal = $questions->count() * (float) $stage->marks_per_question;
        $order = $attempt->answers()->count();

        foreach ($data['answers'] as $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;
            $isCorrect = $selectedOption ? (bool) $selectedOption->is_correct : null;

            $marksAwarded = match (true) {
                $isCorrect === true => (float) $stage->marks_per_question,
                $isCorrect === false => -1 * (float) $stage->negative_marking,
                default => 0,
            };
            $stageScore += $marksAwarded;
            $order++;

            $attempt->answers()->create([
                'question_id' => $question->id,
                'selected_option_id' => $selectedOption?->id,
                'is_correct' => $isCorrect,
                'marks_awarded' => $marksAwarded,
                'order' => $order,
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

        $stagePercentage = $stageTotal > 0 ? round(max($stageScore, 0) / $stageTotal * 100, 1) : 0;

        // Ungrouped: pass/fail is decided on this stage alone, same as
        // before "stage groups" existed. Grouped: this stage's own
        // threshold doesn't apply on its own -- record its raw score now,
        // then resolve pass/fail (for every stage in the group at once)
        // once the LAST stage in the group has been attempted.
        if (! $stage->stage_group_id) {
            $stagePassed = $stagePercentage >= (float) $stage->pass_threshold_percent;

            StagedTestAttemptStage::updateOrCreate(
                ['attempt_id' => $attempt->id, 'stage_id' => $stage->id],
                ['score' => $stageScore, 'total_marks' => $stageTotal, 'passed' => $stagePassed, 'completed_at' => now()],
            );

            // The gate: failing a stage ends the attempt right here with
            // whatever's been scored so far -- later stages are never
            // unlocked.
            if (! $stagePassed) {
                return $this->finalizeAttempt($attempt);
            }
        } else {
            // Placeholder result, `passed` resolved below once the group
            // is complete -- keeps this row's presence meaning "attempted"
            // consistently with the ungrouped branch, for nextStageFor().
            StagedTestAttemptStage::updateOrCreate(
                ['attempt_id' => $attempt->id, 'stage_id' => $stage->id],
                ['score' => $stageScore, 'total_marks' => $stageTotal, 'passed' => false, 'completed_at' => now()],
            );

            $group = $stage->stageGroup;
            $groupStageIds = $group->stages()->pluck('id');
            $isLastInGroup = $stage->id === $groupStageIds->last();

            if (! $isLastInGroup) {
                $stages = $stagedTest->stages()->orderBy('order')->get();
                $next = $this->stageAfter($stages, $stage);

                return $next
                    ? redirect()->route('student.staged-tests.stage', [$stagedTest, $attempt, $next])
                    : $this->finalizeAttempt($attempt);
            }

            // Last stage in the group -- resolve the whole group's
            // pass/fail on the combined score across all its stages, and
            // stamp that same result onto every stage row in the group
            // (finalizeAttempt()'s `every(passed)` check stays untouched).
            $groupResults = StagedTestAttemptStage::where('attempt_id', $attempt->id)->whereIn('stage_id', $groupStageIds)->get();
            $combinedScore = $groupResults->sum('score');
            $combinedTotal = $groupResults->sum('total_marks');
            $combinedPercentage = $combinedTotal > 0 ? round(max($combinedScore, 0) / $combinedTotal * 100, 1) : 0;
            $groupPassed = $combinedPercentage >= (float) $group->pass_threshold_percent;

            StagedTestAttemptStage::where('attempt_id', $attempt->id)->whereIn('stage_id', $groupStageIds)->update(['passed' => $groupPassed]);

            if (! $groupPassed) {
                return $this->finalizeAttempt($attempt);
            }
        }

        $stages = $stagedTest->stages()->orderBy('order')->get();
        $next = $this->stageAfter($stages, $stage);

        if ($next) {
            return redirect()->route('student.staged-tests.stage', [$stagedTest, $attempt, $next]);
        }

        return $this->finalizeAttempt($attempt);
    }

    private function finalizeAttempt(TestAttempt $attempt)
    {
        $attempt->load('stageResults');
        $score = $attempt->stageResults->sum('score');
        $total = $attempt->stageResults->sum('total_marks');
        $percentage = $total > 0 ? round(max($score, 0) / $total * 100, 1) : 0;
        $allStagesPassed = $attempt->stageResults->every(fn ($r) => $r->passed);

        $attempt->update([
            'status' => 'submitted',
            'score' => $score,
            'total_marks' => $total,
            'percentage' => $percentage,
            'passed' => $allStagesPassed,
            'submitted_at' => now(),
        ]);

        if (\App\Support\NotificationSettings::enabled('quiz_submitted')) {
            \App\Models\User::notifyAdmins('Staged test submitted', "{$attempt->user->name} submitted a staged test ({$percentage}%).", '/admin/reports');
        }

        return redirect()->route('student.attempts.show', $attempt);
    }

    private function nextStageFor(StagedTest $stagedTest, TestAttempt $attempt): ?StagedTestStage
    {
        $stages = $stagedTest->stages()->orderBy('order')->get();
        $completedStageIds = StagedTestAttemptStage::where('attempt_id', $attempt->id)->pluck('stage_id');

        return $stages->first(fn ($s) => ! $completedStageIds->contains($s->id));
    }

    private function stageAfter(Collection $stages, StagedTestStage $current): ?StagedTestStage
    {
        return $stages->firstWhere('order', '>', $current->order);
    }

    private function authorizeEnrollment(Request $request, StagedTest $stagedTest): void
    {
        // "Full Test config" (Settings > Features reference screenshot)
        // lets a test have no course at all -- a standalone assessment,
        // open to any logged-in student rather than gated by enrollment
        // in a course that may not exist for it.
        if (! $stagedTest->course_id) {
            return;
        }

        $enrolled = $request->user()->enrollments()
            ->where('course_id', $stagedTest->course_id)
            ->active()
            ->exists();

        abort_unless($enrolled, 403, 'You must be enrolled in this course.');
    }

    private function authorizeAttempt(Request $request, TestAttempt $attempt, StagedTest $stagedTest): void
    {
        abort_unless($attempt->user_id === $request->user()->id, 403);
        abort_unless($attempt->attemptable_type === StagedTest::class && $attempt->attemptable_id === $stagedTest->id, 403);
        abort_unless($attempt->status === 'in_progress', 403, 'This attempt has already ended.');
    }
}
