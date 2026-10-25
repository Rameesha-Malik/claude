import ShieldMark from '@/Components/ShieldMark';
import { PageProps } from '@/types';

/**
 * Renders the admin-uploaded site logo when one exists, falling back to the
 * generic ShieldMark badge otherwise. Shared across the public header, the
 * public footer, the student sidebar, and the admin sidebar.
 *
 * `size="footer"` (the public site footer only) uses the Header/Footer
 * logo slots from Admin -> Settings -> General when set, so a site can use
 * a simpler mark in the footer than in the header; every other spot
 * (header nav, both sidebars) uses the header slot. Both slots fall back
 * to the single generic logo from Admin -> Website -> Settings when unset,
 * which is all most sites ever need.
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
    const path = size === 'footer' ? site.footerLogoPath : site.headerLogoPath;

    if (path) {
        // eslint-disable-next-line jsx-a11y/alt-text
        return <img src={`/storage/${path}`} alt={site.name} className={`${dims} ${rounding} flex-shrink-0 object-contain`} />;
    }
    return (
        <span className={`flex ${dims} ${rounding} flex-shrink-0 items-center justify-center bg-primary text-on-primary shadow-sm`}>
            <ShieldMark className="h-5 w-5" />
        </span>
    );
}
