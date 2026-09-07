import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';

interface NavEntry { label: string; href: string; icon: ReactNode }
interface NavGroup { section: string | null; items: NavEntry[] }

function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

// Grouped into labeled sections instead of one flat 36-link list -- client
// feedback: "make it easy to understand... even a non-tech person operate
// easily." No route, page, or feature changed here, only how the same
// links are organized and (in two spots) worded -- see the "My Alerts"
// note below. Dashboard stays pinned above every group (the one place
// everyone starts) and Settings stays pinned below all of them (the one
// place almost nobody needs day-to-day), the same "most-used at the edges"
// shape most admin panels use.
const NAV_GROUPS: NavGroup[] = [
    {
        section: null,
        items: [
            { label: 'Dashboard', href: '/admin', icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        ],
    },
    {
        section: 'Website',
        items: [
            { label: 'Website', href: '/admin/website', icon: <Icon d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12a2.25 2.25 0 002.25-2.25V3m-16.5 0h16.5M3.75 3v0M3 15.75h18" /> },
            { label: 'Pages', href: '/admin/pages', icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
            { label: 'News', href: '/admin/news', icon: <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" /> },
            { label: 'Resources', href: '/admin/resources', icon: <Icon d="M12 4.5v15m7.5-7.5h-15" /> },
        ],
    },
    {
        section: 'Courses',
        items: [
            { label: 'Courses', href: '/admin/courses', icon: <Icon d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.417a12.083 12.083 0 01-6.16-9.839L12 14z" /> },
            { label: 'Categories', href: '/admin/categories', icon: <Icon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 9V4a1 1 0 011-1z" /> },
            { label: 'Instructors', href: '/admin/instructors', icon: <Icon d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /> },
            { label: 'Packages', href: '/admin/packages', icon: <Icon d="M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5" /> },
            { label: 'Bundles', href: '/admin/bundles', icon: <Icon d="M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5" /> },
            { label: 'Content Library', href: '/admin/content-library', icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253" /> },
        ],
    },
    {
        section: 'Guaranteed Notes',
        items: [
            { label: 'Guaranteed Notes', href: '/admin/guaranteed-notes', icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
            { label: 'Note Testimonials', href: '/admin/guaranteed-notes/testimonials', icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
            { label: 'Note FAQs', href: '/admin/guaranteed-notes/faqs', icon: <Icon d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /> },
        ],
    },
    {
        section: 'Assessments',
        items: [
            { label: 'Full Test Config', href: '/admin/full-test-config', icon: <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
            { label: 'Leaderboard', href: '/admin/leaderboard', icon: <Icon d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.42 9.71 2.25 12 2.25c2.291 0 4.545.17 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35" /> },
            { label: 'Demo Quiz', href: '/admin/demo-quiz', icon: <Icon d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /> },
            { label: 'Demo Page Content', href: '/admin/demo-quiz/page-content', icon: <Icon d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /> },
            { label: 'Reported Questions', href: '/admin/reported-questions', icon: <Icon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> },
            { label: 'Favourite Questions', href: '/admin/favourite-questions', icon: <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /> },
            { label: 'Student MCQ Notes', href: '/admin/student-question-notes', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
        ],
    },
    {
        section: 'Students',
        items: [
            { label: 'Students', href: '/admin/students', icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
            { label: 'Enrollments', href: '/admin/enrollments', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
            { label: 'Content Managers', href: '/admin/content-managers', icon: <Icon d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-9.13a4 4 0 110 8 4 4 0 010-8zm6 4a4 4 0 11-8 0" /> },
        ],
    },
    {
        section: 'Community',
        items: [
            { label: 'Reviews', href: '/admin/reviews', icon: <Icon d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /> },
            { label: 'Hall of Fame', href: '/admin/hall-of-fame', icon: <Icon d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.42 9.71 2.25 12 2.25c2.291 0 4.545.17 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35" /> },
            { label: 'Lecture Q&A', href: '/admin/qa?type=lecture', icon: <Icon d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
            { label: 'Course Q&A', href: '/admin/qa?type=course', icon: <Icon d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
            { label: 'Contact Inbox', href: '/admin/contact-inbox', icon: <Icon d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> },
            { label: 'Broadcasts', href: '/admin/notifications', icon: <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /> },
        ],
    },
    {
        section: 'Sales & Insights',
        items: [
            { label: 'Transactions', href: '/admin/payments', icon: <Icon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /> },
            { label: 'Bundle Purchases', href: '/admin/bundle-purchases', icon: <Icon d="M3 7.5h18M3 7.5l1.5-3h15l1.5 3M3 7.5v10.5a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V7.5m-13.5 4.5h6" /> },
            { label: 'Reports', href: '/admin/reports', icon: <Icon d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" /> },
            { label: 'Performance', href: '/admin/performance', icon: <Icon d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" /> },
        ],
    },
    {
        section: 'Activity',
        items: [
            { label: 'Activity', href: '/admin/activity', icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            // Was labeled "Notifications" -- identical to the Broadcasts
            // page's own title above, and to the header bell that already
            // links here on every admin page. Renamed only; same route,
            // same page, same everything else.
            { label: 'My Alerts', href: '/admin/alerts', icon: <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /> },
        ],
    },
    {
        section: null,
        items: [
            { label: 'Settings', href: '/admin/settings', icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
        ],
    },
];

// Routes actually gated by the RestrictContentManagers middleware
// (see routes/web.php) -- kept in sync with that list so a content
// manager never sees a link that would just 403.
const CONTENT_MANAGER_BLOCKED = ['/admin/website', '/admin/students', '/admin/content-managers', '/admin/enrollments', '/admin/payments', '/admin/bundle-purchases', '/admin/settings', '/admin/pages', '/admin/packages'];

// Nav entries tied to a Settings > Features global toggle -- hidden
// entirely (not just disabled) when that feature is off, same as the
// student-facing routes behind them.
const FEATURE_GATED_NAV: Record<string, string> = {
    '/admin/guaranteed-notes': 'notes',
    '/admin/guaranteed-notes/testimonials': 'notes',
    '/admin/guaranteed-notes/faqs': 'notes',
};

export default function AdminLayout({ children, header }: PropsWithChildren<{ header?: string }>) {
    const { site, auth, unreadNotificationsCount, features } = usePage<PageProps>().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    function visibleItems(items: NavEntry[]): NavEntry[] {
        return items
            .filter((item) => !auth.user?.isContentManager || !CONTENT_MANAGER_BLOCKED.includes(item.href))
            .filter((item) => {
                const feature = FEATURE_GATED_NAV[item.href];
                return !feature || features?.[feature] !== false;
            });
    }

    const visibleGroups = NAV_GROUPS.map((g) => ({ ...g, items: visibleItems(g.items) })).filter((g) => g.items.length > 0);

    const sidebar = (
        <div className="flex h-full flex-col bg-secondary text-white">
            <Link href="/admin" className="flex h-16 items-center gap-2.5 px-5 text-base font-bold">
                <SiteLogo site={site} shape="rounded" />
                <span className="truncate">Admin Panel</span>
            </Link>
            <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
                {visibleGroups.map((group, gi) => (
                    <div key={group.section ?? `ungrouped-${gi}`}>
                        {group.section && (
                            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-teal-400">{group.section}</p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = url === item.href || (item.href !== '/admin' && url.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-normal ${
                                            active
                                                ? 'bg-primary text-on-primary shadow-md'
                                                : 'text-teal-200 hover:translate-x-0.5 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span className={`transition-transform duration-normal ${active ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="border-t border-white/10 p-3">
                <Link href="/" className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-teal-200 transition-colors hover:bg-white/10 hover:text-white">
                    <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    View Site
                </Link>
                <button
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    Log out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-canvas">
            <aside className="hidden w-60 flex-shrink-0 lg:block">
                <div className="fixed h-screen w-60">{sidebar}</div>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-60">{sidebar}</div>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
                    <button className="text-text lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <Icon d="M4 6h16M4 12h16M4 18h16" />
                    </button>
                    {header && <h1 className="text-lg font-bold text-text">{header}</h1>}
                    <div className="ml-auto flex items-center gap-3">
                        <Link
                            href="/admin/alerts"
                            className="relative rounded-full p-2 text-text-secondary transition-all duration-fast hover:scale-110 hover:bg-primary-subtle hover:text-primary"
                            aria-label="Notifications"
                        >
                            <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                </span>
                            )}
                        </Link>
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors duration-fast hover:bg-surface-sunken"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
                                    {auth.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden text-sm font-medium text-text-secondary sm:block">{auth.user?.name}</span>
                                <svg className={`h-4 w-4 text-text-muted transition-transform duration-fast ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-xl">
                                        <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-primary-subtle hover:text-primary">
                                            <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => router.post('/logout')}
                                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-bg"
                                        >
                                            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            Log out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
