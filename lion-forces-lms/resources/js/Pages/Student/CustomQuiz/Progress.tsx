import { Head, Link } from '@inertiajs/react';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import StudentLayout from '@/Layouts/StudentLayout';

interface Stats {
    totalQuestions: number;
    usedCount: number;
    unusedCount: number;
    bankCoveragePct: number;
    uniqueAccuracyPct: number;
    firstTryPct: number;
    wrongToRightCount: number;
    wrongToRightPct: number;
    regressionsCount: number;
    avgRetries: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    sessionsCount: number;
    lastTestPercentage: number | null;
    favoritesCount: number;
}
interface Props { hasAccess: boolean; stats: Stats | null }

function StatTile({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone: string }) {
    return (
        <div className={`rounded-2xl border p-4 ${tone}`}>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
            {sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
        </div>
    );
}

// UWorld's own "Progress" tab -- a stat grid over everything this
// student has answered from questions in their quiz-access course(s),
// across every assessment type (not just Custom Quiz -- see the
// controller's progress() for why). "Actionable signals" below is
// derived client-side from the same numbers in the tiles, never a
// separate fabricated figure.
export default function CustomQuizProgress({ hasAccess, stats }: Props) {
    const signals: string[] = [];
    if (stats) {
        if (stats.unusedCount > 0) {
            signals.push(`${stats.unusedCount} question(s) in your bank you haven't tried yet.`);
        }
        if (stats.regressionsCount > 0) {
            signals.push(`${stats.regressionsCount} question(s) you'd gotten right before have slipped back to wrong -- worth a quick review.`);
        }
        if (stats.wrongToRightCount > 0) {
            signals.push(`${stats.wrongToRightCount} question(s) you once got wrong are now correct -- keep it up.`);
        }
        if (stats.usedCount > 0 && stats.firstTryPct < 50) {
            signals.push("Less than half of your first attempts are correct -- consider reviewing fundamentals before taking on more new questions.");
        }
        if (stats.skippedCount > 0) {
            signals.push(`${stats.skippedCount} question(s) left unanswered on your latest attempt.`);
        }
        if (signals.length === 0 && stats.usedCount > 0) {
            signals.push('No red flags right now -- keep up the practice.');
        }
    }

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz: Progress" />

            <CustomQuizTabs active="progress" />

            {!hasAccess ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    <p className="font-bold text-text">Progress is part of Quiz access</p>
                    <p className="mt-1 text-sm">Buy a course with Quiz access to track your accuracy and coverage across its question bank.</p>
                    <Link href="/courses" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Browse Courses
                    </Link>
                </div>
            ) : !stats || stats.usedCount === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No answered questions yet -- take a test or quiz to start building your progress.
                </div>
            ) : (
                <div>
                    <p className="mb-4 text-sm text-text-secondary">
                        Based on every question you've answered from this bank, across Quizzes, Practice Tests, Mock Exams and Custom Quizzes -- not just Custom Quiz attempts.
                    </p>

                    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <StatTile
                            label="Bank Coverage"
                            value={`${stats.bankCoveragePct}%`}
                            sub={`${stats.usedCount}/${stats.totalQuestions} used`}
                            tone="border-primary bg-primary-subtle text-primary"
                        />
                        <StatTile label="Unique Accuracy" value={`${stats.uniqueAccuracyPct}%`} tone="border-primary bg-primary-subtle text-primary" />
                        <StatTile label="First Try" value={`${stats.firstTryPct}%`} tone="border-primary bg-primary-subtle text-primary" />
                        <StatTile label="Avg Retries" value={stats.avgRetries} tone="border-primary bg-primary-subtle text-primary" />

                        <StatTile label="Correct" value={stats.correctCount} tone="border-success bg-success-bg text-success" />
                        <StatTile label="Incorrect" value={stats.incorrectCount} tone="border-danger bg-danger-bg text-danger" />
                        <StatTile label="Skipped" value={stats.skippedCount} tone="border-border bg-surface-sunken text-text-muted" />
                        <StatTile
                            label="Wrong &rarr; Right"
                            value={stats.wrongToRightCount}
                            sub={`${stats.wrongToRightPct}% of ever-wrong`}
                            tone="border-success bg-success-bg text-success"
                        />

                        <StatTile
                            label="Regressions"
                            value={stats.regressionsCount}
                            tone={stats.regressionsCount > 0 ? 'border-danger bg-danger-bg text-danger' : 'border-border bg-surface-sunken text-text-muted'}
                        />
                        <StatTile label="Tests Taken" value={stats.sessionsCount} tone="border-border bg-surface-sunken text-text" />
                        <StatTile label="Last Test Score" value={stats.lastTestPercentage !== null ? `${stats.lastTestPercentage}%` : '--'} tone="border-border bg-surface-sunken text-text" />
                        <StatTile label="Favorites" value={stats.favoritesCount} tone="border-border bg-surface-sunken text-text" />
                    </div>

                    <div className="rounded-3xl border border-border bg-surface p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">Actionable Signals</p>
                        <ul className="space-y-2">
                            {signals.map((s, i) => (
                                <li key={i} className="flex gap-2 text-sm text-text">
                                    <span className="text-primary">&bull;</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
