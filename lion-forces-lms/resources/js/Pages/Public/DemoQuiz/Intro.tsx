import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface Quiz { id: number; title: string; duration_minutes: number; questions_count: number }

export default function DemoQuizIntro({ quiz }: { quiz: Quiz | null }) {
    return (
        <PublicLayout>
            <Head title="Free Demo Quiz" />

            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
                {quiz ? (
                    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-gold-700">No Sign-Up Required</p>
                        <h1 className="font-display text-3xl uppercase text-text sm:text-4xl">{quiz.title}</h1>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-surface-sunken p-4">
                                <p className="text-2xl font-bold text-text">{quiz.questions_count}</p>
                                <p className="text-xs uppercase text-text-muted">Questions</p>
                            </div>
                            <div className="rounded-lg bg-surface-sunken p-4">
                                <p className="text-2xl font-bold text-text">{quiz.duration_minutes}</p>
                                <p className="text-xs uppercase text-text-muted">Minutes</p>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-text-secondary">
                            Try a sample of the real thing — the same question bank, timer, and scoring our enrolled students use.
                        </p>
                        <button
                            onClick={() => router.post('/demo-quiz/start')}
                            className="mt-6 rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                        >
                            Start Free Demo Quiz
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                        The demo quiz isn't available right now — check back soon, or explore our full course catalog.
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
