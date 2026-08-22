import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import RevealOnScroll from '@/Components/RevealOnScroll';
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

            <div className={`mb-6 rounded-3xl border p-6 shadow-sm ${attempt.passed ? 'border-success bg-success-bg' : 'border-danger bg-danger-bg'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-wide ${attempt.passed ? 'text-success' : 'text-danger'}`}>
                            {attempt.passed ? 'Passed' : 'Needs Improvement'}
                        </p>
                        <p className="mt-1 font-display text-5xl text-text">
                            <AnimatedCounter value={`${attempt.percentage}%`} />
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                            Score: {attempt.score} / {attempt.total_marks}
                        </p>
                    </div>
                    <div className="flex gap-4 text-center text-sm">
                        <div className="rounded-2xl bg-surface px-4 py-2.5 shadow-xs">
                            <p className="text-xl font-bold text-success">{correctCount}</p>
                            <p className="text-text-muted">Correct</p>
                        </div>
                        <div className="rounded-2xl bg-surface px-4 py-2.5 shadow-xs">
                            <p className="text-xl font-bold text-danger">{wrongCount}</p>
                            <p className="text-text-muted">Wrong</p>
                        </div>
                        <div className="rounded-2xl bg-surface px-4 py-2.5 shadow-xs">
                            <p className="text-xl font-bold text-text-muted">{skippedCount}</p>
                            <p className="text-text-muted">Skipped</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                    {isRepeatable && practiceTestId && (
                        <Link
                            href={`/portal/practice-tests/${practiceTestId}`}
                            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                        >
                            Retake Test
                        </Link>
                    )}
                    <Link
                        href="/portal/my-courses"
                        className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text transition-all duration-fast hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                    >
                        Back to My Courses
                    </Link>
                </div>
            </div>

            <RevealOnScroll staggerMs={40} className="space-y-5">
                {attempt.answers.map((a, i) => (
                    <div key={a.id} className="rounded-3xl border border-border bg-surface p-5 transition-shadow duration-normal hover:shadow-md">
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
                        <p className="mt-2 text-xs text-text-muted">Marks awarded: {a.marks_awarded}</p>
                    </div>
                ))}
            </RevealOnScroll>
        </StudentLayout>
    );
}
