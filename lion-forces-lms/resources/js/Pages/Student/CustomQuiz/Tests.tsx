import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import StudentLayout from '@/Layouts/StudentLayout';

interface HistoryItem {
    id: number; name: string | null; subject: string | null; topic: string | null; difficulty: string | null;
    question_count: number; mode: 'tutor' | 'timed'; created_at: string; attempt_id: number | null; percentage: string | null;
}
interface Props { history: HistoryItem[] }

function scoreTone(pct: number): string {
    if (pct >= 70) return 'bg-success-bg text-success';
    if (pct >= 50) return 'bg-warning-bg text-warning';
    return 'bg-danger-bg text-danger';
}

// UWorld's own "Tests" tab -- every custom quiz a student has built, with
// a way to pick up an unsubmitted one, retake with a fresh random pick of
// the same filters, or clear out old ones. Previously folded inline under
// the Create Test form; now its own page behind the shared tab bar.
export default function CustomQuizTests({ history }: Props) {
    function destroy(id: number) {
        if (confirm('Remove this from your test history? This cannot be undone.')) {
            router.delete(`/portal/custom-quiz/${id}`, { preserveScroll: true });
        }
    }

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz: Tests" />

            <CustomQuizTabs active="tests" />

            <div className="mx-auto max-w-lg">
                {history.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        No tests yet.{' '}
                        <Link href="/portal/custom-quiz" className="font-bold text-primary hover:underline">
                            Build your first custom quiz &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((h) => (
                            <div key={h.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-text">
                                        {h.name ?? `${h.subject ?? 'Any subject'}${h.topic ? ` / ${h.topic}` : ''}`}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {h.question_count} question{h.question_count === 1 ? '' : 's'}
                                        {h.difficulty ? ` · ${h.difficulty}` : ''}
                                        {h.mode === 'timed' ? ' · Timed' : ''} · {new Date(h.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    {h.percentage !== null ? (
                                        <Link href={`/portal/attempts/${h.attempt_id}`} className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreTone(Number(h.percentage))}`}>
                                            {h.percentage}%
                                        </Link>
                                    ) : (
                                        <Link href={`/portal/custom-quiz/${h.id}`} className="rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20">
                                            Resume
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => router.post(`/portal/custom-quiz/${h.id}/duplicate`)}
                                        title="Retake with a fresh random pick"
                                        className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-text-secondary hover:border-primary hover:text-primary"
                                    >
                                        Retake
                                    </button>
                                    <button onClick={() => destroy(h.id)} title="Remove" className="text-text-muted hover:text-danger">
                                        <Icon d="M6 18L18 6M6 6l12 12" className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
