import { Head, Link } from '@inertiajs/react';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import WaveRibbon from '@/Components/WaveRibbon';
import PublicLayout from '@/Layouts/PublicLayout';

interface Option { id: number; option_text: string; is_correct: boolean }
interface Question { id: number; question_text: string; explanation: string | null; options: Option[] }
interface Answer { id: number; selected_option_id: number | null; is_correct: boolean | null; question: Question }
interface Attempt {
    id: number; score: string; total_marks: string; correct_count: number; wrong_count: number; skipped_count: number;
    answers: Answer[];
}
interface Props { attempt: Attempt; quizTitle: string }

// Circular score gauge -- uses the feedback ramp (green/gold/red) exactly as
// tokens.css intends it: a real pass/fail-style result, not decoration.
function ScoreRing({ percentage }: { percentage: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
    const tone = percentage >= 70 ? 'var(--green-600)' : percentage >= 40 ? 'var(--gold-500)' : 'var(--red-600)';

    return (
        <div className="relative mx-auto h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-surface-sunken)" strokeWidth="10" />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={tone}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-3xl text-text">{percentage}%</span>
            </div>
        </div>
    );
}

export default function DemoQuizResult({ attempt, quizTitle }: Props) {
    const total = Number(attempt.total_marks);
    const score = Number(attempt.score);
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <PublicLayout>
            <Head title={`Result — ${quizTitle}`} />

            <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 pb-24 pt-24 text-center text-white sm:pt-28">
                <GradientMesh className="opacity-40" />
                <WaveRibbon />
                <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark>
                        <span className="mx-auto">Demo Quiz Complete</span>
                    </SectionKicker>
                    <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">{quizTitle}</h1>
                </div>
            </section>

            <section className="relative -mt-14 px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl">
                        <ScoreRing percentage={percentage} />
                        <p className="mt-3 text-text-secondary">You scored {score} out of {total}</p>

                        <div className="mt-6 flex justify-center gap-4 text-center text-sm">
                            <div className="rounded-2xl bg-surface-sunken px-4 py-2.5">
                                <p className="text-xl font-bold text-success">{attempt.correct_count}</p>
                                <p className="text-text-muted">Correct</p>
                            </div>
                            <div className="rounded-2xl bg-surface-sunken px-4 py-2.5">
                                <p className="text-xl font-bold text-danger">{attempt.wrong_count}</p>
                                <p className="text-text-muted">Wrong</p>
                            </div>
                            <div className="rounded-2xl bg-surface-sunken px-4 py-2.5">
                                <p className="text-xl font-bold text-text-muted">{attempt.skipped_count}</p>
                                <p className="text-text-muted">Skipped</p>
                            </div>
                        </div>

                        <div className="mt-8 rounded-xl bg-primary-subtle p-6">
                            <h2 className="font-display text-xl uppercase text-text">Like what you saw?</h2>
                            <p className="mt-2 text-sm text-text-secondary">
                                This was just a taste. Enroll to unlock full practice tests, sectioned mock exams, staged tests,
                                guaranteed notes, and personal progress tracking for your target exam.
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                <Link href="/courses" className="rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover">
                                    Browse Courses
                                </Link>
                                <Link href="/register" className="rounded-lg border border-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary-subtle">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>

                        <Link href="/demo-quiz" className="mt-6 inline-block text-sm font-semibold text-text-secondary hover:text-primary">
                            Try another demo quiz
                        </Link>
                    </div>

                    {attempt.answers.length > 0 && (
                        <div className="mt-10">
                            <h2 className="mb-4 text-center font-display text-2xl uppercase tracking-wide text-text">Review Your Answers</h2>
                            <RevealOnScroll staggerMs={40} className="space-y-5">
                                {attempt.answers.map((a, i) => (
                                    <div key={a.id} className="rounded-2xl border border-border bg-surface p-5 text-left">
                                        <p className="mb-3 font-semibold text-text">
                                            <span className="mr-2 text-text-muted">Q{i + 1}.</span>
                                            {a.question.question_text}
                                        </p>
                                        <div className="space-y-2">
                                            {a.question.options.map((opt) => {
                                                const isSelected = a.selected_option_id === opt.id;
                                                let classes = 'border-border';
                                                if (opt.is_correct) classes = 'border-success bg-success-bg';
                                                else if (isSelected && !opt.is_correct) classes = 'border-danger bg-danger-bg';
                                                return (
                                                    <div key={opt.id} className={`flex items-center justify-between rounded-lg border p-3 text-sm ${classes}`}>
                                                        <span className="text-text">{opt.option_text}</span>
                                                        <span className="text-xs font-bold uppercase">
                                                            {opt.is_correct && <span className="text-success">Correct Answer</span>}
                                                            {isSelected && !opt.is_correct && <span className="text-danger">Your Answer</span>}
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
                                    </div>
                                ))}
                            </RevealOnScroll>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
