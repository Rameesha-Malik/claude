import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface Props {
    filters: { from?: string; to?: string };
    student: { total: number; new: number; active: number; inactive: number; by_course: { title: string; enrollments: number }[] };
    course: { total_enrollments: number; active_enrollments: number; completion_rate: number; revenue: number };
    test: { total_attempts: number; average_score: number; pass_rate: number; most_missed: { question: string; misses: number }[] };
    payment: { revenue: number; pending: number; successful: number; refunded: number };
}

const TABS = ['Student', 'Course', 'Test', 'Payment'] as const;
type Tab = (typeof TABS)[number];

export default function ReportsIndex({ filters, student, course, test, payment }: Props) {
    const [tab, setTab] = useState<Tab>('Student');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function applyFilter() {
        router.get('/admin/reports', { from: from || undefined, to: to || undefined }, { preserveState: true });
    }

    function exportCsv(type: string) {
        window.location.href = `/admin/reports/export/${type}?from=${from}&to=${to}`;
    }

    return (
        <AdminLayout header="Reports">
            <Head title="Reports" />

            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-text-muted">To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
                </div>
                <button onClick={applyFilter} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary hover:bg-primary-hover">Apply</button>
            </div>

            <div className="mb-6 flex gap-2 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}
                    >
                        {t} Reports
                    </button>
                ))}
            </div>

            {tab === 'Student' && (
                <ReportPanel onExport={() => exportCsv('students')}>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Stat label="Total Students" value={student.total} />
                        <Stat label="New (in range)" value={student.new} />
                        <Stat label="Active" value={student.active} accent="success" />
                        <Stat label="Inactive" value={student.inactive} accent="warning" />
                    </div>
                    <h3 className="mb-3 mt-6 font-bold text-text">Course-wise Enrollment</h3>
                    <div className="space-y-2">
                        {student.by_course.map((c, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-text">{c.title}</span>
                                <span className="font-bold text-primary">{c.enrollments}</span>
                            </div>
                        ))}
                    </div>
                </ReportPanel>
            )}

            {tab === 'Course' && (
                <ReportPanel onExport={() => exportCsv('courses')}>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Stat label="Enrollments (range)" value={course.total_enrollments} />
                        <Stat label="Active Enrollments" value={course.active_enrollments} accent="success" />
                        <Stat label="Completion Rate" value={`${course.completion_rate}%`} />
                        <Stat label="Revenue (range)" value={`Rs. ${Number(course.revenue).toLocaleString()}`} accent="success" />
                    </div>
                </ReportPanel>
            )}

            {tab === 'Test' && (
                <ReportPanel onExport={() => exportCsv('tests')}>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Stat label="Attempts (range)" value={test.total_attempts} />
                        <Stat label="Average Score" value={`${test.average_score}%`} />
                        <Stat label="Pass Rate" value={`${test.pass_rate}%`} accent="success" />
                    </div>
                    <h3 className="mb-3 mt-6 font-bold text-text">Most Missed Questions</h3>
                    {test.most_missed.length === 0 ? (
                        <p className="text-sm text-text-secondary">No test attempts recorded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {test.most_missed.map((q, i) => (
                                <div key={i} className="flex justify-between gap-4 text-sm">
                                    <span className="text-text">{q.question}</span>
                                    <span className="flex-shrink-0 font-bold text-danger">{q.misses} misses</span>
                                </div>
                            ))}
                        </div>
                    )}
                </ReportPanel>
            )}

            {tab === 'Payment' && (
                <ReportPanel onExport={() => exportCsv('payments')}>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <Stat label="Revenue (range)" value={`Rs. ${Number(payment.revenue).toLocaleString()}`} accent="success" />
                        <Stat label="Pending" value={payment.pending} accent="warning" />
                        <Stat label="Successful (range)" value={payment.successful} accent="success" />
                        <Stat label="Refunded" value={payment.refunded} />
                    </div>
                </ReportPanel>
            )}
        </AdminLayout>
    );
}

function ReportPanel({ children, onExport }: { children: React.ReactNode; onExport: () => void }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 flex justify-end">
                <button onClick={onExport} className="rounded-lg border border-border px-4 py-2 text-sm font-bold uppercase text-text hover:border-primary hover:text-primary">
                    Export CSV
                </button>
            </div>
            {children}
        </div>
    );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: 'success' | 'warning' }) {
    const color = accent === 'success' ? 'text-success' : accent === 'warning' ? 'text-warning' : 'text-primary';
    return (
        <div className="rounded-xl border border-border p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-sm text-text-secondary">{label}</div>
        </div>
    );
}
