import { Head } from '@inertiajs/react';
import GradientMesh from '@/Components/GradientMesh';
import LiteMarkdown from '@/Components/LiteMarkdown';
import RevealOnScroll from '@/Components/RevealOnScroll';
import PublicLayout from '@/Layouts/PublicLayout';

interface Props { page: { title: string; content: string | null; updated_at: string | null } }

function DocumentIcon({ className = 'h-6 w-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1v-16a1 1 0 011-1z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.5V8h4" />
            <path strokeLinecap="round" d="M9 13h6M9 16.5h6M9 9.5h2" />
        </svg>
    );
}

// Client: "terms and condition and policy theme ... too simple" -- this
// generic CMS-page renderer (used for Privacy Policy, Terms, and any other
// Admin > Pages entry) was a flat title band over bare text. Brought up to
// the same hero + card treatment as the rest of the site, plus a real
// "Last updated" line from the page's own updated_at instead of inventing
// one.
export default function StaticPage({ page }: Props) {
    return (
        <PublicLayout>
            <Head title={page.title} />

            <section className="relative overflow-hidden bg-secondary py-16 text-center text-white">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
                />
                <GradientMesh className="opacity-70" />

                <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-teal-200">
                        <DocumentIcon />
                    </span>
                    <h1 className="mt-5 font-display text-4xl uppercase tracking-wide sm:text-5xl">{page.title}</h1>
                    {page.updated_at && (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal-300">
                            Last updated {new Date(page.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <RevealOnScroll className="rounded-[1.5rem] border border-border bg-surface p-8 shadow-sm sm:p-10">
                    {page.content ? (
                        <LiteMarkdown text={page.content} className="text-text-secondary" />
                    ) : (
                        <p className="text-text-secondary">This page has no content yet.</p>
                    )}
                </RevealOnScroll>
            </section>
        </PublicLayout>
    );
}
