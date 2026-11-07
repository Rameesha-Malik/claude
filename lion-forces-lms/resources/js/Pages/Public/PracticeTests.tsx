import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import WaveRibbon from '@/Components/WaveRibbon';
import PublicLayout from '@/Layouts/PublicLayout';

interface TestItem {
    id: number; title: string; question_selection_mode: string; auto_question_count: number | null;
    questions_count: number; course: { id: number; title: string; slug: string; category: { name: string } | null } | null;
}

export default function PracticeTests({ tests, totalQuestions }: { tests: TestItem[]; totalQuestions: number }) {
    return (
        <PublicLayout>
            <Head title="Practice Tests" />

            <section className="relative overflow-hidden bg-secondary py-20 text-center text-white">
                <GradientMesh className="opacity-40" />
                <WaveRibbon />
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Sharpen Your Skills</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">Practice Tests</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        Every course comes with unlimited-attempt practice tests, drawn from a bank of{' '}
                        <AnimatedCounter value={`${totalQuestions}+`} className="font-bold text-white" /> questions across all subjects.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                {tests.length === 0 ? (
                    <p className="text-center text-text-secondary">No practice tests published yet. Check back soon.</p>
                ) : (
                    <RevealOnScroll staggerMs={60} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {tests.map((t) => (
                            <div
                                key={t.id}
                                className="group flex h-full flex-col rounded-[1.5rem] border border-border bg-surface p-6 transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary transition-transform duration-normal group-hover:scale-110">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </span>
                                    {t.course?.category && (
                                        <span className="mt-1 flex-shrink-0 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                            {t.course.category.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-4 font-bold text-text group-hover:text-primary">{t.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{t.course?.title}</p>

                                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-secondary">
                                    <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h4" />
                                    </svg>
                                    {t.question_selection_mode === 'manual' ? `${t.questions_count} questions` : `${t.auto_question_count ?? 10} questions (random)`}
                                </span>

                                {t.course && (
                                    <Link
                                        href={`/courses/${t.course.slug}`}
                                        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-primary hover:underline"
                                    >
                                        View Course
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5">
                                            <path d="M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </RevealOnScroll>
                )}
            </section>

            <section className="bg-surface-sunken py-20 text-center">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-3xl uppercase tracking-wide text-text sm:text-4xl">Ready to start practicing?</h2>
                    <p className="mt-3 text-text-secondary">Enroll in a course to unlock unlimited attempts, instant scoring, and a personal revision list.</p>
                    <Link
                        href="/courses"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                    >
                        Browse Courses
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
