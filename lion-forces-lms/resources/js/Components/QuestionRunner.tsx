import { ReactNode, useEffect, useState } from 'react';

interface RunnerOption { id: number; option_text: string }
interface RunnerQuestion { id: number; question_text: string; image_path: string | null; options: RunnerOption[] }

interface Props {
    questions: RunnerQuestion[];
    answers: Record<number, number | null>;
    onSelect: (questionId: number, optionId: number) => void;
    onSubmit: () => void;
    submitting: boolean;
    /** Button label for the final action, e.g. "Submit Quiz", "Submit Stage", "Submit Exam". */
    submitLabel: string;
    /** Extra header content specific to the caller (marks per question, pass threshold, stage tabs, etc). */
    headerExtra?: ReactNode;
    /** Rendered countdown badge, if this test/stage/section is timed. */
    timerNode?: ReactNode;
    /** false hides the Previous button entirely -- used where the exam explicitly disallows going back. */
    allowBack?: boolean;
    emptyMessage?: string;
    /** Changing this (e.g. a stage/section id) resets which question is showing back to the first one. */
    resetKey?: string | number;
}

/**
 * One-question-at-a-time MCQ runner shared by every place in the app that
 * puts a candidate through a list of MCQs (demo quiz, practice tests,
 * quizzes, staged-test stages, mock-exam sections) -- previously each of
 * those rendered every question in one long scroll with no way to move
 * between them individually, which is what this replaces (client feedback:
 * show one MCQ at a time with Next/Previous/Skip and live attempted/
 * remaining/timer stats, rather than one long scrolling list).
 */
export default function QuestionRunner({
    questions,
    answers,
    onSelect,
    onSubmit,
    submitting,
    submitLabel,
    headerExtra,
    timerNode,
    allowBack = true,
    emptyMessage = 'No questions are available yet.',
    resetKey,
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visited, setVisited] = useState<Set<number>>(() => new Set(questions.length ? [0] : []));

    // A new stage/section swaps in a fresh `questions` array -- start that
    // list from question 1 again rather than keeping whatever index the
    // previous stage was scrolled to.
    useEffect(() => {
        setCurrentIndex(0);
        setVisited(new Set(questions.length ? [0] : []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    const total = questions.length;
    const answeredCount = questions.reduce((n, q) => n + (answers[q.id] !== null && answers[q.id] !== undefined ? 1 : 0), 0);
    const remainingCount = total - answeredCount;
    const isLast = currentIndex === total - 1;

    function goTo(index: number) {
        const clamped = Math.max(0, Math.min(total - 1, index));
        setCurrentIndex(clamped);
        setVisited((prev) => new Set(prev).add(clamped));
    }

    if (total === 0) {
        return (
            <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                {emptyMessage}
            </p>
        );
    }

    const current = questions[currentIndex];

    return (
        <div>
            <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-text-secondary">
                        <span className="font-bold text-text">{answeredCount}</span> attempted
                        <span className="mx-2">·</span>
                        <span className="font-bold text-text">{remainingCount}</span> remaining
                        <span className="mx-2">·</span>
                        Question <span className="font-bold text-text">{currentIndex + 1}</span> of {total}
                        {headerExtra}
                    </div>
                    {timerNode}
                </div>

                {/* Question palette -- jump to any question directly, colored by status. */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {questions.map((q, i) => {
                        const isCurrent = i === currentIndex;
                        const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
                        const isSkipped = !isAnswered && visited.has(i) && !isCurrent;
                        let classes = 'border-border bg-surface text-text-muted hover:border-primary';
                        if (isCurrent) classes = 'border-primary bg-primary text-on-primary shadow-sm';
                        else if (isAnswered) classes = 'border-success bg-success-bg text-success';
                        else if (isSkipped) classes = 'border-warning bg-warning-bg text-warning';
                        return (
                            <button
                                key={q.id}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-current={isCurrent}
                                aria-label={`Go to question ${i + 1}`}
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${classes}`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="mb-3 font-semibold text-text">
                    <span className="mr-2 text-text-muted">Q{currentIndex + 1}.</span>
                    {current.question_text}
                </p>
                {current.image_path && (
                    <img src={`/storage/${current.image_path}`} alt="" className="mb-3 max-h-64 rounded-lg border border-border" />
                )}
                <div className="space-y-2">
                    {current.options.map((opt) => (
                        <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                                answers[current.id] === opt.id ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary'
                            }`}
                        >
                            <input
                                type="radio"
                                name={`question-${current.id}`}
                                checked={answers[current.id] === opt.id}
                                onChange={() => onSelect(current.id, opt.id)}
                            />
                            <span className="text-text">{opt.option_text}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    {allowBack && (
                        <button
                            type="button"
                            onClick={() => goTo(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="rounded-lg border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text"
                        >
                            Previous
                        </button>
                    )}
                    {!isLast && (
                        <button
                            type="button"
                            onClick={() => goTo(currentIndex + 1)}
                            className="rounded-lg border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-text-secondary transition-colors hover:border-warning hover:text-warning"
                        >
                            Skip
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isLast && (
                        <button
                            type="button"
                            onClick={() => goTo(currentIndex + 1)}
                            className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                        >
                            Next
                        </button>
                    )}
                    {isLast && (
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50"
                        >
                            {submitting ? 'Submitting…' : submitLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Always-available early submit -- a candidate shouldn't have to click
                through to the last question just to hand the test in. */}
            {!isLast && (
                <div className="mt-3 text-right">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="text-sm font-semibold text-text-muted underline-offset-2 hover:text-primary hover:underline disabled:opacity-50"
                    >
                        {submitting ? 'Submitting…' : `${submitLabel} now`}
                    </button>
                </div>
            )}
        </div>
    );
}
