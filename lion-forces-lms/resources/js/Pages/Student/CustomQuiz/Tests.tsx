import { Head, Link, router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import LiquidButton from '@/Components/LiquidButton';
import StudentLayout from '@/Layouts/StudentLayout';

interface HistoryItem {
    id: number; name: string | null; subject: string | null; topic: string | null; difficulty: string | null;
    question_count: number; mode: 'tutor' | 'timed'; created_at: string; attempt_id: number | null; percentage: string | null;
}
interface Props { history: HistoryItem[] }

function scoreTone(pct: number): 'success' | 'warning' | 'danger' {
    if (pct >= 70) return 'success';
    if (pct >= 50) return 'warning';
    return 'danger';
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

            {history.length === 0 ? (
                <div className="mx-auto max-w-lg rounded-[2rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No tests yet.{' '}
                    <Link href="/portal/custom-quiz" className="font-bold text-primary hover:underline">
                        Build your first custom quiz &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {history.map((h) => (
                        <div key={h.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-surface p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-text">
                                        {h.name ?? `${h.subject ?? 'Any subject'}${h.topic ? ` / ${h.topic}` : ''}`}
                                    </p>
                                    <p className="mt-0.5 text-xs text-text-muted">
                                        {h.question_count} question{h.question_count === 1 ? '' : 's'}
                                        {h.difficulty ? ` · ${h.difficulty}` : ''}
                                        {h.mode === 'timed' ? ' · Timed' : ''}
                                    </p>
                                    <p className="text-xs text-text-muted">{new Date(h.created_at).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => destroy(h.id)} title="Remove" className="flex-shrink-0 text-text-muted hover:text-danger">
                                    <Icon d="M6 18L18 6M6 6l12 12" className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-auto flex flex-wrap items-center gap-2">
                                {h.percentage !== null ? (
                                    <LiquidButton href={`/portal/attempts/${h.attempt_id}`} tone={scoreTone(Number(h.percentage))} className="px-3 py-1.5 text-xs">
                                        {h.percentage}%
                                    </LiquidButton>
                                ) : (
                                    <LiquidButton href={`/portal/custom-quiz/${h.id}`} tone="dark" className="px-3 py-1.5 text-xs uppercase tracking-wide">
                                        Resume
                                    </LiquidButton>
                                )}
                                <LiquidButton
                                    onClick={() => router.post(`/portal/custom-quiz/${h.id}/duplicate`)}
                                    tone="light"
                                    title="Retake with a fresh random pick"
                                    className="px-3 py-1.5 text-xs uppercase tracking-wide"
                                >
                                    Retake
                                </LiquidButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </StudentLayout>
    );
}
