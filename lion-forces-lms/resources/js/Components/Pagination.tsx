import { router } from '@inertiajs/react';

// Shared pagination control, replacing the near-identical inline button row
// that used to be copy-pasted into every paginated list in the app (admin
// tables, Courses, News...). Style follows the 21st.dev "Pagination"
// reference the client sent: Previous/Next as plain text+chevron, page
// numbers in bordered boxes, the active one filled -- themed with this
// site's own tokens instead of the reference's monochrome.

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
    className?: string;
}

function ChevronLeftIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

export default function Pagination({ links, className = '' }: Props) {
    // Laravel's default paginator always sends Previous + 1 page + Next even
    // with a single page -- matches the ">3" guard several callers already
    // used, now built in so every caller gets it for free.
    if (links.length <= 3) return null;

    const go = (url: string | null) => url && router.get(url, {}, { preserveState: true });

    return (
        <nav aria-label="Pagination" className={`flex flex-wrap items-center justify-center gap-1 ${className}`}>
            {links.map((link, i) => {
                const isPrev = link.label.includes('Previous') || link.label.includes('laquo');
                const isNext = link.label.includes('Next') || link.label.includes('raquo');
                const isEllipsis = !isPrev && !isNext && link.label.replace(/&hellip;|\.\.\./g, '').trim() === '';

                if (isEllipsis) {
                    return (
                        <span key={i} className="px-2 text-sm text-text-muted">
                            &hellip;
                        </span>
                    );
                }

                if (isPrev || isNext) {
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!link.url}
                            onClick={() => go(link.url)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-primary disabled:opacity-40 disabled:hover:text-text-secondary"
                        >
                            {isPrev && <ChevronLeftIcon />}
                            {isPrev ? 'Previous' : 'Next'}
                            {isNext && <ChevronRightIcon />}
                        </button>
                    );
                }

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!link.url}
                        onClick={() => go(link.url)}
                        aria-current={link.active ? 'page' : undefined}
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                            link.active
                                ? 'border-primary bg-primary-subtle text-primary'
                                : 'border-border text-text-secondary hover:border-primary hover:text-primary'
                        } disabled:opacity-40`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </nav>
    );
}
