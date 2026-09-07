import { Head } from '@inertiajs/react';
import { useState } from 'react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface RevisionItem { id: number; times_wrong: number; last_wrong_at: string; question: Question }
interface Props { items: RevisionItem[] }

// Answer stays hidden until the student actively asks for it -- self-testing
// ("do I actually know this now?") is the point of a revision list, not
// re-reading the same explanation passively the way the attempt result
// pages show it immediately.
function RevisionCard({ item }: { item: RevisionItem }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-text">{item.question.question_text}</p>
                <span className="flex-shrink-0 rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-bold uppercase text-warning">
                    Missed {item.times_wrong}×
                </span>
            </div>

            {revealed ? (
                <>
                    <div className="space-y-2">
                        {item.question.options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`rounded-2xl border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}
                            >
                                {opt.option_text}
                                {opt.is_correct && <span className="ml-2 text-xs font-bold uppercase text-success">Correct Answer</span>}
                            </div>
                        ))}
                    </div>
                    {item.question.explanation && (
                        <div className="mt-3 rounded-2xl bg-primary-subtle p-3 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            {item.question.explanation}
                        </div>
                    )}
                </>
            ) : (
                <button
                    onClick={() => setRevealed(true)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary"
                >
                    Reveal Answer
                </button>
            )}

            <p className="mt-3 text-xs text-text-muted">
                Last missed {new Date(item.last_wrong_at).toLocaleDateString()} — this stays here until you answer it correctly on a
                later attempt.
            </p>
        </div>
    );
}

export default function RevisionListIndex({ items }: Props) {
    return (
        <StudentLayout header="Revision List">
            <Head title="Revision List" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Every question you've gotten wrong on a practice test, quiz, staged test, or mock exam lands here automatically.
                Getting it right on a later attempt clears it from this list.
            </p>

            {items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    Nothing to revise right now — either you haven't taken a test yet, or you're getting everything right. Keep it up!
                </div>
            ) : (
                <RevealOnScroll staggerMs={40} className="space-y-5">
                    {items.map((item) => (
                        <RevisionCard key={item.id} item={item} />
                    ))}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
