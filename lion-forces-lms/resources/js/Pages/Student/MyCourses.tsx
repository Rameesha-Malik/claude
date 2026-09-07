import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';

interface Enrollment {
    id: number; status: string;
    course: { id: number; title: string; slug: string; category: { name: string } | null };
    package: { name: string } | null;
}

function BookIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );
}

export default function MyCourses({ enrollments }: { enrollments: Enrollment[] }) {
    return (
        <StudentLayout header="My Courses">
            <Head title="My Courses" />

            {enrollments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    You're not enrolled in any courses yet.{' '}
                    <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses &rarr;</Link>
                </div>
            ) : (
                <RevealOnScroll staggerMs={70} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((e) => (
                        <div
                            key={e.id}
                            className="group rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary transition-transform duration-normal group-hover:scale-110">
                                    <BookIcon />
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                                        e.status === 'active' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                                    }`}
                                >
                                    {e.status}
                                </span>
                            </div>
                            {e.course.category && (
                                <span className="mt-3 inline-block rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-text-secondary">
                                    {e.course.category.name}
                                </span>
                            )}
                            <h3 className="mt-2 font-bold text-text group-hover:text-primary">{e.course.title}</h3>
                            {e.package && <p className="mt-1 text-sm text-text-secondary">{e.package.name}</p>}
                            {e.status === 'active' ? (
                                <Link
                                    href={`/portal/my-courses/${e.course.slug}`}
                                    className="mt-4 block rounded-full bg-primary py-2.5 text-center text-sm font-bold uppercase tracking-wide text-on-primary transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                                >
                                    Continue
                                </Link>
                            ) : (
                                <div className="mt-4 rounded-full bg-surface-sunken py-2.5 text-center text-sm text-text-muted">
                                    Awaiting activation
                                </div>
                            )}
                        </div>
                    ))}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
