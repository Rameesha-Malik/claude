<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CustomQuizConfig;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\TestAttemptAnswer;
use App\Models\Topic;
use App\Support\FeatureFlags;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Client: a plain-language home for the whole "Question Bank -> Enroll ->
 * Create Test" flow -- admin couldn't find anything about Custom Quiz
 * anywhere in the admin panel, because there genuinely wasn't one; the
 * feature only ever had a toggle buried in Settings and no page of its
 * own. This is read-only oversight (who's using it, with what filters,
 * what they scored) plus pointers to the two places admin actually
 * manages the pieces underneath it -- Content Library for the question
 * bank/Subjects/Topics, and Settings for the on/off switch -- rather than
 * duplicating either of those screens here.
 */
class CustomQuizController extends Controller
{
    public function index(): Response
    {
        // Client, from a UWorld QBank walkthrough: platform-wide "bank
        // coverage" -- how much of the question bank has ever actually
        // been seen by a student, not per-student (the Student Dashboard
        // already has the per-student version; Admin Dashboard already
        // has total questions + platform accuracy -- coverage is the one
        // UWorld-style number neither of those shows).
        $totalQuestions = QuestionBank::count();
        $usedQuestions = TestAttemptAnswer::whereNotNull('is_correct')->distinct('question_id')->count('question_id');

        $rawConfigs = CustomQuizConfig::with(['user:id,name,email', 'attempts'])
            ->latest()
            ->limit(50)
            ->get();

        // subject_ids/topic_ids are plain JSON arrays, not a relation --
        // one bulk name lookup across the whole page instead of a query
        // per row.
        $subjectNames = Subject::whereIn('id', $rawConfigs->pluck('subject_ids')->flatten()->filter()->unique())->pluck('name', 'id');
        $topicNames = Topic::whereIn('id', $rawConfigs->pluck('topic_ids')->flatten()->filter()->unique())->pluck('name', 'id');

        $configs = $rawConfigs->map(fn (CustomQuizConfig $config) => [
            'id' => $config->id,
            'user' => $config->user?->only('name', 'email'),
            'subject' => CustomQuizConfig::summarizeNames(collect($config->subject_ids ?? [])->map(fn ($id) => $subjectNames->get($id))->filter()->all()),
            'topic' => CustomQuizConfig::summarizeNames(collect($config->topic_ids ?? [])->map(fn ($id) => $topicNames->get($id))->filter()->all()),
            'difficulty' => $config->difficulty,
            'question_count' => $config->question_count,
            'created_at' => $config->created_at,
            'percentage' => $config->attempts->first()?->percentage,
        ]);

        return Inertia::render('Admin/CustomQuiz/Index', [
            'configs' => $configs,
            'enabled' => FeatureFlags::enabled('custom_quiz'),
            'stats' => [
                'total_generated' => CustomQuizConfig::count(),
                'subjects_with_questions' => Subject::has('questions')->count(),
                'topics_with_questions' => Topic::has('questions')->count(),
                'bank_coverage' => [
                    'used' => $usedQuestions,
                    'total' => $totalQuestions,
                    'percentage' => $totalQuestions > 0 ? round($usedQuestions / $totalQuestions * 100, 1) : 0,
                ],
            ],
            // Custom Quiz is only reachable from a course whose "quizzes"
            // module is switched on (Course > Details > Modules) -- that
            // checkbox doesn't say so, so this is the one place that makes
            // it visible which courses actually let a student in, without
            // having to open every course to check.
            'courses' => Course::orderBy('title')->get(['id', 'title', 'quizzes_enabled']),
        ]);
    }
}
