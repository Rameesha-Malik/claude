import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BarChart from '@/Components/BarChart';
import Icon from '@/Components/Icon';
import LiquidButton from '@/Components/LiquidButton';
import RevealOnScroll from '@/Components/RevealOnScroll';
import RingStat from '@/Components/RingStat';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageProps } from '@/types';

interface EnrollmentCard {
    id: number; title: string; slug: string; category: string | null; instructor_name: string | null;
    progress: number; completed_lessons: number; total_lessons: number; is_current: boolean;
    target_exam_name: string | null; target_exam_date: string | null;
}
interface Broadcast { title: string; body: string; sent_at: string | null }
interface Performance {
    questions_attempted: number; correct: number; incorrect: number; accuracy: number | null;
    favourites: number; sessions: number; last_test_percentage: string | null;
}
interface TrendPoint { label: string; value: number }
interface RevisionItem { id: number; question_text: string; times_wrong: number }
interface NextExam { name: string | null; date: string }
interface Props {
    enrollments: EnrollmentCard[];
    performance: Performance;
    activityTrend: TrendPoint[];
    revisionCount: number;
    revisionItems: RevisionItem[];
    nextExam: NextExam | null;
    unreadNotifications: { id: string; data: { message?: string }; created_at: string }[];
    recentBroadcasts: Broadcast[];
}

const ICONS = {
    arrow: 'M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z',
    megaphone: 'M3 11l18-5v12L3 13v-2zm0 0v6a2 2 0 002 2h1a1 1 0 001-1v-5',
    star: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
};

function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

/** Live date/time, same header element the client's reference dashboard
 * shows. No weather icon alongside it like that reference has -- this app
 * has no weather data or API integration, and a fake weather reading would
 * be a worse fabrication than a decorative icon ever was. */
function useClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    return now;
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


/** Real "what needs attention" items -- the actual flagged questions and
 * the nearest upcoming exam, not decorative stat tiles. Inspired by the
 * todo-list / exam-schedule idea from the reference dashboards the client
 * sent, but built from data this app already has rather than inventing a
 * live-class or recommendation feature it doesn't have. */
function NeedsAttention({ revisionItems, nextExam }: { revisionItems: RevisionItem[]; nextExam: NextExam | null }) {
    const remaining = useCountdown(nextExam?.date ?? null);

    return (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-border bg-surface p-6 lg:col-span-2">
                <div className="mb-1 flex items-center justify-between">
                    <h2 className="font-bold text-text">Needs Revision</h2>
                    <Link href="/portal/revision-list" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
                        View All
                    </Link>
                </div>
                {revisionItems.length === 0 ? (
                    <p className="mt-3 text-sm text-text-secondary">Nothing flagged right now. You're all caught up.</p>
                ) : (
                    <div className="mt-3 space-y-2.5">
                        {revisionItems.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-[1rem] bg-surface-sunken px-3.5 py-2.5 text-sm">
                                <span className="min-w-0 flex-1 truncate text-text">{item.question_text}</span>
                                <span className="flex-shrink-0 rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-bold text-warning">
                                    Missed {item.times_wrong}&times;
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-[1.5rem] bg-secondary p-6 text-white">
                <h2 className="font-bold">Next Exam</h2>
                {nextExam && remaining ? (
                    <>
                        <p className="mt-1 text-sm text-teal-200">{nextExam.name ?? 'Target exam'}</p>
                        <div className="mt-3 font-display text-3xl">
                            <AnimatedCounter value={String(remaining.days)} /> <span className="text-lg">days</span>
                        </div>
                        <p className="mt-1 text-xs text-teal-200">{remaining.hours}h left in the day</p>
                    </>
                ) : (
                    <p className="mt-3 text-sm text-teal-200">No exam date set for your courses yet.</p>
                )}
            </div>
        </div>
    );
}

/** Visual system matches Admin/Dashboard.tsx (see that file's comment for
 * the full reasoning): no decorative gradient banner, one filled card to
 * carry the single most actionable number, everything else flat (border
 * only, no shadow) so that one card reads as emphasis instead of being
 * lost in a row of identical tiles. */
export default function Dashboard({ enrollments, performance, activityTrend, revisionCount, revisionItems, nextExam, unreadNotifications, recentBroadcasts }: Props) {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const overallProgress = enrollments.length ? Math.round(enrollments.reduce((a, c) => a + c.progress, 0) / enrollments.length) : 0;
    const now = useClock();

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-text-secondary">{greeting()}</p>
                    <h1 className="text-[28px] font-extrabold tracking-tight text-text">{firstName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-sunken px-4 py-2.5 text-sm font-semibold text-text-secondary sm:flex">
                        <Icon d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" className="h-4 w-4 text-text-muted" />
                        {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        <span className="text-text-muted">&middot;</span>
                        {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <LiquidButton href="/courses" className="px-4.5 py-2.5 text-sm">
                        Browse Courses
                        <Icon d={ICONS.arrow} className="h-3.5 w-3.5" />
                    </LiquidButton>
                </div>
            </div>

            <RevealOnScroll staggerMs={80} className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <HeroStatCard
                    label="Overall Progress"
                    value={overallProgress}
                    suffix="%"
                    subtitle={enrollments.length > 0 ? `${enrollments.length} course${enrollments.length === 1 ? '' : 's'}` : 'Not enrolled yet'}
                />
                <RingTile
                    label="Accuracy"
                    percentage={performance.accuracy ?? 0}
                    valueLabel={performance.accuracy !== null ? `${performance.accuracy}%` : 'N/A'}
                    color="var(--color-success)"
                    sub={performance.questions_attempted > 0 ? `${performance.questions_attempted} attempted` : 'No attempts yet'}
                />
                <SummaryCard
                    label="Questions to Revise"
                    value={revisionCount}
                    tone={revisionCount > 0 ? 'warning' : 'primary'}
                    href="/portal/revision-list"
                />
                <SummaryCard
                    label="Unread Notifications"
                    value={unreadNotifications.length}
                    tone={unreadNotifications.length > 0 ? 'warning' : 'primary'}
                />
            </RevealOnScroll>

            <NeedsAttention revisionItems={revisionItems} nextExam={nextExam} />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-[1.5rem] border border-border bg-surface p-6 lg:col-span-2">
                    <div className="mb-1 flex items-center justify-between">
                        <h2 className="font-bold text-text">Your Activity, Last 14 Days</h2>
                        <span className="rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-bold text-primary">
                            {activityTrend.reduce((n, d) => n + d.value, 0)} questions answered
                        </span>
                    </div>
                    <div className="mt-3">
                        <BarChart data={activityTrend} color="var(--color-primary)" gradientTo="var(--color-primary-subtle)" showPeak height={150} />
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-surface p-6">
                    <h2 className="mb-4 font-bold text-text">Performance</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <PerfStat label="Correct" value={performance.correct} tone="success" />
                        <PerfStat label="Incorrect" value={performance.incorrect} tone="danger" />
                        <PerfStat label="Favourites" value={performance.favourites} icon={<Icon d={ICONS.star} className="h-4 w-4" />} />
                        <PerfStat label="Sessions" value={performance.sessions} />
                    </div>
                    {performance.last_test_percentage !== null && (
                        <p className="mt-4 text-sm text-text-secondary">
                            Last test score: <span className="font-bold text-text">{Number(performance.last_test_percentage)}%</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h2 className="mb-4 text-lg font-bold text-text">Announcements</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {recentBroadcasts.length === 0 && (
                        <div className="rounded-[1.5rem] border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary sm:col-span-2 lg:col-span-3">
                            Nothing new right now.
                        </div>
                    )}
                    {recentBroadcasts.map((b, i) => (
                        <div key={i} className="rounded-[1.5rem] border border-border bg-surface p-4 transition-shadow duration-normal hover:shadow-md">
                            <div className="flex items-start gap-2.5">
                                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[1rem] bg-primary-subtle text-primary">
                                    <Icon d={ICONS.megaphone} className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-text">{b.title}</div>
                                    <p className="mt-1 text-sm text-text-secondary">{b.body}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StudentLayout>
    );
}

/** The one filled card on this page -- carries overall course progress,
 * the single number a student cares most about. Everything else here is
 * flat (border only, no shadow) so this stays the thing that stands out,
 * same reasoning as Admin/Dashboard.tsx's HeroStatCard. */
function HeroStatCard({ label, value, suffix = '', subtitle }: { label: string; value: number; suffix?: string; subtitle: string }) {
    return (
        <div className="rounded-[1.5rem] bg-secondary p-5 text-text-inverse">
            <span className="text-sm font-semibold opacity-80">{label}</span>
            <div className="mt-2.5 font-display text-4xl">
                <AnimatedCounter value={`${value}${suffix}`} />
            </div>
            <div className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{subtitle}</div>
        </div>
    );
}

function RingTile({ label, percentage, valueLabel, color, sub }: { label: string; percentage: number; valueLabel: string; color: string; sub: string }) {
    return (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-border bg-surface p-5">
            <RingStat percentage={percentage} color={color} size={52} strokeWidth={6} />
            <div className="min-w-0">
                <div className="font-display text-2xl text-text">{valueLabel}</div>
                <div className="text-sm leading-snug text-text-secondary">{label}</div>
                <div className="truncate text-xs text-text-muted">{sub}</div>
            </div>
        </div>
    );
}

/** No icon, no colored badge -- see Admin/Dashboard.tsx's Stat for why. */
function SummaryCard({
    label,
    value,
    tone = 'primary',
    href,
}: {
    label: string;
    value: string | number;
    tone?: 'primary' | 'warning';
    /** Makes the whole card a link -- e.g. the revision count previously had
     *  nowhere to click through to. */
    href?: string;
}) {
    const Wrapper = href ? Link : 'div';
    return (
        <Wrapper {...(href ? { href } : {})} className="rounded-[1.5rem] border border-border bg-surface p-5 transition-colors duration-fast hover:border-primary">
            <span className="text-sm font-semibold text-text-secondary">{label}</span>
            <div className={`mt-2.5 font-display text-3xl ${tone === 'warning' && Number(value) > 0 ? 'text-warning' : 'text-text'}`}>
                <AnimatedCounter value={String(value)} />
            </div>
        </Wrapper>
    );
}

function PerfStat({
    label,
    value,
    tone = 'default',
    icon,
}: {
    label: string;
    value: string | number;
    tone?: 'default' | 'success' | 'danger';
    icon?: ReactNode;
}) {
    const valueClass = tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-text';
    return (
        <div>
            <div className={`flex items-center gap-1.5 font-display text-2xl ${valueClass}`}>
                {icon}
                {value}
            </div>
            <div className="mt-0.5 text-xs font-bold uppercase tracking-wide text-text-muted">{label}</div>
        </div>
    );
}
