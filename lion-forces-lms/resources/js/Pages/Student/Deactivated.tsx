import { Head, Link, usePage } from '@inertiajs/react';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';

export default function Deactivated({ message }: { message: string }) {
    const { site } = usePage<PageProps>().props;
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
            <Head title="Account Deactivated" />
            <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-lg">
                <div className="mx-auto w-fit"><SiteLogo site={site} /></div>
                <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <h1 className="mt-4 font-display text-2xl text-text">Account Deactivated</h1>
                <p className="mt-2 text-sm text-text-secondary">{message}</p>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover"
                >
                    Sign Out
                </Link>
            </div>
        </div>
    );
}
