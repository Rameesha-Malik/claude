import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';

interface EnrollmentCard {
    id: number; title: string; slug: string; category: string | null;
    progress: number; target_exam_name: string | null; target_exam_date: string | null;
}
interface Broadcast { title: string; body: string; sent_at: string | null }
interface Props {
    enrollments: EnrollmentCard[];
    revisionCount: number;
    unreadNotifications: { id: string; data: { message?: string }; created_at: string }[];
    recentBroadcasts: Broadcast[];
}

function useCountdown(targetDate: string | null) {
    const [remaining, setRemaining] = useState<{ days: number; hours: number } | null>(null);

    useEffect(() => {
        if (!targetDate) return;
        const update = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) return setRemaining({ days: 0, hours: 0 });
            setRemaining({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
            });
        };
        update();
        const id = setInterval(update, 60000);
        return () => clearInterval(id);
    }, [targetDate]);

    return remaining;
}

function CourseCountdown({ course }: { course: EnrollmentCard }) {
    const remaining = useCountdown(course.target_exam_date);
    if (!remaining) return null;
    return (
        <div className="mt-2 text-xs font-semibold text-gold-700">
            {course.target_exam_name ?? 'Target exam'}: {remaining.days}d {remaining.hours}h remaining
        </div>
    );
}

export default function Dashboard({ enrollments, revisionCount, unreadNotifications, recentBroadcasts }: Props) {
    return (
        <StudentLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Enrolled Courses" value={enrollments.length} />
                <SummaryCard label="Questions to Revise" value={revisionCount} accent={revisionCount > 0} />
                <SummaryCard label="Unread Notifications" value={unreadNotifications.length} />
                <SummaryCard label="Overall Progress" value={`${Math.round(enrollments.reduce((a, c) => a + c.progress, 0) / (enrollments.length || 1))}%`} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="mb-4 text-lg font-bold text-text">My Courses</h2>
                    {enrollments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                            No active enrollments yet.{' '}
                            <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses &rarr;</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enrollments.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/portal/my-courses/${course.slug}`}
                                    className="block rounded-2xl border border-border bg-surface p-5 shadow-xs transition-shadow duration-normal hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {course.category && (
                                                <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                                    {course.category}
                                                </span>
                                            )}
                                            <h3 className="mt-2 font-bold text-text">{course.title}</h3>
                                            <CourseCountdown course={course} />
                                        </div>
                                        <span className="font-display text-2xl text-primary">{course.progress}%</span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken">
                                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${course.progress}%` }} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-text">Announcements</h2>
                    <div className="space-y-3">
                        {recentBroadcasts.length === 0 && (
                            <p className="text-sm text-text-secondary">Nothing new right now.</p>
                        )}
                        {recentBroadcasts.map((b, i) => (
                            <div key={i} className="rounded-xl border border-border bg-surface p-4">
                                <div className="text-sm font-bold text-text">{b.title}</div>
                                <p className="mt-1 text-sm text-text-secondary">{b.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className={`font-display text-3xl ${accent ? 'text-gold-700' : 'text-primary'}`}>{value}</div>
            <div className="mt-1 text-sm text-text-secondary">{label}</div>
        </div>
    );
}
