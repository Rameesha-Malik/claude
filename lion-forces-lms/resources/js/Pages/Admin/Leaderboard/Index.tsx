import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Row {
    rank: number;
    user: { name: string; email: string } | null;
    attempts_count: number;
    avg_percentage: number;
    best_percentage: number;
}
interface Props { leaderboard: Row[] }

function medal(rank: number): string | null {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
}

export default function LeaderboardIndex({ leaderboard }: Props) {
    return (
        <AdminLayout header="Leaderboard">
            <Head title="Leaderboard" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Ranked by average score across every submitted practice test, quiz, mock exam, and staged test attempt.
                Top {leaderboard.length} students shown.
            </p>

            {leaderboard.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No submitted test attempts yet — the leaderboard fills in as students take tests.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th className="px-5 py-3">Rank</th>
                                <th className="px-5 py-3">Student</th>
                                <th className="px-5 py-3">Attempts</th>
                                <th className="px-5 py-3">Avg Score</th>
                                <th className="px-5 py-3">Best Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {leaderboard.map((row) => (
                                <tr key={row.rank} className={row.rank <= 3 ? 'bg-primary-subtle' : ''}>
                                    <td className="px-5 py-3 font-bold text-text">
                                        {medal(row.rank) ?? `#${row.rank}`}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-text">{row.user?.name}</div>
                                        <div className="text-xs text-text-muted">{row.user?.email}</div>
                                    </td>
                                    <td className="px-5 py-3 text-text-secondary">{row.attempts_count}</td>
                                    <td className="px-5 py-3 font-bold text-primary">{row.avg_percentage}%</td>
                                    <td className="px-5 py-3 text-text-secondary">{row.best_percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
