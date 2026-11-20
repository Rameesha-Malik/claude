import { Head, Link, usePage } from '@inertiajs/react';
import LiteMarkdown from '@/Components/LiteMarkdown';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';

export default function Deactivated({ message }: { message: string }) {
    const { site } = usePage<PageProps>().props;
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
            <Head title="Account Deactivated" />
            <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-lg">
                <div className="mx-auto w-fit"><SiteLogo site={site} /></div>
                <h1 className="mt-6 font-display text-2xl text-danger">Account Deactivated</h1>
                <LiteMarkdown text={message} className="mt-2 text-sm text-text-secondary" />
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
