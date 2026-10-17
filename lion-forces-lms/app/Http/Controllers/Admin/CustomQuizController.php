<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CustomQuizConfig;
use App\Models\Subject;
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
        $configs = CustomQuizConfig::with(['user:id,name,email', 'subject:id,name', 'topic:id,name', 'attempts'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (CustomQuizConfig $config) => [
                'id' => $config->id,
                'user' => $config->user?->only('name', 'email'),
                'subject' => $config->subject?->name,
                'topic' => $config->topic?->name,
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
