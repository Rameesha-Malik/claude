import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AccordionRow from '@/Components/AccordionRow';
import CustomQuizTabs from '@/Components/CustomQuizTabs';
import LiquidButton from '@/Components/LiquidButton';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string | null; image_path: string | null; is_correct: boolean }
interface Question {
    id: number; question_text: string; image_path: string | null; explanation: string | null; difficulty: string;
    subject: { id: number; name: string } | null; options: Option[];
}
interface Props { questions: Question[]; hasAccess: boolean }

// An open-book icon -- this is literally a question-bank browser, not a
// decorative glyph.
const BOOK_PATH = 'M4 19.5V6a2 2 0 012-2h4a2 2 0 012 2v13.5M4 19.5a2 2 0 002 2h4a2 2 0 002-2M4 19.5V17m8 2.5V6a2 2 0 012-2h4a2 2 0 012 2v13.5m-8 0a2 2 0 002 2h4a2 2 0 002-2m-8 0V17';

function QuestionCard({ q }: { q: Question }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <AccordionRow
            icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={BOOK_PATH} />
                </svg>
            }
            title={<LiteMarkdownInline text={q.question_text} />}
            pill={
                q.subject && (
                    <LiquidButton className="px-2.5 py-0.5 text-xs uppercase tracking-wide">
                        {q.subject.name}
                    </LiquidButton>
                )
            }
            subtitle={`${q.difficulty.charAt(0).toUpperCase()}${q.difficulty.slice(1)} difficulty`}
        >
            {q.image_path && <img src={`/storage/${q.image_path}`} alt="" className="mb-3 max-h-48 rounded-[0.75rem] border border-border" />}

            {revealed ? (
                <>
                    <div className="space-y-2">
                        {q.options.map((opt) => (
                            <div key={opt.id} className={`rounded-[1.5rem] border p-3 text-sm ${opt.is_correct ? 'border-success bg-success-bg text-text' : 'border-border text-text-secondary'}`}>
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
                        <div className="mt-3 rounded-[1.5rem] bg-primary-subtle p-3 text-sm text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            <LiteMarkdownInline text={q.explanation} />
                        </div>
                    )}
                    <LiquidButton onClick={() => setRevealed(false)} className="mt-3 px-4 py-2 text-sm uppercase tracking-wide">
                        Hide Answer
                    </LiquidButton>
                </>
            ) : (
                <LiquidButton onClick={() => setRevealed(true)} className="px-4 py-2 text-sm uppercase tracking-wide">
                    Reveal Answer
                </LiquidButton>
            )}
        </AccordionRow>
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

            {!hasAccess && (
                <div className="mb-6 rounded-[2rem] border border-dashed border-border bg-surface p-6 text-center text-text-secondary">
                    <p className="font-bold text-text">You're viewing a free sample</p>
                    <p className="mt-1 text-sm">
                        Buy a course with Quiz access to browse its full question bank with answers. These {questions.length} questions are a
                        free taste of how Browse works.
                    </p>
                    <LiquidButton href="/courses" className="mt-4 px-5 py-2.5 text-sm uppercase tracking-wide">
                        Browse Courses
                    </LiquidButton>
                </div>
            )}

            {questions.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    No questions in your bank yet.
                </div>
            ) : (
                <div>
                    {subjects.length > 1 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            <LiquidButton
                                onClick={() => setSubjectId(null)}
                                tone={subjectId === null ? 'dark' : 'light'}
                                className="px-4 py-2 text-sm uppercase tracking-wide"
                            >
                                All <span className="opacity-70">({questions.length})</span>
                            </LiquidButton>
                            {subjects.map((s) => (
                                <LiquidButton
                                    key={s.id}
                                    onClick={() => setSubjectId(s.id)}
                                    tone={subjectId === s.id ? 'dark' : 'light'}
                                    className="px-4 py-2 text-sm uppercase tracking-wide"
                                >
                                    {s.name} <span className="opacity-70">({questions.filter((q) => q.subject?.id === s.id).length})</span>
                                </LiquidButton>
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
