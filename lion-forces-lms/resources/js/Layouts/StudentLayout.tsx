import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { PageProps } from '@/types';

interface NavEntry {
    label: string;
    href: string;
    icon: ReactNode;
}

function Icon({ d }: { d: string }) {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const NAV: NavEntry[] = [
    { label: 'Dashboard', href: '/portal', icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { label: 'My Courses', href: '/portal/my-courses', icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
    { label: 'Profile', href: '/profile', icon: <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

export default function StudentLayout({ children, header }: PropsWithChildren<{ header?: string }>) {
    const { site, auth, unreadNotificationsCount } = usePage<PageProps>().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebar = (
        <div className="flex h-full flex-col bg-secondary text-white">
            <Link href="/" className="flex h-18 items-center gap-2 px-6 text-lg font-bold">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">LF</span>
                <span className="truncate">{site.name}</span>
            </Link>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAV.map((item) => {
                    const active = url === item.href || (item.href !== '/portal' && url.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-fast ${
                                active ? 'bg-accent text-accent-fg' : 'text-teal-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-4">
                <button
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    Log out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-canvas">
            <aside className="hidden w-64 flex-shrink-0 lg:block">
                <div className="fixed h-screen w-64">{sidebar}</div>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-18 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
                    <button className="text-text lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <Icon d="M4 6h16M4 12h16M4 18h16" />
                    </button>
                    {header && <h1 className="font-display text-2xl uppercase tracking-wide text-text">{header}</h1>}
                    <div className="ml-auto flex items-center gap-3">
                        <Link href="/portal/notifications" className="relative text-text-secondary hover:text-primary" aria-label="Notifications">
                            <Icon d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                </span>
                            )}
                        </Link>
                        <span className="text-sm font-medium text-text-secondary">{auth.user?.name}</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
