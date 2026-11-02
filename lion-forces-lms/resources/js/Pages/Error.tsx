import { Head, Link, usePage } from '@inertiajs/react';
import ShieldMark from '@/Components/ShieldMark';
import { PageProps } from '@/types';

interface Props {
    status: number;
    message?: string | null;
}

const DEFAULT_MESSAGES: Record<number, string> = {
    401: 'You need to sign in to view that.',
    403: "You don't have permission to view that.",
    404: "We couldn't find the page you're looking for.",
    419: 'Your session expired. Please try again.',
    422: "That didn't go through -- check the details and try again.",
    429: 'Too many requests. Please slow down and try again shortly.',
    500: 'Something went wrong on our end. Please try again.',
    503: "We're down for maintenance. Please check back shortly.",
};

// Catches every abort()/HttpException the app throws (see bootstrap/app.php)
// and renders it inside the normal site chrome instead of Laravel's bare
// error view -- a student clicking into a mock exam with no sections yet,
// or retaking a custom quiz with no questions left to pick from, now sees
// this instead of a raw crash page.
export default function ErrorPage({ status, message }: Props) {
    const { site } = usePage<PageProps>().props;
    const body = message || DEFAULT_MESSAGES[status] || 'Something went wrong.';

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6"
            style={{
                backgroundImage: 'radial-gradient(var(--color-border-strong) 1.5px, transparent 1.5px)',
                backgroundSize: '18px 18px',
            }}
        >
            <Head title={`${status} -- ${site.name}`} />

            <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-2xl sm:p-10">
                <Link href="/" className="flex flex-col items-center gap-2">
                    <ShieldMark className="h-10 w-10 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{site.name}</span>
                </Link>

                <p className="mt-6 text-sm font-bold uppercase tracking-wide text-text-muted">Error {status}</p>
                <p className="mt-2 text-lg font-semibold text-text">{body}</p>

                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-text hover:bg-surface-sunken"
                    >
                        Go Back
                    </button>
                    <Link
                        href="/"
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-sm hover:bg-primary-hover"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
