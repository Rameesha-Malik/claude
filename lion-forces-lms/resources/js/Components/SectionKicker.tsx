/**
 * Small uppercase accent label above a section heading — the recurring
 * "poster tag" motif that gives every section a consistent, distinct
 * identity instead of a plain H2.
 *
 * Light backgrounds use the oxblood accent (text-oxblood-700); dark
 * sections keep gold/brass (text-gold-400) since that's always had great
 * contrast on a dark teal background. Same "right color for the surface"
 * split as everywhere else oxblood replaced gold — see the accent-oxblood
 * primitive comment in tokens.css for the full reasoning. The underline
 * stays the brighter accent tone (bg-accent resolves to oxblood-500 on
 * light, gold-400 here on dark) since it's decorative, not text.
 */
export default function SectionKicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <div
            className={`mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
                dark ? 'text-gold-400' : 'text-oxblood-700'
            }`}
        >
            <span className={`h-px w-6 ${dark ? 'bg-gold-400' : 'bg-accent'}`} />
            {children}
        </div>
    );
}
