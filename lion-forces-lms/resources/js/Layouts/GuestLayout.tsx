import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import ShieldMark from '@/Components/ShieldMark';
import { PageProps } from '@/types';
import authParade from '@/assets/hero/auth-parade.jpg';

interface Props {
    title: string;
    description?: string;
}

// Split-panel auth shell: a brand visual on the left (hidden below lg,
// since there's no room for it once the form needs the full width) and
// the actual form on the right.
export default function Guest({ children, title, description }: PropsWithChildren<Props>) {
    const { site } = usePage<PageProps>().props;

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6"
            style={{
                backgroundImage: 'radial-gradient(var(--color-border-strong) 1.5px, transparent 1.5px)',
                backgroundSize: '18px 18px',
            }}
        >
            <div className="relative flex w-full max-w-5xl overflow-hidden rounded-3xl bg-surface shadow-2xl">
                <div className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden bg-gradient-to-br from-secondary via-teal-800 to-teal-950 p-8 lg:flex">
                    <img
                        src={authParade}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* dark brand-color wash so the white nav buttons / rating card stay
                        legible over the photo -- inline rgba, not a Tailwind opacity-modified
                        `secondary` utility, since that token is a plain CSS color value, not
                        an alpha-ready channel triplet (see the Home hero / About panel fixes
                        for the same underlying issue) */}
                    <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(4, 39, 38, 0.55), rgba(4, 39, 38, 0.15) 40%, rgba(4, 39, 38, 0.75))' }}
                    />

                    {/* corner bracket accents -- explicit rgba, since Tailwind's /NN opacity
                        modifier is a silent no-op on custom-property-backed colors like gold-400 */}
                    <span aria-hidden className="absolute left-8 top-20 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: 'rgba(232, 193, 95, 0.5)' }} />
                    <span aria-hidden className="absolute bottom-24 right-8 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: 'rgba(232, 193, 95, 0.5)' }} />

                    <div className="relative flex items-center justify-between">
                        <Link
                            href="/courses"
                            className="rounded-full bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-black/45"
                        >
                            Explore Courses
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-secondary shadow-sm transition-transform hover:-translate-y-0.5"
                        >
                            Join Now
                        </Link>
                    </div>

                    <div className="relative mt-auto rounded-xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-sm">
                        <div className="flex gap-0.5 text-gold-400">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <svg key={s} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3-5.4 3 1.3-6-4.6-4.1 6.1-.6L10 1.5Z" />
                                </svg>
                            ))}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-white">4.8 Rated · 1,500+ Candidates Trained</p>
                    </div>
                </div>

                <div className="w-full px-6 py-10 sm:px-10 lg:px-12">
                    <div className="mx-auto max-w-sm">
                        <Link href="/" className="flex flex-col items-center gap-2 text-center">
                            <ShieldMark className="h-10 w-10 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{site.name}</span>
                        </Link>
                        <h1 className="mt-4 text-center text-2xl font-bold text-text sm:text-3xl">{title}</h1>
                        {description && <p className="mt-1.5 text-center text-sm text-text-secondary">{description}</p>}

                        <div className="mt-8">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
