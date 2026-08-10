import { Head, Link } from '@inertiajs/react';
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
                <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                    You're not enrolled in any courses yet.{' '}
                    <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses &rarr;</Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((e) => (
                        <div key={e.id} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                {e.course.category && (
                                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                        {e.course.category.name}
                                    </span>
                                )}
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                                        e.status === 'active' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                                    }`}
                                >
                                    {e.status}
                                </span>
                            </div>
                            <h3 className="mt-3 font-bold text-text">{e.course.title}</h3>
                            {e.package && <p className="mt-1 text-sm text-text-secondary">{e.package.name}</p>}
                            {e.status === 'active' ? (
                                <Link
                                    href={`/portal/my-courses/${e.course.slug}`}
                                    className="mt-4 block rounded-lg bg-primary py-2.5 text-center text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                                >
                                    Continue
                                </Link>
                            ) : (
                                <div className="mt-4 rounded-lg bg-surface-sunken py-2.5 text-center text-sm text-text-muted">
                                    Awaiting activation
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </StudentLayout>
    );
}
