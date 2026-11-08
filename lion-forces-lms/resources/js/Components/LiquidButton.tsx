import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    href: string;
    children: ReactNode;
    /** Padding/text-size/margin are each caller's own call (sizes differ
     *  across the 4 places this is used) -- deliberately NOT given a
     *  default here, since a same-specificity utility clash (e.g. this
     *  component's own px-5 vs. a caller's px-4) is decided by CSS source
     *  order, not by className string order, so it can't be reliably
     *  overridden by appending to this prop. */
    className: string;
}

// Dark, glossy pill CTA -- a deep-teal gradient fill, a thin diagonal
// rim-light border (teal-700/gold, the site's own existing dark-plus-gold
// combo per tokens.css, not an arbitrary metal/chrome palette), and an
// inner top highlight for the glossy "liquid metal" look the client asked
// for. Used for the dashboard's "go explore courses" CTAs specifically,
// not every button site-wide -- plain text links and inline form actions
// (Save, Edit, tab switches) keep their existing styles.
export default function LiquidButton({ href, children, className }: Props) {
    return (
        <Link
            href={href}
            className={`group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full font-bold text-white transition-transform duration-normal ease-spring hover:-translate-y-0.5 ${className}`}
            style={{
                background: 'linear-gradient(160deg, var(--teal-700) 0%, var(--teal-950) 55%, var(--teal-900) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), inset 0 -1px 3px rgba(0,0,0,.45), 0 8px 20px rgba(3,41,39,.35)',
            }}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full opacity-80 transition-opacity duration-normal group-hover:opacity-100"
                style={{
                    padding: 1,
                    background: 'linear-gradient(135deg, rgba(255,255,255,.6), rgba(255,255,255,0) 30%, rgba(255,255,255,0) 65%, var(--gold-400))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />
            <span className="relative z-10 flex items-center gap-1.5">{children}</span>
        </Link>
    );
}
