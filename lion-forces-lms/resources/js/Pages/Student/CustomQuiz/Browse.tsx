import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string | null; image_path: string | null; is_correct: boolean }
interface Question {
    id: number; question_text: string; image_path: string | null; explanation: string | null; difficulty: string;
    subject: { id: number; name: string } | null; options: Option[];
}
interface Props { questions: Question[]; hasAccess: boolean }

function QuestionCard({ q }: { q: Question }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-3 flex flex-wrap gap-2">
                {q.subject && <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">{q.subject.name}</span>}
                <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-text-muted">{q.difficulty}</span>
            </div>
            {q.image_path && <img src={`/storage/${q.image_path}`} alt="" className="mb-3 max-h-48 rounded-lg border border-border" />}
            <p className="font-semibold text-text"><LiteMarkdownInline text={q.question_text} /></p>

            {revealed ? (
                <>
                    <div className="mt-3 space-y-2">
                        {q.options.map((opt) => (
                            <div key={opt.id} className={`rounded-2xl border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}>
                                {opt.image_path ? (
                                    <img src={`/storage/${opt.image_path}`} alt="" className="max-h-32 rounded" />
                                ) : (
                                    opt.option_text
                                )}
                                {opt.is_correct && <span className="ml-2 text-xs font-bold uppercase text-success">Correct Answer</span>}
                            </div>
                        ))}
                    </div>
                    {q.explanation && (
                        <div className="mt-3 rounded-2xl bg-primary-subtle p-3 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            <LiteMarkdownInline text={q.explanation} />
                        </div>
                    )}
                </>
            ) : (
                <button
                    onClick={() => setRevealed(true)}
                    className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary"
                >
                    Reveal Answer
                </button>
            )}
        </div>
    );
}

// UWorld's own "Browse questions" view -- read-only exploration of the
// real question bank: pick a subject, see every question in it with its
// answer. Distinct from Create Test's Subject picker (only ever shows a
// name + count there, never an actual question) and from Favorites (only
// starred ones). Same reveal-on-click idiom already used on the
// Favourite Questions page and the per-course Question Bank tab.
export default function CustomQuizBrowse({ questions, hasAccess }: Props) {
    const [subjectId, setSubjectId] = useState<number | null>(null);

    const subjects = Array.from(
        new Map(questions.filter((q) => q.subject).map((q) => [q.subject!.id, q.subject!])).values(),
    );

    const filtered = subjectId ? questions.filter((q) => q.subject?.id === subjectId) : questions;

    return (
        <StudentLayout header="Custom Quiz">
            <Head title="Custom Quiz: Browse" />

            <CustomQuizTabs active="browse" />

            {!hasAccess ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    <p className="font-bold text-text">Browse is part of Quiz access</p>
                    <p className="mt-1 text-sm">Buy a course with Quiz access to browse its full question bank with answers.</p>
                    <Link href="/courses" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                        Browse Courses
                    </Link>
                </div>
            ) : questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No questions in your bank yet.
                </div>
            ) : (
                <div>
                    {subjects.length > 1 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => setSubjectId(null)}
                                className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                                    subjectId === null ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'
                                }`}
                            >
                                All <span className="opacity-70">({questions.length})</span>
                            </button>
                            {subjects.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSubjectId(s.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                                        subjectId === s.id ? 'bg-primary text-on-primary' : 'bg-surface-sunken text-text-secondary hover:bg-primary-subtle'
                                    }`}
                                >
                                    {s.name} <span className="opacity-70">({questions.filter((q) => q.subject?.id === s.id).length})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <RevealOnScroll staggerMs={30} className="space-y-3">
                        {filtered.map((q) => <QuestionCard key={q.id} q={q} />)}
                    </RevealOnScroll>
                </div>
            )}
        </StudentLayout>
    );
}
