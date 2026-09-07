import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { PageProps } from '@/types';

interface RunnerOption { id: number; option_text: string }
interface RunnerQuestion { id: number; question_text: string; image_path: string | null; options: RunnerOption[] }
interface QuestionFeedback { correctOptionId: number | null; explanation: string | null }

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
function SkipIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 5l7 7-7 7" />
        </svg>
    );
}
function CheckCircleIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
function FlagIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18M5 4h11l-2 4 2 4H5" />
        </svg>
    );
}
function CircleIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}
function BadgeIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5" />
        </svg>
    );
}
function XCircleIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg className="h-3.5 w-3.5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    );
}
function FlagOutlineIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 4h11l-2 4 2 4H3" />
        </svg>
    );
}
function NoteIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

const LEGEND = [
    { label: 'Current', className: 'bg-primary' },
    { label: 'Answered', className: 'bg-success' },
    { label: 'Skipped', className: 'bg-warning' },
    { label: 'Not visited', className: 'bg-border' },
];

/**
 * One-question-at-a-time MCQ runner shared by every place in the app that
 * puts a candidate through a list of MCQs (demo quiz, practice tests,
 * quizzes, staged-test stages, mock-exam sections) -- previously each of
 * those rendered every question in one long scroll with no way to move
 * between them individually. Client feedback iterated this several times
 * further: (1) call out skipped questions by their actual number,
 * clickable; (2) a reference exam-style layout (question navigator +
 * legend + live stat tiles); (3) show instant right/wrong feedback (with
 * the correct answer + explanation) the moment a candidate picks an
 * option, everywhere, instead of only revealing correctness on the
 * results page after final submit.
 *
 * (3) reverses an earlier, deliberate anti-cheat decision documented in
 * this comment previously -- the client explicitly asked for instant
 * feedback across every test type, so submit-time grading is no longer
 * the only place correctness is revealed. Per-question correctness is
 * fetched lazily from QuestionCheckController (one shared endpoint, not
 * duplicated per test type) the first time a question is answered, then
 * cached locally so re-picking an option on the same question needs no
 * extra request.
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
    const { auth } = usePage<PageProps>().props;
    const isAuthenticated = !!auth?.user;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [visited, setVisited] = useState<Set<number>>(() => new Set(questions.length ? [0] : []));
    const [feedback, setFeedback] = useState<Record<number, QuestionFeedback | 'loading'>>({});
    const [favouritedIds, setFavouritedIds] = useState<Set<number>>(new Set());
    const [favouriteBusy, setFavouriteBusy] = useState(false);
    const [reportOpenFor, setReportOpenFor] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());
    const [noteOpenFor, setNoteOpenFor] = useState<number | null>(null);
    const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
    const [noteSavedIds, setNoteSavedIds] = useState<Set<number>>(new Set());
    const [noteSaving, setNoteSaving] = useState(false);

    function saveNote(questionId: number) {
        if (noteSaving) return;
        setNoteSaving(true);
        axios
            .post(`/questions/${questionId}/note`, { note_text: noteDrafts[questionId] ?? '' })
            .then(() => {
                setNoteSavedIds((prev) => new Set(prev).add(questionId));
                setNoteOpenFor(null);
            })
            .finally(() => setNoteSaving(false));
    }

    function toggleFavourite(questionId: number) {
        if (favouriteBusy) return;
        setFavouriteBusy(true);
        axios
            .post(`/questions/${questionId}/favourite`)
            .then(({ data }) => {
                setFavouritedIds((prev) => {
                    const next = new Set(prev);
                    if (data.favourited) next.add(questionId);
                    else next.delete(questionId);
                    return next;
                });
            })
            .finally(() => setFavouriteBusy(false));
    }

    function submitReport(questionId: number) {
        if (!reportReason.trim()) return;
        axios.post(`/questions/${questionId}/report`, { reason: reportReason.trim() }).then(() => {
            setReportedIds((prev) => new Set(prev).add(questionId));
            setReportOpenFor(null);
            setReportReason('');
        });
    }

    // Instant feedback: fire once per question, the first time it's
    // answered -- the response's correct_option_id is cached and reused
    // for every subsequent option change on that same question, so
    // switching an answer never needs a second request.
    function handleSelect(questionId: number, optionId: number) {
        onSelect(questionId, optionId);
        if (feedback[questionId] !== undefined) return;
        setFeedback((prev) => ({ ...prev, [questionId]: 'loading' }));
        axios
            .post(`/questions/${questionId}/check-answer`, { option_id: optionId })
            .then(({ data }) => {
                setFeedback((prev) => ({
                    ...prev,
                    [questionId]: { correctOptionId: data.correct_option_id ?? null, explanation: data.explanation ?? null },
                }));
            })
            .catch(() => {
                setFeedback((prev) => {
                    const next = { ...prev };
                    delete next[questionId];
                    return next;
                });
            });
    }

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
    const notVisitedCount = total - visited.size;
    const isLast = currentIndex === total - 1;
    const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    // Questions visited but left unanswered -- called out by their actual
    // number (not just a count) so a candidate can jump straight back to
    // any one of them, same as clicking its tile in the navigator below.
    const skippedIndexes = questions.reduce<number[]>((acc, q, i) => {
        const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
        if (!isAnswered && visited.has(i) && i !== currentIndex) acc.push(i);
        return acc;
    }, []);

    // Live correct/wrong counts -- only counts questions where feedback has
    // actually come back (not still 'loading'), compared against whatever
    // option is currently selected.
    let correctCount = 0;
    let wrongCount = 0;
    for (const q of questions) {
        const fb = feedback[q.id];
        const selected = answers[q.id];
        if (!fb || fb === 'loading' || selected === null || selected === undefined) continue;
        if (selected === fb.correctOptionId) correctCount += 1;
        else wrongCount += 1;
    }

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

    const statTiles = [
        { label: 'Correct', value: correctCount, icon: <CheckCircleIcon />, tone: 'border-success bg-success-bg text-success' },
        { label: 'Wrong', value: wrongCount, icon: <XCircleIcon />, tone: 'border-danger bg-danger-bg text-danger' },
        { label: 'Answered', value: answeredCount, icon: <BadgeIcon />, tone: 'border-primary bg-primary-subtle text-primary' },
        { label: 'Skipped', value: skippedIndexes.length, icon: <FlagIcon />, tone: 'border-warning bg-warning-bg text-warning' },
        { label: 'Not Visited', value: notVisitedCount, icon: <CircleIcon />, tone: 'border-border bg-surface-sunken text-text-muted' },
        { label: 'Progress', value: `${progressPercent}%`, icon: <BadgeIcon />, tone: 'border-primary bg-primary-subtle text-primary' },
    ];

    const currentFeedback = feedback[current.id];
    const currentFeedbackReady = currentFeedback && currentFeedback !== 'loading' ? currentFeedback : null;
    const selectedOptionId = answers[current.id];
    const hasAnswered = selectedOptionId !== null && selectedOptionId !== undefined;
    const isCurrentCorrect = currentFeedbackReady && hasAnswered ? selectedOptionId === currentFeedbackReady.correctOptionId : null;

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div className="text-sm text-text-secondary">{headerExtra}</div>
                <div className="flex items-center gap-3">
                    {timerNode}
                    <span className="text-sm font-semibold text-text-secondary">
                        Question <span className="font-bold text-text">{currentIndex + 1}</span> of {total}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-surface p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-bold text-primary">
                                Q {currentIndex + 1}/{total}
                            </span>
                            <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-bold text-text-muted">ID: {current.id}</span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-normal"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Question Navigator</p>
                            <span className="text-xs text-text-muted">{total} Total</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
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

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-text-muted">
                            {LEGEND.map((l) => (
                                <span key={l.label} className="inline-flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${l.className}`} />
                                    {l.label}
                                </span>
                            ))}
                        </div>

                        {skippedIndexes.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
                                <span className="text-text-secondary">Skipped:</span>
                                {skippedIndexes.map((i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => goTo(i)}
                                        className="rounded-full border border-warning bg-warning-bg px-2.5 py-0.5 text-xs font-bold text-warning transition-transform hover:-translate-y-0.5"
                                    >
                                        Q{i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <p className="font-semibold text-text">
                                <span className="mr-2 text-text-muted">Q{currentIndex + 1}.</span>
                                {current.question_text}
                            </p>
                            <div className="flex flex-shrink-0 items-center gap-3 text-xs">
                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={() => toggleFavourite(current.id)}
                                        disabled={favouriteBusy}
                                        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide ${favouritedIds.has(current.id) ? 'text-warning' : 'text-text-muted hover:text-warning'}`}
                                    >
                                        <StarIcon filled={favouritedIds.has(current.id)} /> Favourite
                                    </button>
                                )}
                                {reportedIds.has(current.id) ? (
                                    <span className="font-bold uppercase tracking-wide text-success">Reported</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setReportOpenFor(reportOpenFor === current.id ? null : current.id)}
                                        className="inline-flex items-center gap-1 font-bold uppercase tracking-wide text-text-muted hover:text-danger"
                                    >
                                        <FlagOutlineIcon /> Report
                                    </button>
                                )}
                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={() => setNoteOpenFor(noteOpenFor === current.id ? null : current.id)}
                                        className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide ${noteSavedIds.has(current.id) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                                    >
                                        <NoteIcon /> {noteSavedIds.has(current.id) ? 'Note saved' : 'Note'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {noteOpenFor === current.id && (
                            <div className="mb-3 flex gap-2">
                                <textarea
                                    autoFocus
                                    rows={2}
                                    value={noteDrafts[current.id] ?? ''}
                                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [current.id]: e.target.value }))}
                                    placeholder="Write a personal note on this question (only you and admins can see it)…"
                                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => saveNote(current.id)}
                                    disabled={noteSaving}
                                    className="self-start rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-on-primary disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                        {reportOpenFor === current.id && (
                            <div className="mb-3 flex gap-2">
                                <input
                                    autoFocus
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="What's wrong with this question?"
                                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => submitReport(current.id)}
                                    disabled={!reportReason.trim()}
                                    className="rounded-lg bg-danger px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        {current.image_path && (
                            <img src={`/storage/${current.image_path}`} alt="" className="mb-3 max-h-64 rounded-lg border border-border" />
                        )}
                        <div className="space-y-2">
                            {current.options.map((opt) => {
                                const isSelected = selectedOptionId === opt.id;
                                const isRevealedCorrect = currentFeedbackReady !== null && opt.id === currentFeedbackReady.correctOptionId;
                                let classes = isSelected ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary';
                                if (currentFeedbackReady && hasAnswered) {
                                    if (isRevealedCorrect) classes = 'border-success bg-success-bg';
                                    else if (isSelected) classes = 'border-danger bg-danger-bg';
                                    else classes = 'border-border';
                                }
                                return (
                                    <label
                                        key={opt.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${classes}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${current.id}`}
                                            checked={isSelected}
                                            onChange={() => handleSelect(current.id, opt.id)}
                                        />
                                        <span className="text-text">{opt.option_text}</span>
                                        {currentFeedbackReady && hasAnswered && isRevealedCorrect && (
                                            <span className="ml-auto text-xs font-bold uppercase text-success">Correct answer</span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        {hasAnswered && currentFeedback === 'loading' && (
                            <p className="mt-3 text-xs font-semibold text-text-muted">Checking…</p>
                        )}
                        {currentFeedbackReady && hasAnswered && (
                            <div
                                className={`mt-4 rounded-lg border p-3 text-sm ${
                                    isCurrentCorrect ? 'border-success bg-success-bg text-success' : 'border-danger bg-danger-bg text-danger'
                                }`}
                            >
                                <p className="font-bold uppercase tracking-wide">{isCurrentCorrect ? 'Correct!' : 'Incorrect'}</p>
                                {currentFeedbackReady.explanation && (
                                    <p className="mt-1 font-normal text-text-secondary">{currentFeedbackReady.explanation}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                            {allowBack && (
                                <button
                                    type="button"
                                    onClick={() => goTo(currentIndex - 1)}
                                    disabled={currentIndex === 0}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text"
                                >
                                    <BackIcon /> Previous
                                </button>
                            )}
                            {!isLast && (
                                <button
                                    type="button"
                                    onClick={() => goTo(currentIndex + 1)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-text-secondary transition-colors hover:border-warning hover:text-warning"
                                >
                                    <SkipIcon /> Skip MCQ
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {!isLast && (
                                <button
                                    type="button"
                                    onClick={() => goTo(currentIndex + 1)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                >
                                    Submit &amp; Next <ForwardIcon />
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
                        <div className="text-right">
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

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                    {statTiles.map((t) => (
                        <div key={t.label} className={`rounded-2xl border p-4 ${t.tone}`}>
                            {t.icon}
                            <p className="mt-2 text-xl font-bold">{t.value}</p>
                            <p className="text-xs font-bold uppercase tracking-wide opacity-80">{t.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
