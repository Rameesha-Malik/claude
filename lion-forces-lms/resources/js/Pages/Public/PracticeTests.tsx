import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';

interface TestItem {
    id: number; title: string; question_selection_mode: string; auto_question_count: number | null;
    questions_count: number; course: { id: number; title: string; slug: string; category: { name: string } | null } | null;
}

export default function PracticeTests({ tests, totalQuestions }: { tests: TestItem[]; totalQuestions: number }) {
    return (
        <PublicLayout>
            <Head title="Practice Tests" />

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center text-white">
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
                    <p className="text-center text-text-secondary">No practice tests published yet — check back soon.</p>
                ) : (
                    <RevealOnScroll staggerMs={60} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {tests.map((t) => (
                            <div
                                key={t.id}
                                className="group rounded-3xl border border-border bg-surface p-6 transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                            >
                                {t.course?.category && (
                                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                        {t.course.category.name}
                                    </span>
                                )}
                                <h3 className="mt-3 font-bold text-text group-hover:text-primary">{t.title}</h3>
                                <p className="mt-1 text-sm text-text-secondary">{t.course?.title}</p>
                                <p className="mt-3 text-sm font-semibold text-text-secondary">
                                    {t.question_selection_mode === 'manual' ? `${t.questions_count} questions` : `${t.auto_question_count ?? 10} questions (random)`}
                                </p>
                                {t.course && (
                                    <Link
                                        href={`/courses/${t.course.slug}`}
                                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                                    >
                                        View Course &rarr;
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
