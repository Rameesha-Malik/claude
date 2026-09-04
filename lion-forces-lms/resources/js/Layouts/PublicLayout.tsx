import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';

function WhatsAppIcon({ className = 'h-7 w-7' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.83 14.24c-.25.7-1.45 1.34-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.93-4.3-5.08-4.5-.15-.2-1.22-1.62-1.22-3.1 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.86 2.07.93 2.22.08.15.13.32.03.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.76.83 2.06.98.3.15.5.22.57.35.08.13.08.72-.17 1.42Z" />
        </svg>
    );
}

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
        </svg>
    );
}

function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function YoutubeIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M21.58 7.2a2.75 2.75 0 00-1.94-1.95C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.64.5A2.75 2.75 0 002.42 7.2 28.6 28.6 0 002 12a28.6 28.6 0 00.42 4.8 2.75 2.75 0 001.94 1.95c1.74.5 7.64.5 7.64.5s5.9 0 7.64-.5a2.75 2.75 0 001.94-1.95A28.6 28.6 0 0022 12a28.6 28.6 0 00-.42-4.8ZM10 15.02V8.98L15.27 12 10 15.02Z" />
        </svg>
    );
}

function SocialLinks({ social, className = '' }: { social: { facebook: string | null; instagram: string | null; youtube: string | null }; className?: string }) {
    const links = [
        { url: social.facebook, icon: FacebookIcon, label: 'Facebook' },
        { url: social.instagram, icon: InstagramIcon, label: 'Instagram' },
        { url: social.youtube, icon: YoutubeIcon, label: 'YouTube' },
    ].filter((l) => l.url);

    if (links.length === 0) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {links.map(({ url, icon: Icon, label }) => (
                <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-teal-100 transition-colors hover:bg-white/20 hover:text-white"
                >
                    <Icon />
                </a>
            ))}
        </div>
    );
}

export default function PublicLayout({ children }: PropsWithChildren) {
    const { site, nav, announcement, auth } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-canvas text-text">
            {announcement && (
                <div className="bg-secondary px-4 py-2.5 text-center text-sm text-secondary-fg">
                    <span>{announcement.message}</span>
                    {announcement.link_url && (
                        <Link href={announcement.link_url} className="ml-2 font-semibold underline underline-offset-2">
                            Learn more
                        </Link>
                    )}
                </div>
            )}

            <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
                <div
                    className="mx-auto flex h-16 max-w-4xl items-center justify-between rounded-full border border-border px-3 shadow-xl backdrop-blur-glass sm:px-4"
                    style={{ backgroundColor: 'var(--glass-bg)' }}
                >
                    <Link href="/" className="flex min-w-0 items-center gap-2.5 text-base font-bold text-secondary">
                        <SiteLogo site={site} size="nav" />
                        <span className="truncate">{site.name}</span>
                    </Link>

                    <nav className="hidden items-center gap-1 rounded-full bg-black/[0.03] p-1 md:flex">
                        {nav.header.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                className="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-fast hover:bg-surface hover:text-primary"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-primary">
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all duration-fast hover:bg-primary-hover hover:shadow-md"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="p-2 text-text md:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileOpen && (
                    <nav className="mx-auto mt-2 flex max-w-4xl flex-col gap-1 rounded-3xl border border-border bg-surface p-3 shadow-xl md:hidden">
                        {nav.header.map((item) => (
                            <Link key={item.id} href={item.url} className="rounded-xl px-3 py-2 text-sm font-medium text-text hover:bg-surface-sunken">
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-text hover:bg-surface-sunken">
                            Sign in
                        </Link>
                        <Link href="/register" className="mt-1 rounded-full bg-primary px-3 py-2.5 text-center text-sm font-semibold text-on-primary">
                            Get Started
                        </Link>
                    </nav>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border bg-secondary text-text-inverse">
                <div className="mx-auto max-w-container px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-4">
                        <div>
                            <div className="mb-3 flex items-center gap-2.5 text-lg font-bold">
                                <SiteLogo site={site} size="footer" />
                                {site.name}
                            </div>
                            <p className="text-sm text-teal-200">{site.tagline}</p>
                            <SocialLinks social={site.social} className="mt-4" />
                        </div>

                        {nav.footer.map((group) => (
                            <div key={group.id}>
                                <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">
                                    {group.children && group.children.length > 0 ? group.label : 'Quick Links'}
                                </div>
                                <ul className="space-y-2">
                                    {(group.children && group.children.length > 0 ? group.children : [group]).map((item) => (
                                        <li key={item.id}>
                                            <Link href={item.url} className="text-sm text-teal-100 transition-colors hover:text-white">
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div>
                            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">Contact</div>
                            <ul className="space-y-2 text-sm text-teal-100">
                                {site.supportEmail && (
                                    <li>
                                        {/* whitespace-nowrap + a smaller size, not break-all -- the
                                            email is one unbreakable "word", and break-all was
                                            splitting it mid-word (e.g. "...gmail.co" / "m") rather
                                            than keeping it on one line. */}
                                        <a href={`mailto:${site.supportEmail}`} className="block whitespace-nowrap text-xs hover:text-white sm:text-sm">
                                            {site.supportEmail}
                                        </a>
                                    </li>
                                )}
                                {site.officeLocation && <li>{site.officeLocation}</li>}
                                {site.officeHours && <li>{site.officeHours}</li>}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-teal-800 pt-6 text-center text-xs text-teal-300">
                        {site.copyrightText}
                    </div>
                </div>
            </footer>

            {site.whatsappEnabled && site.whatsappNumber && (
                <a
                    href={`https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-fast hover:scale-110"
                >
                    <WhatsAppIcon />
                </a>
            )}
        </div>
    );
}
