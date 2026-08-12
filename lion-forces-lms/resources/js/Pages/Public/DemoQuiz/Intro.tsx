import { Head, router } from '@inertiajs/react';
import GradientMesh from '@/Components/GradientMesh';
import SectionKicker from '@/Components/SectionKicker';
import WaveRibbon from '@/Components/WaveRibbon';
import PublicLayout from '@/Layouts/PublicLayout';

interface Quiz { id: number; title: string; duration_minutes: number; questions_count: number }

export default function DemoQuizIntro({ quiz }: { quiz: Quiz | null }) {
    return (
        <PublicLayout>
            <Head title="Free Demo Quiz" />

            {/* Dark wavy-ribbon hero, matching the "Start your journey" reference */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 pb-24 pt-24 text-center text-white sm:pt-28">
                <GradientMesh className="opacity-40" />
                <WaveRibbon />
                <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark>
                        <span className="mx-auto">No Sign-Up Required</span>
                    </SectionKicker>
                    <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">{quiz ? quiz.title : 'Free Demo Quiz'}</h1>
                    <p className="mt-4 text-teal-200">
                        Try a sample of the real thing — the same question bank, timer, and scoring our enrolled students use.
                    </p>
                </div>
            </section>

            {/* Card floats up over the hero's bottom edge */}
            <section className="relative -mt-14 px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    {quiz ? (
                        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl">
                            <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
                                <div className="rounded-xl bg-primary-subtle p-4">
                                    <p className="font-display text-3xl text-primary">{quiz.questions_count}</p>
                                    <p className="text-xs uppercase tracking-wide text-text-muted">Questions</p>
                                </div>
                                <div className="rounded-xl bg-primary-subtle p-4">
                                    <p className="font-display text-3xl text-primary">{quiz.duration_minutes}</p>
                                    <p className="text-xs uppercase tracking-wide text-text-muted">Minutes</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.post('/demo-quiz/start')}
                                className="mt-8 rounded-full bg-primary px-10 py-4 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
                            >
                                Start Free Demo Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary shadow-2xl">
                            The demo quiz isn't available right now — check back soon, or explore our full course catalog.
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
