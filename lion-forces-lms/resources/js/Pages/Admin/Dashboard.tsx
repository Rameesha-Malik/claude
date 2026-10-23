import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BarChart from '@/Components/BarChart';
import DonutChart from '@/Components/DonutChart';
import Icon from '@/Components/Icon';
import RevealOnScroll from '@/Components/RevealOnScroll';
import RingStat from '@/Components/RingStat';
import AdminLayout from '@/Layouts/AdminLayout';

interface Stats {
    total_students: number; active_students: number; new_this_week: number;
    total_courses: number; total_enrollments: number; recent_payments_total: number;
    pending_payments: number; recent_attempts: number;
}
interface QuestionBankStats { total_questions: number; platform_accuracy: number | null; total_answered: number }
interface MissedQuestion { question_text: string; wrong_count: number }
interface Enrollment { id: number; status: string; user: { name: string } | null; course: { title: string } | null; created_at: string }
interface Payment { id: number; amount: string; method: string; status: string; enrollment: { user: { name: string } | null } | null; created_at: string }
interface TrendPoint { label: string; value: number }
interface RevenueSlice { method: string; amount: number; percentage: number }
interface Admin { id: number; name: string }
interface Props {
    stats: Stats;
    questionBank: QuestionBankStats;
    mostMissedQuestions: MissedQuestion[];
    enrollmentTrend: TrendPoint[];
    revenueBreakdown: RevenueSlice[];
    admins: Admin[];
    adminsCount: number;
    recentEnrollments: Enrollment[];
    recentPayments: Payment[];
    popularCourses: { title: string; enrollments: number }[];
}

const ICONS = {
    students: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

const METHOD_LABELS: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash',
    card: 'Card',
    other: 'Other',
};
const METHOD_COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-secondary)', 'var(--color-warning)'];

function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

/**
 * Client reference: two dashboard screenshots (a smart-home app, and a
 * generic "Arion" admin template) with the request to make the admin and
 * student dashboards look less "vibecoded" -- a welcome banner, ring/donut
 * progress instead of plain stat numbers, and a real trend chart. Kept in
 * the site's own teal/gold brand colors rather than the references' purple
 * palette. Deliberately does NOT duplicate the "bank coverage" stat that
 * already lives on Admin > Custom Quiz (see that controller's comment) --
 * the two ring stats here (active students, platform accuracy) are chosen
 * from data this page already had, just re-presented.
 */
export default function Dashboard({
    stats,
    questionBank,
    mostMissedQuestions,
    enrollmentTrend,
    revenueBreakdown,
    admins,
    adminsCount,
    recentEnrollments,
    recentPayments,
    popularCourses,
}: Props) {
    const activePercent = stats.total_students > 0 ? Math.round((stats.active_students / stats.total_students) * 100) : 0;

    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="relative overflow-hidden rounded-3xl p-7 text-on-primary" style={{ background: 'linear-gradient(120deg, var(--color-secondary), var(--color-primary))' }}>
                <div className="relative z-10 max-w-lg">
                    <p className="text-sm font-semibold opacity-80">Welcome back</p>
                    <h1 className="mt-1 text-3xl font-extrabold">Admin Dashboard</h1>
                    <p className="mt-2 text-sm opacity-90">
                        {stats.total_students.toLocaleString()} students, {questionBank.total_questions.toLocaleString()} questions in the bank.
                        {stats.pending_payments > 0 ? ` ${stats.pending_payments} payment${stats.pending_payments === 1 ? '' : 's'} need review.` : ' Everything looks healthy.'}
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-64 opacity-20" style={{ background: 'radial-gradient(circle at 70% 30%, var(--color-accent), transparent 60%)' }} />
            </div>

            <RevealOnScroll staggerMs={60} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <RingTile
                    label="Active Students"
                    percentage={activePercent}
                    valueLabel={`${activePercent}%`}
                    color="var(--color-success)"
                    sub={`${stats.active_students.toLocaleString()} of ${stats.total_students.toLocaleString()}`}
                />
                <RingTile
                    label="Platform Accuracy"
                    percentage={questionBank.platform_accuracy ?? 0}
                    valueLabel={questionBank.platform_accuracy !== null ? `${questionBank.platform_accuracy}%` : 'N/A'}
                    color="var(--color-primary)"
                    sub={questionBank.total_answered > 0 ? `${questionBank.total_answered.toLocaleString()} answers` : 'No answers yet'}
                />
                <Stat label="Total Enrollments" value={stats.total_enrollments} icon={<Icon d={ICONS.students} />} />
                <Stat
                    label="Pending Payments"
                    value={stats.pending_payments}
                    icon={<Icon d={ICONS.clock} />}
                    tone={stats.pending_payments > 0 ? 'warning' : 'primary'}
                />
            </RevealOnScroll>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-border bg-surface p-6 lg:col-span-2">
                    <div className="mb-1 flex items-center justify-between">
                        <h2 className="font-bold text-text">Enrollments, Last 30 Days</h2>
                        <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-bold text-success">
                            {enrollmentTrend.reduce((n, d) => n + d.value, 0)} total
                        </span>
                    </div>
                    <div className="mt-3">
                        <BarChart data={enrollmentTrend} color="var(--color-primary)" height={160} />
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-6">
                    <h2 className="mb-4 font-bold text-text">Revenue by Method, 30d</h2>
                    {revenueBreakdown.length === 0 ? (
                        <p className="text-sm text-text-secondary">No verified payments in the last 30 days.</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-center">
                                <DonutChart
                                    segments={revenueBreakdown.map((r, i) => ({ label: METHOD_LABELS[r.method] ?? r.method, value: r.amount, color: METHOD_COLORS[i % METHOD_COLORS.length] }))}
                                />
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                {revenueBreakdown.map((r, i) => (
                                    <div key={r.method} className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-text-secondary">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: METHOD_COLORS[i % METHOD_COLORS.length] }} />
                                            {METHOD_LABELS[r.method] ?? r.method}
                                        </span>
                                        <span className="font-bold text-text">{r.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-border bg-surface p-5 lg:col-span-1">
                    <h2 className="mb-4 font-bold text-text">Question Bank</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="font-display text-3xl text-text">
                                <AnimatedCounter value={String(questionBank.total_questions)} />
                            </div>
                            <div className="text-sm text-text-secondary">Questions in bank</div>
                        </div>
                        <div>
                            <div className="font-display text-3xl text-text">
                                {Number(stats.recent_payments_total).toLocaleString()}
                            </div>
                            <div className="text-sm text-text-secondary">Revenue, 30d, Rs.</div>
                        </div>
                    </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-border bg-surface p-5 lg:col-span-2">
                    <h2 className="mb-4 font-bold text-text">Most-Missed Questions</h2>
                    {mostMissedQuestions.length === 0 ? (
                        <p className="text-sm text-text-secondary">No wrong answers recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {mostMissedQuestions.map((q, i) => (
                                <div key={i} className="flex items-start justify-between gap-3 text-sm">
                                    <span className="min-w-0 flex-1 truncate text-text">{q.question_text}</span>
                                    <span className="flex-shrink-0 rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-bold text-danger">
                                        Missed {q.wrong_count}&times;
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="min-w-0 rounded-3xl border border-border bg-surface p-5 lg:col-span-2">
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
                                        <td className="py-2.5 text-text">{e.user?.name}</td>
                                        <td className="py-2.5 text-text-secondary">{e.course?.title}</td>
                                        <td className="py-2.5"><StatusDot status={e.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                <div className="min-w-0 rounded-3xl border border-border bg-surface p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-text">Team</h2>
                        <span className="text-xs text-text-secondary">{adminsCount} with access</span>
                    </div>
                    <div className="flex -space-x-3">
                        {admins.map((a, i) => (
                            <div
                                key={a.id}
                                title={a.name}
                                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface text-sm font-bold text-on-primary"
                                style={{ background: METHOD_COLORS[i % METHOD_COLORS.length] }}
                            >
                                {initials(a.name)}
                            </div>
                        ))}
                        {adminsCount > admins.length && (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-surface-sunken text-sm font-bold text-text-secondary">
                                +{adminsCount - admins.length}
                            </div>
                        )}
                    </div>

                    <h2 className="mb-3 mt-6 font-bold text-text">Popular Courses</h2>
                    {popularCourses.length === 0 ? (
                        <p className="text-sm text-text-secondary">No data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {popularCourses.map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="min-w-0 flex-1 truncate text-text">{c.title}</span>
                                    <span className="flex-shrink-0 font-bold text-primary">{c.enrollments}</span>
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
                                    <td className="py-2.5 text-text">{p.enrollment?.user?.name}</td>
                                    <td className="py-2.5 text-text-secondary capitalize">{p.method.replace('_', ' ')}</td>
                                    <td className="py-2.5 font-semibold text-text">Rs. {Number(p.amount).toLocaleString()}</td>
                                    <td className="py-2.5"><StatusDot status={p.status} /></td>
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

/** Quiet dot + plain-case text instead of a bold all-caps translucent pill
 * -- client feedback was that the pill badges read as generic/AI-generated.
 * Only the states that genuinely need attention (pending, rejected) get a
 * colored, semibold treatment; routine states stay muted. */
function StatusDot({ status }: { status: string }) {
    const needsAttention = ['pending', 'rejected', 'suspended'].includes(status);
    const isNegative = ['rejected', 'suspended'].includes(status);
    const dotColor = isNegative ? 'var(--color-danger)' : needsAttention ? 'var(--color-warning)' : 'var(--color-success)';
    const textClass = needsAttention ? (isNegative ? 'font-semibold text-danger' : 'font-semibold text-warning') : 'text-text-secondary';
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm capitalize ${textClass}`}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
            {status}
        </span>
    );
}

function RingTile({ label, percentage, valueLabel, color, sub }: { label: string; percentage: number; valueLabel: string; color: string; sub: string }) {
    return (
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5">
            <RingStat percentage={percentage} color={color} size={52} strokeWidth={6} />
            <div className="min-w-0">
                <div className="font-display text-2xl text-text">{valueLabel}</div>
                <div className="text-sm leading-snug text-text-secondary">{label}</div>
                <div className="truncate text-xs text-text-muted">{sub}</div>
            </div>
        </div>
    );
}

/** Plain inline icon next to the label, no colored circular badge behind
 * it -- client feedback was that the pastel icon-in-a-circle treatment
 * read as a generic AI-dashboard template rather than something a
 * designer actually chose. The number stays the hero element. */
function Stat({ label, value, icon, tone = 'primary' }: { label: string; value: string | number; icon: ReactNode; tone?: 'primary' | 'warning' }) {
    const accentColor = tone === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)';
    return (
        <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 flex-shrink-0" style={{ color: accentColor }}>{icon}</span>
                <span className="text-sm font-semibold text-text-secondary">{label}</span>
            </div>
            <div className="mt-3 font-display text-3xl text-text">
                <AnimatedCounter value={String(value)} />
            </div>
        </div>
    );
}
