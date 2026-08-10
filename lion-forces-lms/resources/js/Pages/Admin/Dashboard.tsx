import { Head } from '@inertiajs/react';
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

export default function Dashboard({ stats, recentEnrollments, recentPayments, popularCourses }: Props) {
    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total Students" value={stats.total_students} />
                <Stat label="Active Students" value={stats.active_students} accent="success" />
                <Stat label="New This Week" value={stats.new_this_week} />
                <Stat label="Total Courses" value={stats.total_courses} />
                <Stat label="Total Enrollments" value={stats.total_enrollments} />
                <Stat label="Revenue (30d, verified)" value={`Rs. ${Number(stats.recent_payments_total).toLocaleString()}`} accent="success" />
                <Stat label="Pending Payments" value={stats.pending_payments} accent={stats.pending_payments > 0 ? 'warning' : undefined} />
                <Stat label="Test Attempts (7d)" value={stats.recent_attempts} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
                    <h2 className="mb-4 font-bold text-text">Recent Enrollments</h2>
                    {recentEnrollments.length === 0 ? (
                        <p className="text-sm text-text-secondary">No enrollments yet.</p>
                    ) : (
                        <table className="w-full text-left text-sm">
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
                    )}
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5">
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

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-4 font-bold text-text">Recent Payments</h2>
                {recentPayments.length === 0 ? (
                    <p className="text-sm text-text-secondary">No payments yet.</p>
                ) : (
                    <table className="w-full text-left text-sm">
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
                )}
            </div>
        </AdminLayout>
    );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: 'success' | 'warning' }) {
    const color = accent === 'success' ? 'text-success' : accent === 'warning' ? 'text-warning' : 'text-primary';
    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-sm text-text-secondary">{label}</div>
        </div>
    );
}
