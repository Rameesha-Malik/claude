import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import RevealOnScroll from '@/Components/RevealOnScroll';
import AdminLayout from '@/Layouts/AdminLayout';

interface Stats {
    total_students: number; active_students: number; new_this_week: number;
    total_courses: number; total_enrollments: number; recent_payments_total: number;
    pending_payments: number; recent_attempts: number;
}
interface Enrollment { id: number; status: string; user: { name: string } | null; course: { title: string } | null; created_at: string }
interface Payment { id: number; amount: string; method: string; status: string; enrollment: { user: { name: string } | null } | null; created_at: string }
interface Props {
    stats: Stats;
    recentEnrollments: Enrollment[];
    recentPayments: Payment[];
    popularCourses: { title: string; enrollments: number }[];
}

function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    students: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    pulse: 'M4 12h3l2 8 4-16 2 8h5',
    sparkle: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
    course: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.417a12.083 12.083 0 01-6.16-9.839L12 14z',
    ticket: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    cash: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M4 20V10m6.67 10V4M17.33 20v-7',
};

export default function Dashboard({ stats, recentEnrollments, recentPayments, popularCourses }: Props) {
    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            <RevealOnScroll staggerMs={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total Students" value={stats.total_students} icon={<Icon d={ICONS.students} />} />
                <Stat label="Active Students" value={stats.active_students} icon={<Icon d={ICONS.pulse} />} tone="success" />
                <Stat label="New This Week" value={stats.new_this_week} icon={<Icon d={ICONS.sparkle} />} />
                <Stat label="Total Courses" value={stats.total_courses} icon={<Icon d={ICONS.course} />} />
                <Stat label="Total Enrollments" value={stats.total_enrollments} icon={<Icon d={ICONS.ticket} />} />
                <Stat
                    label="Revenue (30d, verified)"
                    value={Number(stats.recent_payments_total).toLocaleString()}
                    prefix="Rs. "
                    icon={<Icon d={ICONS.cash} />}
                    tone="success"
                />
                <Stat
                    label="Pending Payments"
                    value={stats.pending_payments}
                    icon={<Icon d={ICONS.clock} />}
                    tone={stats.pending_payments > 0 ? 'warning' : 'primary'}
                    badge={stats.pending_payments > 0 ? 'Needs review' : undefined}
                />
                <Stat label="Test Attempts (7d)" value={stats.recent_attempts} icon={<Icon d={ICONS.chart} />} />
            </RevealOnScroll>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-border bg-surface p-5 lg:col-span-2 min-w-0">
                    <h2 className="mb-4 font-bold text-text">Recent Enrollments</h2>
                    {recentEnrollments.length === 0 ? (
                        <p className="text-sm text-text-secondary">No enrollments yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[420px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-text-muted">
                                <tr><th className="pb-2">Student</th><th className="pb-2">Course</th><th className="pb-2">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentEnrollments.map((e) => (
                                    <tr key={e.id}>
                                        <td className="py-2 text-text">{e.user?.name}</td>
                                        <td className="py-2 text-text-secondary">{e.course?.title}</td>
                                        <td className="py-2">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                                e.status === 'active' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                                            }`}>{e.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-border bg-surface p-5 min-w-0">
                    <h2 className="mb-4 font-bold text-text">Popular Courses</h2>
                    {popularCourses.length === 0 ? (
                        <p className="text-sm text-text-secondary">No data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {popularCourses.map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-text">{c.title}</span>
                                    <span className="font-bold text-primary">{c.enrollments}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
                <h2 className="mb-4 font-bold text-text">Recent Payments</h2>
                {recentPayments.length === 0 ? (
                    <p className="text-sm text-text-secondary">No payments yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-text-muted">
                            <tr><th className="pb-2">Student</th><th className="pb-2">Method</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentPayments.map((p) => (
                                <tr key={p.id}>
                                    <td className="py-2 text-text">{p.enrollment?.user?.name}</td>
                                    <td className="py-2 text-text-secondary capitalize">{p.method.replace('_', ' ')}</td>
                                    <td className="py-2 font-semibold text-text">Rs. {Number(p.amount).toLocaleString()}</td>
                                    <td className="py-2">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                                            p.status === 'verified' ? 'bg-success-bg text-success' : p.status === 'pending' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
                                        }`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function Stat({
    label,
    value,
    icon,
    tone = 'primary',
    badge,
    prefix,
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
    tone?: 'primary' | 'success' | 'warning';
    badge?: string;
    /** Rendered before the animated digits, e.g. "Rs. " -- kept out of
     * AnimatedCounter's value since it only supports a trailing suffix. */
    prefix?: string;
}) {
    const iconTone = tone === 'warning' ? 'bg-warning-bg text-warning' : tone === 'success' ? 'bg-success-bg text-success' : 'bg-primary-subtle text-primary';
    return (
        <div className="group rounded-3xl border border-border bg-surface p-5 transition-all duration-normal hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-normal group-hover:scale-110 ${iconTone}`}>
                    {icon}
                </span>
                {badge && (
                    <span className="rounded-full bg-warning-bg px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-warning">
                        {badge}
                    </span>
                )}
            </div>
            <div className="mt-4 font-display text-3xl text-text">
                {prefix}
                <AnimatedCounter value={String(value)} />
            </div>
            <div className="mt-1 text-sm text-text-secondary">{label}</div>
        </div>
    );
}
