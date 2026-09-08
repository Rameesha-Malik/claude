import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import PublicLayout from '@/Layouts/PublicLayout';

interface NoteItem {
    id: number; title: string; content: string | null; price: string | null; is_paid: boolean; unlocked: boolean;
    subject: { name: string } | null; courses: { id: number; title: string; slug: string }[];
}

export default function Notes({ notes }: { notes: NoteItem[] }) {
    return (
        <PublicLayout>
            <Head title="Notes" />

            <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center text-white">
                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <SectionKicker dark><span className="mx-auto">Study Material</span></SectionKicker>
                    <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">Notes</h1>
                    <p className="mx-auto mt-4 max-w-xl text-teal-200">
                        Subject-wise notes bundled into every course — including Guaranteed Notes on select packages.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                {notes.length === 0 ? (
                    <p className="text-center text-text-secondary">No notes published yet — check back soon.</p>
                ) : (
                    <RevealOnScroll staggerMs={60} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {notes.map((n) => (
                            <div
                                key={n.id}
                                className="group rounded-3xl border border-border bg-surface p-6 transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {n.subject && (
                                        <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                            {n.subject.name}
                                        </span>
                                    )}
                                    {n.is_paid && (
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${n.unlocked ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                                            {n.unlocked ? 'Unlocked' : `Rs. ${Number(n.price).toLocaleString()}`}
                                        </span>
                                    )}
                                </div>
                                <Link href={`/notes/${n.id}`} className="mt-3 block font-bold text-text group-hover:text-primary">{n.title}</Link>
                                {n.content && <p className="mt-1 line-clamp-3 text-sm text-text-secondary">{n.content}</p>}
                                {n.is_paid && !n.unlocked && (
                                    <Link
                                        href={`/portal/notes/${n.id}/purchase`}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                    >
                                        Buy Now — Rs. {Number(n.price).toLocaleString()}
                                    </Link>
                                )}
                                {n.courses.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {n.courses.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/courses/${c.slug}`}
                                                className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-primary-subtle hover:text-primary"
                                            >
                                                {c.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </RevealOnScroll>
                )}
            </section>

            <section className="bg-surface-sunken py-20 text-center">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-3xl uppercase tracking-wide text-text sm:text-4xl">Want full access?</h2>
                    <p className="mt-3 text-text-secondary">Enroll in a course to unlock the complete notes bank plus lectures and practice tests.</p>
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
