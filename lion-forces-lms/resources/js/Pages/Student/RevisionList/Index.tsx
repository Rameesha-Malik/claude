import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AccordionRow from '@/Components/AccordionRow';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[]; subject: { name: string } | null }
interface RevisionItem { id: number; times_wrong: number; last_wrong_at: string; question: Question }
interface Props { items: RevisionItem[] }

// A flagged-pennant icon -- genuinely what this list is (questions flagged
// because they were missed), not a decorative glyph.
const FLAG_PATH = 'M6 3v18M6 4h12l-2.5 3.5L18 11H6';

// Answer stays hidden until the student actively asks for it -- self-testing
// ("do I actually know this now?") is the point of a revision list, not
// re-reading the same explanation passively the way the attempt result
// pages show it immediately.
function RevisionCard({ item }: { item: RevisionItem }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <AccordionRow
            icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={FLAG_PATH} />
                </svg>
            }
            iconBg="var(--color-warning)"
            title={<LiteMarkdownInline text={item.question.question_text} />}
            pill={
                <span className="flex-shrink-0 rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-bold uppercase text-warning">
                    Missed {item.times_wrong}×
                </span>
            }
            subtitle={`Last missed ${new Date(item.last_wrong_at).toLocaleDateString()}`}
        >
            {revealed ? (
                <>
                    <div className="space-y-2">
                        {item.question.options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`rounded-[1.5rem] border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}
                            >
                                {opt.option_text}
                                {opt.is_correct && <span className="ml-2 text-xs font-bold uppercase text-success">Correct Answer</span>}
                            </div>
                        ))}
                    </div>
                    {item.question.explanation && (
                        <div className="mt-3 rounded-[1.5rem] bg-primary-subtle p-3 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            <LiteMarkdownInline text={item.question.explanation} />
                        </div>
                    )}
                    <button
                        onClick={() => setRevealed(false)}
                        className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary"
                    >
                        Hide Answer
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setRevealed(true)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary"
                >
                    Reveal Answer
                </button>
            )}

            <p className="mt-3 text-xs text-text-muted">This stays here until you answer it correctly on a later attempt.</p>
        </AccordionRow>
    );
}

// Grouped by the question's real subject (client: questions "need to belong
// to their actual category so it is easy to" revise one subject at a time),
// instead of one flat list -- preserves the order subjects first show up in
// (already most-recently-missed-first from the backend), "General" catching
// any question with no subject assigned.
function groupBySubject(items: RevisionItem[]): [string, RevisionItem[]][] {
    const groups = new Map<string, RevisionItem[]>();
    for (const item of items) {
        const subject = item.question.subject?.name ?? 'General';
        if (!groups.has(subject)) groups.set(subject, []);
        groups.get(subject)!.push(item);
    }
    return Array.from(groups.entries());
}

export default function RevisionListIndex({ items }: Props) {
    const groups = groupBySubject(items);

    return (
        <StudentLayout header="Revision List">
            <Head title="Revision List" />

            <p className="mb-6 max-w-2xl text-sm text-text-secondary">
                Every question you've gotten wrong on a practice test, quiz, staged test, or mock exam lands here automatically,
                grouped by subject. Getting it right on a later attempt clears it from this list.
            </p>

            {items.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    Nothing to revise right now. Either you haven't taken a test yet, or you're getting everything right. Keep it up!
                </div>
            ) : (
                <RevealOnScroll staggerMs={60} className="space-y-10">
                    {groups.map(([subject, groupItems]) => (
                        <div key={subject}>
                            <h2 className="mb-4 flex items-center gap-2 font-display text-xl uppercase tracking-wide text-text">
                                {subject}
                                <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold text-text-muted">{groupItems.length}</span>
                            </h2>
                            <div className="space-y-5">
                                {groupItems.map((item) => (
                                    <RevisionCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
