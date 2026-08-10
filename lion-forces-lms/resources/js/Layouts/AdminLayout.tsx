import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { PageProps } from '@/types';

interface NavEntry { label: string; href: string; icon: ReactNode }

function Icon({ d }: { d: string }) {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

const NAV: NavEntry[] = [
    { label: 'Dashboard', href: '/admin', icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { label: 'Website', href: '/admin/website', icon: <Icon d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12a2.25 2.25 0 002.25-2.25V3m-16.5 0h16.5M3.75 3v0M3 15.75h18" /> },
    { label: 'Students', href: '/admin/students', icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
    { label: 'Courses', href: '/admin/courses', icon: <Icon d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.417a12.083 12.083 0 01-6.16-9.839L12 14z" /> },
    { label: 'Content Library', href: '/admin/content-library', icon: <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253M12 6.253C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253" /> },
    { label: 'News', href: '/admin/news', icon: <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" /> },
    { label: 'Resources', href: '/admin/resources', icon: <Icon d="M12 4.5v15m7.5-7.5h-15" /> },
    { label: 'Reports', href: '/admin/reports', icon: <Icon d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
];

export default function AdminLayout({ children, header }: PropsWithChildren<{ header?: string }>) {
    const { site, auth } = usePage<PageProps>().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebar = (
        <div className="flex h-full flex-col bg-secondary text-white">
            <Link href="/admin" className="flex h-16 items-center gap-2 px-5 text-base font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs text-accent-fg">LF</span>
                Admin Panel
            </Link>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
                {NAV.map((item) => {
                    const active = url === item.href || (item.href !== '/admin' && url.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast ${
                                active ? 'bg-accent text-accent-fg' : 'text-teal-200 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-white/10 p-3">
                <Link href="/" className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-teal-200 hover:bg-white/10 hover:text-white">
                    <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    View Site
                </Link>
                <button
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-teal-200 hover:bg-white/10 hover:text-white"
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

            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
                    <button className="text-text lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <Icon d="M4 6h16M4 12h16M4 18h16" />
                    </button>
                    {header && <h1 className="text-lg font-bold text-text">{header}</h1>}
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary">{auth.user?.name}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
                            {auth.user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
