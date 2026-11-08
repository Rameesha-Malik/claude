import { Head, Link } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SemiGauge from '@/Components/SemiGauge';
import StudentLayout from '@/Layouts/StudentLayout';

interface Enrollment {
    id: number; status: string; progress: number | null; completed_lessons: number | null; total_lessons: number | null;
    course: { id: number; title: string; slug: string; category: { name: string } | null };
    package: { name: string } | null;
}

// Client shared a "Protection Score / Investment Score" gauge-card
// reference and asked for that on My Courses. The gauge measures the
// same course-progress % the old linear bar showed, not a fabricated
// score -- "status" below is just a plain-language bucket of that same
// number, same idea as the dashboard's existing warning/success tones.
function progressStatus(progress: number): { label: string; color: string; bg: string } {
    if (progress >= 100) return { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    if (progress >= 50) return { label: 'On Track', color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' };
    if (progress > 0) return { label: 'Just Started', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
    return { label: 'Not Started', color: 'var(--color-text-muted)', bg: 'var(--color-surface-sunken)' };
}

const NON_ACTIVE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    suspended: { label: 'Suspended', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
    expired: { label: 'Expired', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
};

function CourseGaugeCard({ e }: { e: Enrollment }) {
    const isActive = e.status === 'active';
    const progress = e.progress ?? 0;
    const status = isActive
        ? progressStatus(progress)
        : (NON_ACTIVE_STATUS[e.status] ?? { label: e.status, color: 'var(--color-text-muted)', bg: 'var(--color-surface-sunken)' });

    return (
        <div className="group flex flex-col rounded-3xl border border-border bg-surface p-6 text-center shadow-xs transition-all duration-normal hover:-translate-y-1 hover:border-primary hover:shadow-lg">
            <div className="flex items-start justify-between gap-2 text-left">
                {e.course.category ? (
                    <span className="inline-block rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-text-secondary">
                        {e.course.category.name}
                    </span>
                ) : <span />}
                <span
                    className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                    style={{ color: status.color, backgroundColor: status.bg }}
                >
                    {status.label}
                </span>
            </div>

            <h3 className="mt-2 text-left font-bold text-text group-hover:text-primary">{e.course.title}</h3>
            {e.package && <p className="text-left text-sm text-text-secondary">{e.package.name}</p>}

            <div className="mt-4 flex flex-col items-center">
                <SemiGauge percentage={isActive ? progress : 0} color={status.color} />
                <div className="-mt-7">
                    <div className="font-display text-3xl text-text">{isActive ? progress : '—'}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-text-muted">out of 100</div>
                </div>
            </div>

            <p className="mt-3 text-sm text-text-secondary">
                {isActive
                    ? (e.total_lessons ?? 0) > 0
                        ? `${e.completed_lessons} of ${e.total_lessons} lessons completed`
                        : 'No lessons published yet'
                    : e.status === 'pending'
                        ? 'Your access activates once payment is verified.'
                        : e.status === 'suspended'
                            ? 'This enrollment has been suspended. Contact support for help.'
                            : 'This enrollment has expired. Renew to regain access.'}
            </p>

            {isActive ? (
                <Link
                    href={`/portal/my-courses/${e.course.slug}`}
                    className="mt-4 block rounded-full bg-primary py-2.5 text-center text-sm font-bold uppercase tracking-wide text-on-primary transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                >
                    Continue
                </Link>
            ) : (
                <div className="mt-4 rounded-full bg-surface-sunken py-2.5 text-center text-sm text-text-muted">
                    {e.status === 'pending' ? 'Awaiting activation' : 'Unavailable'}
                </div>
            )}
        </div>
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
                    {enrollments.map((e) => <CourseGaugeCard key={e.id} e={e} />)}
                </RevealOnScroll>
            )}
        </StudentLayout>
    );
}
