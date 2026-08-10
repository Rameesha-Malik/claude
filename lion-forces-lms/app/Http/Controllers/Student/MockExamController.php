<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MockExam;
use App\Models\MockExamAttemptSection;
use App\Models\MockExamSection;
use App\Models\QuestionBank;
use App\Models\RevisionListItem;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class MockExamController extends Controller
{
    public function show(Request $request, MockExam $mockExam): Response
    {
        $this->authorizeEnrollment($request, $mockExam);
        $mockExam->load(['sections' => fn ($q) => $q->withCount('questions')]);

        $userId = $request->user()->id;
        $attemptsUsed = $this->submittedAttemptsCount($mockExam, $userId);
        $inProgress = TestAttempt::where('user_id', $userId)
            ->where('attemptable_type', MockExam::class)
            ->where('attemptable_id', $mockExam->id)
            ->where('status', 'in_progress')
            ->latest()
            ->first();

        return Inertia::render('Student/MockExams/Intro', [
            'mockExam' => $mockExam,
            'attemptsUsed' => $attemptsUsed,
            'isAvailable' => $mockExam->isCurrentlyAvailable(),
            'canStart' => $this->canStart($mockExam, $attemptsUsed),
            'inProgressAttemptId' => $inProgress?->id,
            'resumeSectionId' => $inProgress ? $this->nextSectionFor($mockExam, $inProgress)?->id : null,
        ]);
    }

    public function start(Request $request, MockExam $mockExam)
    {
        $this->authorizeEnrollment($request, $mockExam);
        abort_unless($mockExam->isCurrentlyAvailable(), 403, 'This mock exam is not currently available.');

        $userId = $request->user()->id;
        abort_unless($this->canStart($mockExam, $this->submittedAttemptsCount($mockExam, $userId)), 403, 'You have reached the attempt limit for this mock exam.');

        $firstSection = $mockExam->sections()->orderBy('order')->first();
        abort_unless($firstSection, 422, 'This mock exam has no sections yet.');

        $attempt = TestAttempt::create([
            'user_id' => $userId,
            'attemptable_type' => MockExam::class,
            'attemptable_id' => $mockExam->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return redirect()->route('student.mock-exams.section', [$mockExam, $attempt, $firstSection]);
    }

    public function showSection(Request $request, MockExam $mockExam, TestAttempt $attempt, MockExamSection $section): Response
    {
        $this->authorizeAttempt($request, $attempt, $mockExam);

        $sections = $mockExam->sections()->orderBy('order')->get();
        $answeredQuestionIds = $attempt->answers()->pluck('question_id');

        $sectionQuestionIds = $section->questions()->pluck('question_bank.id');
        $sectionAlreadyDone = $sectionQuestionIds->isNotEmpty() && $sectionQuestionIds->diff($answeredQuestionIds)->isEmpty();

        if ($sectionAlreadyDone) {
            $next = $this->sectionAfter($sections, $section);

            return $next
                ? redirect()->route('student.mock-exams.section', [$mockExam, $attempt, $next])
                : redirect()->route('student.attempts.show', $attempt);
        }

        $questions = $section->questions()->with('options:id,question_id,option_text')->get()->map(fn ($q) => [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'image_path' => $q->image_path,
            'options' => $q->options->map(fn ($o) => ['id' => $o->id, 'option_text' => $o->option_text])->values(),
        ])->values();

        return Inertia::render('Student/MockExams/Section', [
            'mockExam' => $mockExam->only('id', 'title', 'fullscreen_required', 'disallow_back_navigation'),
            'attemptId' => $attempt->id,
            'section' => $section->only('id', 'name', 'order', 'duration_minutes', 'marks_per_question', 'negative_marking'),
            'sections' => $sections->map->only('id', 'name', 'order')->values(),
            'isLastSection' => $section->id === $sections->last()->id,
            'questions' => $questions,
        ]);
    }

    public function submitSection(Request $request, MockExam $mockExam, TestAttempt $attempt, MockExamSection $section)
    {
        $this->authorizeAttempt($request, $attempt, $mockExam);

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:question_bank,id',
            'answers.*.selected_option_id' => 'nullable|exists:question_options,id',
        ]);

        $user = $request->user();
        $questionIds = collect($data['answers'])->pluck('question_id');
        $questions = QuestionBank::with('options')->whereIn('id', $questionIds)->get()->keyBy('id');

        // Idempotency: resubmitting this section (double click, browser
        // back) must not double-count marks or duplicate answer rows.
        $attempt->answers()->whereIn('question_id', $questionIds)->delete();

        $sectionScore = 0;
        $sectionTotal = $questions->count() * (float) $section->marks_per_question;
        $order = $attempt->answers()->count();

        foreach ($data['answers'] as $answer) {
            $question = $questions->get($answer['question_id']);
            $selectedOption = $answer['selected_option_id']
                ? $question->options->firstWhere('id', $answer['selected_option_id'])
                : null;
            $isCorrect = $selectedOption ? (bool) $selectedOption->is_correct : null;

            $marksAwarded = match (true) {
                $isCorrect === true => (float) $section->marks_per_question,
                $isCorrect === false => -1 * (float) $section->negative_marking,
                default => 0,
            };
            $sectionScore += $marksAwarded;
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

        MockExamAttemptSection::updateOrCreate(
            ['attempt_id' => $attempt->id, 'section_id' => $section->id],
            ['score' => $sectionScore, 'total_marks' => $sectionTotal],
        );

        $sections = $mockExam->sections()->orderBy('order')->get();
        $next = $this->sectionAfter($sections, $section);

        if ($next) {
            return redirect()->route('student.mock-exams.section', [$mockExam, $attempt, $next]);
        }

        return $this->finalizeAttempt($attempt);
    }

    private function finalizeAttempt(TestAttempt $attempt)
    {
        $attempt->load('sectionResults');
        $score = $attempt->sectionResults->sum('score');
        $total = $attempt->sectionResults->sum('total_marks');
        $percentage = $total > 0 ? round(max($score, 0) / $total * 100, 1) : 0;

        $attempt->update([
            'status' => 'submitted',
            'score' => $score,
            'total_marks' => $total,
            'percentage' => $percentage,
            'passed' => $percentage >= 50,
            'submitted_at' => now(),
        ]);

        return redirect()->route('student.attempts.show', $attempt);
    }

    private function nextSectionFor(MockExam $mockExam, TestAttempt $attempt): ?MockExamSection
    {
        $sections = $mockExam->sections()->orderBy('order')->get();
        $answeredQuestionIds = $attempt->answers()->pluck('question_id');

        foreach ($sections as $section) {
            $sectionQuestionIds = $section->questions()->pluck('question_bank.id');
            $done = $sectionQuestionIds->isNotEmpty() && $sectionQuestionIds->diff($answeredQuestionIds)->isEmpty();
            if (! $done) {
                return $section;
            }
        }

        return null;
    }

    private function sectionAfter(Collection $sections, MockExamSection $current): ?MockExamSection
    {
        return $sections->firstWhere('order', '>', $current->order);
    }

    private function submittedAttemptsCount(MockExam $mockExam, int $userId): int
    {
        return TestAttempt::where('user_id', $userId)
            ->where('attemptable_type', MockExam::class)
            ->where('attemptable_id', $mockExam->id)
            ->where('status', 'submitted')
            ->count();
    }

    private function canStart(MockExam $mockExam, int $attemptsUsed): bool
    {
        return ! $mockExam->attempt_limit || $attemptsUsed < $mockExam->attempt_limit;
    }

    private function authorizeEnrollment(Request $request, MockExam $mockExam): void
    {
        $enrolled = $request->user()->enrollments()
            ->where('course_id', $mockExam->course_id)
            ->where('status', 'active')
            ->exists();

        abort_unless($enrolled, 403, 'You must be enrolled in this course.');
    }

    private function authorizeAttempt(Request $request, TestAttempt $attempt, MockExam $mockExam): void
    {
        abort_unless($attempt->user_id === $request->user()->id, 403);
        abort_unless($attempt->attemptable_type === MockExam::class && $attempt->attemptable_id === $mockExam->id, 403);
        abort_unless($attempt->status === 'in_progress', 403, 'This attempt has already been submitted.');
    }
}
