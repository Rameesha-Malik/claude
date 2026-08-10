import GradientMesh from '@/Components/GradientMesh';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';

export default function Guest({ children }: PropsWithChildren) {
    const { site } = usePage<PageProps>().props;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-teal-900 to-teal-950 px-4 py-12">
            <GradientMesh />

            <Link href="/" className="relative z-10 mb-8 flex items-center gap-2 text-lg font-bold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-fg">LF</span>
                {site.name}
            </Link>

            <div className="relative z-10 w-full overflow-hidden rounded-2xl bg-surface px-6 py-8 shadow-2xl sm:max-w-md sm:px-8">
                {children}
            </div>

            <p className="relative z-10 mt-6 text-sm text-teal-300">{site.tagline}</p>
        </div>
    );
}
