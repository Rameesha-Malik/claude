import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Row {
    rank: number;
    user: { name: string; email: string } | null;
    attempts_count: number;
    avg_percentage: number;
    best_percentage: number;
}
interface Stats {
    participants: number; quizzes_submitted: number; average_score: number;
    activity_by_month: number[]; top_performers_count: number; others_count: number;
}
interface Props {
    leaderboard: Row[];
    year: number;
    availableYears: number[];
    filters: { search?: string };
    stats: Stats;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MEDALS = ['🥇', '🥈', '🥉'];

function initials(name: string) {
    return name.trim().slice(0, 2).toUpperCase();
}

export default function LeaderboardIndex({ leaderboard, year, availableYears, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const maxMonth = Math.max(...stats.activity_by_month, 1);
    const totalForDonut = stats.top_performers_count + stats.others_count;
    const topPct = totalForDonut > 0 ? (stats.top_performers_count / totalForDonut) * 100 : 0;

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/leaderboard', { year, search: search || undefined }, { preserveState: true });
    }

    function changeYear(y: string) {
        router.get('/admin/leaderboard', { year: y, search: search || undefined }, { preserveState: true });
    }

    return (
        <AdminLayout header="Leaderboard">
            <Head title="Leaderboard" />

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-border bg-gradient-to-br from-primary-subtle to-surface p-6 sm:p-8">
                <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                        🏆 Performance
                    </span>
                    <h1 className="mt-4 font-display text-3xl text-text">Leaderboard</h1>
                    <p className="mt-2 max-w-xl text-sm text-text-secondary">Top performers by quiz score for the selected year.</p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                    <select
                        value={year}
                        onChange={(e) => changeYear(e.target.value)}
                        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-bold text-text"
                    >
                        {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <form onSubmit={submitSearch}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email…"
                            className="w-64 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                        />
                    </form>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Best performers for {year}</p>
                        {top3.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                                No submitted test attempts in {year} yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-3">
                                {top3.map((row) => (
                                    <div key={row.rank} className="relative rounded-3xl border border-border bg-surface p-5 text-center shadow-sm">
                                        <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-secondary">
                                            {MEDALS[row.rank - 1]} {row.rank === 1 ? '1st' : row.rank === 2 ? '2nd' : '3rd'}
                                        </span>
                                        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-lg font-bold text-on-secondary">
                                            {initials(row.user!.name)}
                                        </div>
                                        <p className="mt-3 truncate font-bold text-text">{row.user!.name}</p>
                                        <p className="truncate text-xs text-text-muted">{row.user!.email}</p>
                                        <div className="mt-4 flex justify-center gap-6 border-t border-border pt-3">
                                            <div>
                                                <p className="font-display text-xl text-text">{row.attempts_count}</p>
                                                <p className="text-xs text-text-muted">Quizzes</p>
                                            </div>
                                            <div>
                                                <p className="font-display text-xl text-primary">{row.avg_percentage}</p>
                                                <p className="text-xs text-text-muted">Score</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">Other students</p>
                        {rest.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                                No more students to show (top 3 only).
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead className="border-b border-border bg-surface-sunken text-xs uppercase tracking-wide text-text-muted">
                                        <tr>
                                            <th className="px-5 py-3">Rank</th>
                                            <th className="px-5 py-3">Student</th>
                                            <th className="px-5 py-3">Quizzes</th>
                                            <th className="px-5 py-3">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rest.map((row) => (
                                            <tr key={row.rank}>
                                                <td className="px-5 py-3 font-bold text-text">#{row.rank}</td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-text">{row.user?.name}</div>
                                                    <div className="text-xs text-text-muted">{row.user?.email}</div>
                                                </td>
                                                <td className="px-5 py-3 text-text-secondary">{row.attempts_count}</td>
                                                <td className="px-5 py-3 font-bold text-primary">{row.avg_percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-border bg-surface p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="font-bold text-text">Platform statistics</p>
                        </div>
                        <p className="mb-3 text-xs font-bold uppercase text-text-muted">For {year}</p>
                        <div className="space-y-3">
                            {[
                                ['Participants', stats.participants],
                                ['Quizzes submitted', stats.quizzes_submitted],
                                ['Average score', stats.average_score],
                            ].map(([label, value]) => (
                                <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary">•</span>
                                    <div>
                                        <p className="text-xs text-text-muted">{label}</p>
                                        <p className="font-display text-lg text-text">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-surface p-5">
                        <p className="font-bold text-text">Activity</p>
                        <p className="mb-4 text-xs text-text-muted">{year} — Quizzes per month</p>
                        <div className="flex h-32 items-end gap-1.5">
                            {stats.activity_by_month.map((count, i) => (
                                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                                    <div
                                        className="w-full rounded-t bg-primary transition-all"
                                        style={{ height: `${Math.max((count / maxMonth) * 100, count > 0 ? 6 : 2)}%` }}
                                        title={`${MONTH_LABELS[i]}: ${count}`}
                                    />
                                    <span className="text-[0.6rem] text-text-muted">{MONTH_LABELS[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-surface p-5">
                        <p className="mb-4 font-bold text-text">Distribution</p>
                        <div className="flex items-center gap-5">
                            <div
                                className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full"
                                style={{ background: `conic-gradient(var(--color-primary) ${topPct * 3.6}deg, var(--color-border) 0)` }}
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-sm font-bold text-text">
                                    {Math.round(topPct)}%
                                </div>
                            </div>
                            <div className="text-sm text-text-secondary">
                                <p>Top performers (top 10%): <span className="font-bold text-text">{stats.top_performers_count}</span></p>
                                <p>Others: <span className="font-bold text-text">{stats.others_count}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
