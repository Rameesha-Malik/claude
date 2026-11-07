import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StatusDot from '@/Components/StatusDot';
import StudentLayout from '@/Layouts/StudentLayout';

interface Enrollment {
    id: number; status: string;
    course: { id: number; title: string; slug: string; category: { name: string } | null };
    package: { name: string } | null;
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
                                {e.course.category ? (
                                    <span className="inline-block rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-text-secondary">
                                        {e.course.category.name}
                                    </span>
                                ) : <span />}
                                <StatusDot label={e.status} tone={e.status === 'active' ? 'positive' : 'warning'} />
                            </div>
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
