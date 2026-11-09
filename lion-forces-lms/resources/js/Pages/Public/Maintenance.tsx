import { Head, usePage } from '@inertiajs/react';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';

export default function Maintenance() {
    const { site } = usePage<PageProps>().props;
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
            <Head title="Down for Maintenance" />
            <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-lg">
                <div className="mx-auto w-fit"><SiteLogo site={site} /></div>
                <h1 className="mt-6 font-display text-2xl text-text">Down for Maintenance</h1>
                <p className="mt-2 text-sm text-text-secondary">
                    The site is offline for a short update. Check back in a few minutes.
                </p>
            </div>
        </div>
    );
}
