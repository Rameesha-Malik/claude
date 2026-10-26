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
                <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle text-primary">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
                    </svg>
                </div>
                <h1 className="mt-4 font-display text-2xl text-text">Down for Maintenance</h1>
                <p className="mt-2 text-sm text-text-secondary">
                    We're making some improvements and will be back shortly. Thanks for your patience.
                </p>
            </div>
        </div>
    );
}
