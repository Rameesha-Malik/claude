import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BarChart from '@/Components/BarChart';
import DonutChart from '@/Components/DonutChart';
import RevealOnScroll from '@/Components/RevealOnScroll';
import RingStat from '@/Components/RingStat';
import StatusDot from '@/Components/StatusDot';
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
    reportedQuestionsCount: number;
    unansweredQACount: number;
    pendingReviewsCount: number;
}

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
 * Visual system revised after client feedback that the dashboard still
 * read as a generic AI-template ("vibecoded") layout even after the
 * earlier icon-badge/pill-badge cleanup. The specific tells identified:
 * a decorative gradient banner with a blurred accent "blob" (a very
 * recognizable AI-SaaS trope), and eight visually-identical stat cards
 * in a row with no hierarchy. Fixed by: dropping the gradient banner for
 * a plain bold headline with real actions, promoting the single most
 * actionable number (pending payments) into one filled card instead of
 * repeating it in both the quick-access row and the stat row, and
 * flattening the remaining cards (thinner radius, no shadow) so the one
 * filled card actually reads as emphasis rather than decoration.
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
    reportedQuestionsCount,
    unansweredQACount,
    pendingReviewsCount,
}: Props) {
    const activePercent = stats.total_students > 0 ? Math.round((stats.active_students / stats.total_students) * 100) : 0;

    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-text">Admin Dashboard</h1>
                    <p className="mt-1.5 text-sm text-text-secondary">Overview of students, content and revenue.</p>
                </div>
                <div className="flex gap-2.5">
                    <Link
                        href="/admin/courses/create"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4.5 py-2.5 text-sm font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Course
                    </Link>
                    <Link
                        href="/admin/reports"
                        className="inline-flex items-center rounded-full border border-border px-4.5 py-2.5 text-sm font-bold text-text transition-colors duration-fast hover:border-primary"
                    >
                        View Reports
                    </Link>
                </div>
            </div>

            <RevealOnScroll staggerMs={60} className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <HeroStatCard
                    href="/admin/payments"
                    label="Pending Payments"
                    value={stats.pending_payments}
                    subtitle={stats.pending_payments > 0 ? 'Needs review' : 'All verified'}
                />
                <QuickAccessCard
                    href="/admin/reported-questions"
                    title="Reported Questions"
                    count={reportedQuestionsCount}
                    subtitle={reportedQuestionsCount > 0 ? 'pending review' : 'Nothing reported'}
                    isAttention={reportedQuestionsCount > 0}
                />
                <QuickAccessCard
                    href="/admin/qa"
                    title="Student Q&A"
                    count={unansweredQACount}
                    subtitle={unansweredQACount > 0 ? 'unanswered' : 'All answered'}
                    isAttention={unansweredQACount > 0}
                />
                <QuickAccessCard
                    href="/admin/reviews"
                    title="Pending Reviews"
                    count={pendingReviewsCount}
                    subtitle={pendingReviewsCount > 0 ? 'pending' : 'All clear'}
                    isAttention={pendingReviewsCount > 0}
                />
            </RevealOnScroll>

            <RevealOnScroll staggerMs={60} className="mt-3.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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
                <Stat label="Total Enrollments" value={stats.total_enrollments} />
                <Stat label="New This Week" value={stats.new_this_week} />
            </RevealOnScroll>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
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

                <div className="rounded-2xl border border-border bg-surface p-6">
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
                <div className="rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
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

                <div className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
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
                <div className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
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
                                        <td className="py-2.5"><StatusDot label={e.status} tone={e.status === 'active' ? 'positive' : e.status === 'pending' ? 'warning' : e.status === 'suspended' ? 'negative' : 'neutral'} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                <div className="min-w-0 rounded-2xl border border-border bg-surface p-5">
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

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
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
                                    <td className="py-2.5"><StatusDot label={p.status} tone={p.status === 'verified' ? 'positive' : p.status === 'pending' ? 'warning' : p.status === 'rejected' ? 'negative' : 'neutral'} /></td>
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

/** The one card on this page that's filled solid instead of flat -- it
 * carries the dashboard's single most actionable number (pending
 * payments), so it's the only thing here that should pull the eye first.
 * Everything else in this row and the one below it is deliberately flat
 * (border only, no shadow) so this card reads as emphasis, not decoration. */
function HeroStatCard({ href, label, value, subtitle }: { href: string; label: string; value: number; subtitle: string }) {
    return (
        <Link href={href} className="group rounded-2xl bg-secondary p-5 text-text-inverse transition-transform duration-fast hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold opacity-80">{label}</span>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 opacity-70 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.833 14.167L14.167 5.833M5.833 5.833h8.334v8.334" />
                </svg>
            </div>
            <div className="mt-2.5 font-display text-4xl">
                <AnimatedCounter value={String(value)} />
            </div>
            <div className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{subtitle}</div>
        </Link>
    );
}

/** Flat card -- border only, no shadow, no icon -- so the filled
 * HeroStatCard next to it is the thing that actually stands out. Client
 * feedback was that a row of eight visually-identical cards (icon badge +
 * shadow + rounded-3xl, repeated) read as a generic AI-dashboard template;
 * removing the per-card icon and shadow here was part of fixing that. */
function QuickAccessCard({ href, title, count, subtitle, isAttention }: { href: string; title: string; count: number; subtitle: string; isAttention: boolean }) {
    return (
        <Link href={href} className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-fast hover:border-primary">
            <div className="text-sm font-semibold text-text-secondary">{title}</div>
            <div className="mt-2.5 font-display text-3xl text-text">
                <AnimatedCounter value={String(count)} />
            </div>
            <div className={`mt-2 text-xs font-semibold ${isAttention ? 'text-warning' : 'text-text-muted'}`}>{subtitle}</div>
        </Link>
    );
}

/** Quiet dot + plain-case text instead of a bold all-caps translucent pill
 * -- client feedback was that the pill badges read as generic/AI-generated.
 * Only the states that genuinely need attention (pending, rejected) get a
 * colored, semibold treatment; routine states stay muted. */
function RingTile({ label, percentage, valueLabel, color, sub }: { label: string; percentage: number; valueLabel: string; color: string; sub: string }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
            <RingStat percentage={percentage} color={color} size={52} strokeWidth={6} />
            <div className="min-w-0">
                <div className="font-display text-2xl text-text">{valueLabel}</div>
                <div className="text-sm leading-snug text-text-secondary">{label}</div>
                <div className="truncate text-xs text-text-muted">{sub}</div>
            </div>
        </div>
    );
}

/** No icon, no colored badge -- client feedback was that the pastel
 * icon-in-a-circle treatment read as a generic AI-dashboard template
 * rather than something a designer actually chose. The number stays the
 * only thing doing the work. */
function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <span className="text-sm font-semibold text-text-secondary">{label}</span>
            <div className="mt-2.5 font-display text-3xl text-text">
                <AnimatedCounter value={String(value)} />
            </div>
        </div>
    );
}
