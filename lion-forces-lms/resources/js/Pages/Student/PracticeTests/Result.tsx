import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer {
    id: number; question_id: number; selected_option_id: number | null;
    is_correct: boolean | null; marks_awarded: string; question: Question; selected_option: Option | null;
}
interface Attempt {
    id: number; score: string; total_marks: string; percentage: string; passed: boolean;
    answers: Answer[];
}
interface Props { attempt: Attempt; testTitle: string; isRepeatable: boolean; practiceTestId: number | null }

export default function PracticeTestResult({ attempt, testTitle, isRepeatable, practiceTestId }: Props) {
    const correctCount = attempt.answers.filter((a) => a.is_correct === true).length;
    const wrongCount = attempt.answers.filter((a) => a.is_correct === false).length;
    const skippedCount = attempt.answers.filter((a) => a.is_correct === null).length;

    return (
        <StudentLayout header={`Result — ${testTitle}`}>
            <Head title={`Result — ${testTitle}`} />

            <div className={`mb-6 rounded-2xl border p-6 ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                            {attempt.passed ? 'Passed' : 'Needs Improvement'}
                        </p>
                        <p className="mt-1 font-display text-4xl text-text">{attempt.percentage}%</p>
                        <p className="mt-1 text-sm text-text-secondary">
                            Score: {attempt.score} / {attempt.total_marks}
                        </p>
                    </div>
                    <div className="flex gap-4 text-center text-sm">
                        <div>
                            <p className="text-xl font-bold text-success">{correctCount}</p>
                            <p className="text-text-muted">Correct</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-danger">{wrongCount}</p>
                            <p className="text-text-muted">Wrong</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-text-muted">{skippedCount}</p>
                            <p className="text-text-muted">Skipped</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    {isRepeatable && practiceTestId && (
                        <Link
                            href={`/portal/practice-tests/${practiceTestId}`}
                            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                        >
                            Retake Test
                        </Link>
                    )}
                    <Link href="/portal/my-courses" className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text hover:border-primary">
                        Back to My Courses
                    </Link>
                </div>
            </div>

            <div className="space-y-5">
                {attempt.answers.map((a, i) => (
                    <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                        <p className="mb-3 font-semibold text-text">
                            <span className="mr-2 text-text-muted">Q{i + 1}.</span>
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
                                    <div key={opt.id} className={`flex items-center justify-between rounded-lg border p-3 text-sm ${classes}`}>
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
                            <div className="mt-3 rounded-lg bg-primary-subtle p-3 text-sm text-text">
                                <span className="font-bold text-primary">Explanation: </span>
                                {a.question.explanation}
                            </div>
                        )}
                        <p className="mt-2 text-xs text-text-muted">Marks awarded: {a.marks_awarded}</p>
                    </div>
                ))}
            </div>
        </StudentLayout>
    );
}
