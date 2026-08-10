import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface Attempt { id: number; score: string; total_marks: string }
interface Props { attempt: Attempt; quizTitle: string }

export default function DemoQuizResult({ attempt, quizTitle }: Props) {
    const total = Number(attempt.total_marks);
    const score = Number(attempt.score);
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <PublicLayout>
            <Head title={`Result — ${quizTitle}`} />

            <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border bg-surface p-8">
                    <p className="text-sm font-bold uppercase tracking-wide text-accent">Demo Quiz Complete</p>
                    <p className="mt-2 font-display text-5xl text-text">{percentage}%</p>
                    <p className="mt-1 text-text-secondary">You scored {score} out of {total}</p>

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
            </div>
        </PublicLayout>
    );
}
