interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer {
    id: number; selected_option_id: number | null;
    is_correct: boolean | null; marks_awarded?: string; question: Question;
}

/**
 * One question's full review: each option highlighted (correct in green,
 * a wrong pick in red), a "you skipped this" note when nothing was
 * selected, and the question's explanation if it has one. Shared by every
 * result page (practice tests, quizzes, staged tests, mock exams, demo
 * quiz) instead of copy-pasted per page.
 */
export default function AnswerReviewCard({ a, index }: { a: Answer; index: number }) {
    return (
        <div className="rounded-3xl border border-border bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
            <p className="mb-3 font-semibold text-text">
                <span className="mr-2 text-text-muted">Q{index + 1}.</span>
                {a.question.question_text}
            </p>
            <div className="space-y-2">
                {a.question.options.map((opt) => {
                    const isSelected = a.selected_option_id === opt.id;
                    const isCorrectOption = opt.is_correct;
                    let classes = 'border-border';
                    if (isCorrectOption) classes = 'border-success bg-success-bg';
                    else if (isSelected && !isCorrectOption) classes = 'border-danger bg-danger-bg';
                    return (
                        <div key={opt.id} className={`flex items-center justify-between rounded-2xl border p-3 text-sm ${classes}`}>
                            <span className="text-text">{opt.option_text}</span>
                            <span className="text-xs font-bold uppercase">
                                {isCorrectOption && <span className="text-success">Correct Answer</span>}
                                {isSelected && !isCorrectOption && <span className="text-danger">Your Answer</span>}
                                {isSelected && isCorrectOption && <span className="text-success"> (Your Answer)</span>}
                            </span>
                        </div>
                    );
                })}
                {a.selected_option_id === null && (
                    <p className="text-xs font-bold uppercase text-text-muted">You skipped this question.</p>
                )}
            </div>
            {a.question.explanation && (
                <div className="mt-3 rounded-2xl bg-primary-subtle p-3 text-sm text-text">
                    <span className="font-bold text-primary">Explanation: </span>
                    {a.question.explanation}
                </div>
            )}
            {a.marks_awarded !== undefined && <p className="mt-2 text-xs text-text-muted">Marks awarded: {a.marks_awarded}</p>}
        </div>
    );
}

/**
 * The "Review Your Mistakes" callout -- every wrong answer, pulled out
 * ahead of the full question list so a student can focus revision there
 * instead of scanning past everything they got right. Also points at the
 * standing Revision List, which collects the same wrong questions across
 * every attempt (not just this one) until answered correctly later.
 */
export function WrongAnswersReview({ answers }: { answers: Answer[] }) {
    const wrongAnswers = answers.filter((a) => a.is_correct === false);
    if (wrongAnswers.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
                <h2 className="font-display text-xl uppercase tracking-wide text-danger">Review Your Mistakes</h2>
                <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-bold text-danger">{wrongAnswers.length}</span>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
                These are also saved to your <a href="/portal/revision-list" className="font-semibold text-primary hover:underline">Revision List</a> for later.
            </p>
            <div className="space-y-5">
                {wrongAnswers.map((a) => (
                    <AnswerReviewCard key={a.id} a={a} index={answers.indexOf(a)} />
                ))}
            </div>
        </div>
    );
}
