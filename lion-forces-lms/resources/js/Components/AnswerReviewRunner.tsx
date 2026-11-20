import { useEffect, useState } from 'react';
import LiquidButton from '@/Components/LiquidButton';
import { LiteMarkdownInline } from '@/Components/LiteMarkdown';

interface ReviewOption { id: number; option_text: string; image_path?: string | null; is_correct: boolean }
interface ReviewQuestion { question_text: string; explanation: string | null; image_path?: string | null; options: ReviewOption[] }
interface ReviewAnswer {
    id: number;
    selected_option_id: number | null;
    is_correct: boolean | null;
    marks_awarded?: string | number;
    question: ReviewQuestion;
}
interface Props {
    answers: ReviewAnswer[];
    /** Changing this (e.g. switching a mock exam's section tab or a staged
     * test's stage tab) jumps back to question 1 of the newly selected
     * group, instead of keeping whatever index the previous group was on. */
    resetKey?: string | number;
    /** True when the caller already shows its own Correct/Wrong/Skipped
     * tally above this component (e.g. Demo Quiz's result header) -- skips
     * the redundant sidebar copy and lets the question card use the full
     * width instead of sharing it with a now-empty column. */
    hideStats?: boolean;
}

function BackIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}
function ForwardIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

const LEGEND = [
    { label: 'Current', className: 'bg-primary' },
    { label: 'Correct', className: 'bg-success' },
    { label: 'Wrong', className: 'bg-danger' },
    { label: 'Skipped', className: 'bg-border' },
];

/**
 * Post-submit answer review, one question at a time -- the client was
 * explicit that a whole-attempt scrolling list (every question's card
 * stacked one after another) is the wrong shape here: the result should
 * read like the live quiz itself did, one MCQ and its solution per screen,
 * Next through to the end. Shared by every result page that used to render
 * AnswerReviewCard in a scrolling list (Quizzes/Result.tsx -- also reused
 * by Custom Quiz's result -- PracticeTests, MockExams, StagedTests, and
 * the public Demo Quiz result).
 *
 * Unlike QuestionRunner (the live one-at-a-time runner this deliberately
 * mirrors the look of), everything here is already decided -- no option
 * picking, no instant-feedback request, correctness is always shown. So
 * this is its own small component rather than QuestionRunner in some
 * "read-only" mode.
 */
export default function AnswerReviewRunner({ answers, resetKey, hideStats = false }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    const total = answers.length;
    const correctCount = answers.filter((a) => a.is_correct === true).length;
    const wrongCount = answers.filter((a) => a.is_correct === false).length;
    const skippedCount = answers.filter((a) => a.selected_option_id === null).length;

    if (total === 0) {
        return (
            <p className="rounded-[1.5rem] border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                No questions to review.
            </p>
        );
    }

    const clampedIndex = Math.min(currentIndex, total - 1);
    const current = answers[clampedIndex];
    const isLast = clampedIndex === total - 1;

    function goTo(index: number) {
        setCurrentIndex(Math.max(0, Math.min(total - 1, index)));
    }

    return (
        <div className={hideStats ? 'mx-auto max-w-3xl' : 'grid gap-6 lg:grid-cols-3'}>
            <div className={hideStats ? 'space-y-6' : 'space-y-6 lg:col-span-2'}>
                <div className="rounded-[1.5rem] border border-border bg-surface p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-bold text-primary">
                            Q {clampedIndex + 1}/{total}
                        </span>
                        <span className="text-xs text-text-muted">{total} Total</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {answers.map((a, i) => {
                            const isCurrent = i === clampedIndex;
                            let classes = 'border-border bg-surface text-text-muted hover:border-primary';
                            if (isCurrent) classes = 'border-primary bg-primary text-on-primary shadow-sm';
                            else if (a.is_correct === true) classes = 'border-success bg-success-bg text-success';
                            else if (a.is_correct === false) classes = 'border-danger bg-danger-bg text-danger';
                            else classes = 'border-border bg-surface-sunken text-text-muted';
                            return (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => goTo(i)}
                                    aria-current={isCurrent}
                                    aria-label={`Go to question ${i + 1}`}
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[0.5rem] border text-xs font-bold transition-colors ${classes}`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-text-muted">
                        {LEGEND.map((l) => (
                            <span key={l.label} className="inline-flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${l.className}`} />
                                {l.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-surface p-5">
                    <p className="font-semibold text-text">
                        <span className="mr-2 text-text-muted">Q{clampedIndex + 1}.</span>
                        <LiteMarkdownInline text={current.question.question_text} />
                    </p>
                    {current.question.image_path && (
                        <img src={`/storage/${current.question.image_path}`} alt="" className="mb-3 mt-3 max-h-64 rounded-[0.75rem] border border-border" />
                    )}

                    <div className="mt-3 space-y-2">
                        {current.question.options.map((opt) => {
                            const isSelected = current.selected_option_id === opt.id;
                            let classes = 'border-border';
                            if (opt.is_correct) classes = 'border-success bg-success-bg';
                            else if (isSelected) classes = 'border-danger bg-danger-bg';
                            return (
                                <div key={opt.id} className={`flex items-center justify-between gap-3 rounded-[1.5rem] border p-3 text-sm ${classes}`}>
                                    <div className="flex items-center gap-3">
                                        {opt.image_path ? (
                                            <img src={`/storage/${opt.image_path}`} alt="" className="max-h-32 rounded-[0.75rem] border border-border" />
                                        ) : (
                                            <span className="text-text">{opt.option_text}</span>
                                        )}
                                    </div>
                                    <span className="flex-shrink-0 text-xs font-bold uppercase">
                                        {opt.is_correct && <span className="text-success">Correct Answer</span>}
                                        {isSelected && !opt.is_correct && <span className="text-danger">Your Answer</span>}
                                        {isSelected && opt.is_correct && <span className="text-success"> (Your Answer)</span>}
                                    </span>
                                </div>
                            );
                        })}
                        {current.selected_option_id === null && (
                            <p className="text-xs font-bold uppercase text-text-muted">You skipped this question.</p>
                        )}
                    </div>

                    {current.question.explanation && (
                        <div className="mt-4 rounded-[1.5rem] border p-3 text-sm border-primary bg-primary-subtle text-text">
                            <span className="font-bold text-primary">Explanation: </span>
                            <LiteMarkdownInline text={current.question.explanation} />
                        </div>
                    )}
                    {current.marks_awarded !== undefined && (
                        <p className="mt-2 text-xs text-text-muted">Marks awarded: {current.marks_awarded}</p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <LiquidButton
                        type="button"
                        tone="light"
                        onClick={() => goTo(clampedIndex - 1)}
                        disabled={clampedIndex === 0}
                        className="gap-1.5 px-5 py-3 text-sm uppercase tracking-wide"
                    >
                        <BackIcon /> Previous
                    </LiquidButton>
                    {!isLast && (
                        <LiquidButton type="button" onClick={() => goTo(clampedIndex + 1)} className="gap-1.5 px-8 py-3 text-sm uppercase tracking-wide">
                            Next <ForwardIcon />
                        </LiquidButton>
                    )}
                </div>
            </div>

            {!hideStats && (
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                    <LiquidButton tone="success" shape="tile" className="p-4">
                        <p className="text-xl font-bold">{correctCount}</p>
                        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Correct</p>
                    </LiquidButton>
                    <LiquidButton tone="danger" shape="tile" className="p-4">
                        <p className="text-xl font-bold">{wrongCount}</p>
                        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Wrong</p>
                    </LiquidButton>
                    <LiquidButton tone="light" shape="tile" className="p-4">
                        <p className="text-xl font-bold">{skippedCount}</p>
                        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Skipped</p>
                    </LiquidButton>
                </div>
            )}
        </div>
    );
}
