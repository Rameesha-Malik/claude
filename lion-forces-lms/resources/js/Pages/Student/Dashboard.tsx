import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import BarChart from '@/Components/BarChart';
import Icon from '@/Components/Icon';
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
    flag: 'M5 3v18m0-16h10l-2 4 2 4H5',
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

// Glossy badge icon per course -- gradient fill + a highlight overlay and
// drop shadow for a dimensional "3D" feel (the client's reference dashboards
// use rendered 3D illustrations; these are hand-built SVG instead, so there's
// no external image asset to source or keep in sync, and they stay in this
// app's own brand colors rather than the references' purple/orange/pink).
// Picked by keyword where the category/title names a specific service --
// Navy gets an anchor, Air Force gets wings, ISSB gets a compass, everything
// else cycles through shield/flag/book so cards still look varied.
const COURSE_GLYPHS = {
    compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 8l2 4-2 4-2-4z',
    anchor: 'M12 3v4m0 0a2 2 0 100 4 2 2 0 000-4zm0 4v11m-7-6a7 7 0 0014 0M5 12H3m18 0h-2',
    wings: 'M3 12l9-7 9 7M3 12l9 7 9-7',
    shield: 'M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z',
    flag: 'M5 3v18m0-16h10l-2 4 2 4H5',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};
const FALLBACK_GLYPH_CYCLE = ['shield', 'flag', 'book'] as const;
const BADGE_GRADIENTS = [
    'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    'linear-gradient(135deg, var(--oxblood-500), var(--oxblood-600))',
];

function courseGlyph(course: EnrollmentCard, index: number): keyof typeof COURSE_GLYPHS {
    const text = `${course.category ?? ''} ${course.title}`.toLowerCase();
    if (text.includes('navy')) return 'anchor';
    if (text.includes('air force')) return 'wings';
    if (text.includes('issb')) return 'compass';
    return FALLBACK_GLYPH_CYCLE[index % FALLBACK_GLYPH_CYCLE.length];
}

function CourseIconBadge({ course, index }: { course: EnrollmentCard; index: number }) {
    return (
        <div
            className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md"
            style={{ background: BADGE_GRADIENTS[index % BADGE_GRADIENTS.length] }}
        >
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.3), transparent 60%)' }} />
            <Icon d={COURSE_GLYPHS[courseGlyph(course, index)]} className="relative h-6 w-6" />
        </div>
    );
}

function CourseCountdown({ course }: { course: EnrollmentCard }) {
    const remaining = useCountdown(course.target_exam_date);
    if (!remaining) return null;
    return (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
            <Icon d={ICONS.flag} className="h-3.5 w-3.5" />
            {course.target_exam_name ?? 'Target exam'}: {remaining.days}d {remaining.hours}h left
        </div>
    );
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
            <div className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
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
                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-surface-sunken px-3.5 py-2.5 text-sm">
                                <span className="min-w-0 flex-1 truncate text-text">{item.question_text}</span>
                                <span className="flex-shrink-0 rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-bold text-warning">
                                    Missed {item.times_wrong}&times;
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl bg-secondary p-6 text-white">
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
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4.5 py-2.5 text-sm font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover"
                    >
                        Browse Courses
                        <Icon d={ICONS.arrow} className="h-3.5 w-3.5" />
                    </Link>
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
                <div className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
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

                <div className="rounded-2xl border border-border bg-surface p-6">
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

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="mb-4 text-lg font-bold text-text">My Courses</h2>
                    {enrollments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                            You're not enrolled in any courses yet.{' '}
                            <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses &rarr;</Link>
                        </div>
                    ) : (
                        /* The decorative icon was dropped earlier this session (one
                           identical icon repeated on every card, no information of its
                           own, just wasted space) and is now reintroduced as a varied
                           per-course glyph via CourseIconBadge -- padding/gaps stay
                           tight, which is what was actually wasteful before. */
                        <RevealOnScroll staggerMs={80} className="space-y-3">
                            {enrollments.map((course, i) => (
                                <Link
                                    key={course.id}
                                    href={`/portal/my-courses/${course.slug}`}
                                    className={`group block rounded-2xl p-4 transition-colors duration-fast ${
                                        course.is_current ? 'bg-secondary text-white' : 'border border-border bg-surface hover:border-primary'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CourseIconBadge course={course} index={i} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    {course.category && (
                                                        <span
                                                            className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                                                                course.is_current ? 'bg-white/15 text-white' : 'bg-primary-subtle text-primary'
                                                            }`}
                                                        >
                                                            {course.category}
                                                        </span>
                                                    )}
                                                    <h3 className={`truncate font-bold ${course.is_current ? 'text-white' : 'text-text group-hover:text-primary'}`}>
                                                        {course.title}
                                                    </h3>
                                                </div>
                                                <span className={`flex-shrink-0 font-display text-xl ${course.is_current ? 'text-white' : 'text-primary'}`}>
                                                    <AnimatedCounter value={`${course.progress}%`} />
                                                </span>
                                            </div>
                                            {course.instructor_name && (
                                                <p className={`truncate text-xs ${course.is_current ? 'text-teal-200' : 'text-text-muted'}`}>
                                                    Prof. {course.instructor_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`mt-3 h-2 overflow-hidden rounded-full ${course.is_current ? 'bg-white/15' : 'bg-surface-sunken'}`}>
                                        <div
                                            className={`h-full rounded-full transition-all duration-slow ${course.is_current ? 'bg-gold-400' : 'bg-primary'}`}
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                                        {course.total_lessons > 0 ? (
                                            <span className={`text-xs ${course.is_current ? 'text-teal-200' : 'text-text-muted'}`}>
                                                Lessons left: {course.total_lessons - course.completed_lessons} &middot; Completed: {course.progress}%
                                            </span>
                                        ) : <span />}
                                        {/* Visual affordance only, not a real link -- the whole card above is
                                            already the click target, and nesting an <a> inside one is invalid
                                            HTML. */}
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                                                course.is_current
                                                    ? 'bg-gold-400 text-secondary group-hover:bg-gold-300'
                                                    : 'bg-primary-subtle text-primary group-hover:bg-primary group-hover:text-on-primary'
                                            }`}
                                        >
                                            Continue
                                        </span>
                                    </div>
                                    <CourseCountdown course={course} />
                                </Link>
                            ))}
                        </RevealOnScroll>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-text">Announcements</h2>
                    <div className="space-y-3">
                        {recentBroadcasts.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
                                Nothing new right now.
                            </div>
                        )}
                        {recentBroadcasts.map((b, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-surface p-4 transition-shadow duration-normal hover:shadow-md">
                                <div className="flex items-start gap-2.5">
                                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
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
        <div className="rounded-2xl bg-secondary p-5 text-text-inverse">
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
        <Wrapper {...(href ? { href } : {})} className="rounded-2xl border border-border bg-surface p-5 transition-colors duration-fast hover:border-primary">
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
