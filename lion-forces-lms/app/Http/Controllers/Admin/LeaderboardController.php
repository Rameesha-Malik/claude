<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ranks students by their average score across every submitted test
 * attempt (practice tests, quizzes, mock exams, staged tests -- anything
 * recorded in test_attempts) within the selected year. Built entirely
 * from data already collected per attempt (percentage), no new schema
 * needed.
 */
class LeaderboardController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) ($request->year ?? now()->year);

        $rows = TestAttempt::where('status', 'submitted')
            ->whereYear('created_at', $year)
            ->selectRaw('user_id, COUNT(*) as attempts_count, AVG(percentage) as avg_percentage, MAX(percentage) as best_percentage')
            ->groupBy('user_id')
            ->orderByDesc('avg_percentage')
            ->get();

        $users = User::whereIn('id', $rows->pluck('user_id'))
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q2) => $q2->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->get(['id', 'name', 'email'])->keyBy('id');

        $leaderboard = $rows->values()
            ->map(fn ($row, $i) => [
                'rank' => $i + 1,
                'user' => $users->get($row->user_id)?->only('name', 'email'),
                'attempts_count' => (int) $row->attempts_count,
                'avg_percentage' => round((float) $row->avg_percentage, 1),
                'best_percentage' => round((float) $row->best_percentage, 1),
            ])
            ->filter(fn ($row) => $row['user'] !== null)
            ->values();

        // Platform-wide numbers for the year -- unaffected by the search
        // box, which only narrows the ranked list below.
        $yearAttempts = TestAttempt::where('status', 'submitted')->whereYear('created_at', $year);
        $participants = (clone $yearAttempts)->distinct('user_id')->count('user_id');
        $quizzesSubmitted = (clone $yearAttempts)->count();
        $averageScore = round((clone $yearAttempts)->avg('percentage') ?? 0, 1);

        $monthly = (clone $yearAttempts)
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->groupBy('month')
            ->pluck('total', 'month');
        $activityByMonth = collect(range(1, 12))->map(fn ($m) => (int) ($monthly[$m] ?? 0));

        $topPerformersCount = (int) ceil($leaderboard->count() * 0.1);
        $availableYears = TestAttempt::where('status', 'submitted')
            ->selectRaw('DISTINCT YEAR(created_at) as y')->pluck('y')->sortDesc()->values();
        if ($availableYears->isEmpty() || ! $availableYears->contains(now()->year)) {
            $availableYears->prepend(now()->year);
        }

        return Inertia::render('Admin/Leaderboard/Index', [
            'leaderboard' => $leaderboard,
            'year' => $year,
            'availableYears' => $availableYears->unique()->sortDesc()->values(),
            'filters' => $request->only('search'),
            'stats' => [
                'participants' => $participants,
                'quizzes_submitted' => $quizzesSubmitted,
                'average_score' => $averageScore,
                'activity_by_month' => $activityByMonth,
                'top_performers_count' => $topPerformersCount,
                'others_count' => max($leaderboard->count() - $topPerformersCount, 0),
            ],
        ]);
    }
}
