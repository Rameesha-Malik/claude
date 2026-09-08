import ShieldMark from '@/Components/ShieldMark';
import { PageProps } from '@/types';

/**
 * Renders the admin-uploaded site logo (Admin -> Website -> Settings) when
 * one exists, falling back to the generic ShieldMark badge otherwise.
 * Shared across the public header/footer, the student sidebar, and the
 * admin sidebar so an uploaded logo shows up everywhere at once instead of
 * just the marketing pages.
 */
export default function SiteLogo({
    site,
    size = 'nav',
    shape = 'circle',
}: {
    site: PageProps['site'];
    size?: 'nav' | 'footer';
    shape?: 'circle' | 'rounded';
}) {
    const dims = size === 'footer' ? 'h-12 w-12' : 'h-9 w-9';
    const rounding = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

    if (site.logoPath) {
        // eslint-disable-next-line jsx-a11y/alt-text
        return <img src={`/storage/${site.logoPath}`} alt={site.name} className={`${dims} ${rounding} flex-shrink-0 object-contain`} />;
    }
    return (
        <span className={`flex ${dims} ${rounding} flex-shrink-0 items-center justify-center bg-primary text-on-primary shadow-sm`}>
            <ShieldMark className="h-5 w-5" />
        </span>
    );
}
