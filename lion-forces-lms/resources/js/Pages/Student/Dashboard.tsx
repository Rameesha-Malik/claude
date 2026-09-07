import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import RevealOnScroll from '@/Components/RevealOnScroll';
import StudentLayout from '@/Layouts/StudentLayout';
import { PageProps } from '@/types';

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

function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const ICONS = {
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    flag: 'M5 3v18m0-16h10l-2 4 2 4H5',
    bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
    chart: 'M4 20V10m6.67 10V4M17.33 20v-7',
    arrow: 'M11.3 3.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 11-1.4-1.4L14.6 10H4a1 1 0 010-2h10.6l-3.3-3.3a1 1 0 010-1.4z',
    megaphone: 'M3 11l18-5v12L3 13v-2zm0 0v6a2 2 0 002 2h1a1 1 0 001-1v-5',
};

function greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
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
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
            <Icon d={ICONS.flag} className="h-3.5 w-3.5" />
            {course.target_exam_name ?? 'Target exam'}: {remaining.days}d {remaining.hours}h left
        </div>
    );
}

export default function Dashboard({ enrollments, revisionCount, unreadNotifications, recentBroadcasts }: Props) {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const overallProgress = Math.round(enrollments.reduce((a, c) => a + c.progress, 0) / (enrollments.length || 1));

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-text-secondary">{greeting()},</p>
                    <h1 className="font-display text-3xl uppercase tracking-wide text-text sm:text-4xl">{firstName}</h1>
                </div>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
                >
                    Browse Courses
                    <Icon d={ICONS.arrow} className="h-4 w-4" />
                </Link>
            </div>

            <RevealOnScroll staggerMs={80} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Enrolled Courses" value={enrollments.length} icon={<Icon d={ICONS.book} />} />
                <SummaryCard
                    label="Questions to Revise"
                    value={revisionCount}
                    icon={<Icon d={ICONS.flag} />}
                    tone={revisionCount > 0 ? 'warning' : 'primary'}
                    badge={revisionCount > 0 ? 'Needs attention' : undefined}
                    href="/portal/revision-list"
                />
                <SummaryCard
                    label="Unread Notifications"
                    value={unreadNotifications.length}
                    icon={<Icon d={ICONS.bell} />}
                    tone={unreadNotifications.length > 0 ? 'warning' : 'primary'}
                    badge={unreadNotifications.length > 0 ? 'New' : undefined}
                />
                <SummaryCard
                    label="Overall Progress"
                    value={`${enrollments.length ? overallProgress : 0}%`}
                    icon={<Icon d={ICONS.chart} />}
                    badge={enrollments.length === 0 ? undefined : overallProgress >= 50 ? 'On track' : 'Just started'}
                    badgeTone={overallProgress >= 50 ? 'success' : 'warning'}
                />
            </RevealOnScroll>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="mb-4 text-lg font-bold text-text">My Courses</h2>
                    {enrollments.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
                            You're not enrolled in any courses yet.{' '}
                            <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses &rarr;</Link>
                        </div>
                    ) : (
                        <RevealOnScroll staggerMs={80} className="space-y-4">
                            {enrollments.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/portal/my-courses/${course.slug}`}
                                    className="group block rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all duration-normal hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary transition-transform duration-normal group-hover:scale-110">
                                            <Icon d={ICONS.book} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    {course.category && (
                                                        <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                                                            {course.category}
                                                        </span>
                                                    )}
                                                    <h3 className="mt-2 truncate font-bold text-text group-hover:text-primary">{course.title}</h3>
                                                </div>
                                                <span className="font-display text-2xl text-primary">
                                                    <AnimatedCounter value={`${course.progress}%`} />
                                                </span>
                                            </div>
                                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-sunken">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-slow"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                            <CourseCountdown course={course} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </RevealOnScroll>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-text">Announcements</h2>
                    <div className="space-y-3">
                        {recentBroadcasts.length === 0 && (
                            <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
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

function SummaryCard({
    label,
    value,
    icon,
    tone = 'primary',
    badge,
    badgeTone,
    href,
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
    tone?: 'primary' | 'warning';
    badge?: string;
    badgeTone?: 'success' | 'warning';
    /** Makes the whole card a link -- e.g. the revision count previously had
     *  nowhere to click through to. */
    href?: string;
}) {
    const resolvedBadgeTone = badgeTone ?? (tone === 'warning' ? 'warning' : 'success');
    const Wrapper = href ? Link : 'div';
    return (
        <Wrapper
            {...(href ? { href } : {})}
            className="group rounded-3xl border border-border bg-surface p-5 transition-all duration-normal hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-center justify-between">
                <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-normal group-hover:scale-110 ${
                        tone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-primary-subtle text-primary'
                    }`}
                >
                    {icon}
                </span>
                {badge && (
                    <span
                        className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
                            resolvedBadgeTone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
                        }`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <div className="mt-4 font-display text-3xl text-text">
                <AnimatedCounter value={String(value)} />
            </div>
            <div className="mt-1 text-sm text-text-secondary">{label}</div>
        </Wrapper>
    );
}
