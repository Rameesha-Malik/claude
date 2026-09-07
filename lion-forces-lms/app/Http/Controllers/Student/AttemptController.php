<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CustomQuizConfig;
use App\Models\MockExam;
use App\Models\PracticeTest;
use App\Models\Quiz;
use App\Models\StagedTest;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A single result endpoint for every attemptable type (Practice Test, Mock
 * Exam, Staged Test) — they all write into the same test_attempts table, so
 * one route dispatches to the right result page instead of forking
 * /portal/attempts/{id} three ways.
 */
class AttemptController extends Controller
{
    public function show(Request $request, TestAttempt $attempt): Response
    {
        abort_unless($attempt->user_id === $request->user()->id, 403);

        return match ($attempt->attemptable_type) {
            MockExam::class => $this->mockExamResult($attempt),
            StagedTest::class => $this->stagedTestResult($attempt),
            Quiz::class => $this->quizResult($attempt),
            CustomQuizConfig::class => $this->customQuizResult($attempt),
            default => $this->practiceTestResult($attempt),
        };
    }

    // Reuses Quizzes/Result.tsx as-is -- not routed through quizResult()
    // itself because that assumes a real Quiz record ($quiz->title,
    // ->is_repeatable) which a CustomQuizConfig doesn't have; isRepeatable:
    // false / quizId: null here just means that page's "Retake Quiz" link
    // doesn't render (a custom quiz has no single fixed id to retake).
    private function customQuizResult(TestAttempt $attempt): Response
    {
        $attempt->load(['answers.question.options', 'answers.selectedOption']);
        $config = $attempt->attemptable()->with('subject')->first();
        $title = $config?->subject?->name ? "Custom Quiz — {$config->subject->name}" : 'Custom Quiz';

        return Inertia::render('Student/Quizzes/Result', [
            'attempt' => $attempt,
            'quizTitle' => $title,
            'isRepeatable' => false,
            'quizId' => null,
        ]);
    }

    private function practiceTestResult(TestAttempt $attempt): Response
    {
        $attempt->load(['answers.question.options', 'answers.selectedOption']);
        $attemptable = $attempt->attemptable()->first();

        return Inertia::render('Student/PracticeTests/Result', [
            'attempt' => $attempt,
            'testTitle' => $attemptable->title ?? 'Test',
            'isRepeatable' => $attemptable->is_repeatable ?? true,
            'practiceTestId' => $attempt->attemptable_id,
        ]);
    }

    private function quizResult(TestAttempt $attempt): Response
    {
        $attempt->load(['answers.question.options', 'answers.selectedOption']);
        $quiz = $attempt->attemptable()->first();

        return Inertia::render('Student/Quizzes/Result', [
            'attempt' => $attempt,
            'quizTitle' => $quiz->title ?? 'Quiz',
            'isRepeatable' => $quiz->is_repeatable ?? true,
            'quizId' => $attempt->attemptable_id,
        ]);
    }

    private function mockExamResult(TestAttempt $attempt): Response
    {
        $attempt->load(['answers.question.options', 'answers.selectedOption', 'sectionResults.section']);
        $mockExam = $attempt->attemptable()->with('sections')->first();

        // Group the flat answers list back under their section, in section
        // order, so the result page can show a per-section review.
        $sections = $mockExam->sections->sortBy('order')->values();
        $sectionBreakdown = $sections->map(function ($section) use ($attempt) {
            $questionIds = $section->questions()->pluck('question_bank.id');
            $result = $attempt->sectionResults->firstWhere('section_id', $section->id);

            return [
                'id' => $section->id,
                'name' => $section->name,
                'score' => $result?->score ?? '0.00',
                'total_marks' => $result?->total_marks ?? '0.00',
                'answers' => $attempt->answers->whereIn('question_id', $questionIds)->values(),
            ];
        });

        return Inertia::render('Student/MockExams/Result', [
            'attempt' => $attempt->only('id', 'score', 'total_marks', 'percentage', 'passed'),
            'examTitle' => $mockExam->title,
            'sections' => $sectionBreakdown,
        ]);
    }

    private function stagedTestResult(TestAttempt $attempt): Response
    {
        $attempt->load(['answers.question.options', 'answers.selectedOption', 'stageResults.stage']);
        $stagedTest = $attempt->attemptable()->with('stages')->first();

        $stages = $stagedTest->stages->sortBy('order')->values();
        $stageBreakdown = $stages->map(function ($stage) use ($attempt) {
            $questionIds = $stage->questions()->pluck('question_bank.id');
            $result = $attempt->stageResults->firstWhere('stage_id', $stage->id);

            return [
                'id' => $stage->id,
                'name' => $stage->name,
                'score' => $result?->score ?? '0.00',
                'total_marks' => $result?->total_marks ?? '0.00',
                'passed' => $result?->passed ?? false,
                'completed' => $result !== null,
                'answers' => $attempt->answers->whereIn('question_id', $questionIds)->values(),
            ];
        });

        return Inertia::render('Student/StagedTests/Result', [
            'attempt' => $attempt->only('id', 'score', 'total_marks', 'percentage', 'passed'),
            'testTitle' => $stagedTest->title,
            'stages' => $stageBreakdown,
        ]);
    }
}
