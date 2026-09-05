<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestAttempt;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ranks students by their average score across every submitted test
 * attempt (practice tests, quizzes, mock exams, staged tests -- anything
 * recorded in test_attempts). Built entirely from data already collected
 * per attempt (percentage), no new schema needed.
 */
class LeaderboardController extends Controller
{
    public function index(): Response
    {
        $rows = TestAttempt::where('status', 'submitted')
            ->selectRaw('user_id, COUNT(*) as attempts_count, AVG(percentage) as avg_percentage, MAX(percentage) as best_percentage')
            ->groupBy('user_id')
            ->orderByDesc('avg_percentage')
            ->limit(50)
            ->get();

        $users = User::whereIn('id', $rows->pluck('user_id'))->get(['id', 'name', 'email'])->keyBy('id');

        $leaderboard = $rows->values()->map(fn ($row, $i) => [
            'rank' => $i + 1,
            'user' => $users->get($row->user_id)?->only('name', 'email'),
            'attempts_count' => (int) $row->attempts_count,
            'avg_percentage' => round((float) $row->avg_percentage, 1),
            'best_percentage' => round((float) $row->best_percentage, 1),
        ])->filter(fn ($row) => $row['user'] !== null)->values();

        return Inertia::render('Admin/Leaderboard/Index', [
            'leaderboard' => $leaderboard,
        ]);
    }
}
