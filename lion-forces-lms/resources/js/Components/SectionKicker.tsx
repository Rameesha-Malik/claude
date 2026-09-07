/**
 * Small uppercase gold label above a section heading — the recurring
 * "poster tag" motif that gives every section a consistent, distinct
 * identity instead of a plain H2.
 *
 * Text uses gold-700 (not the brighter accent/gold-500) on light
 * backgrounds — gold-500 text on white is only ~2.3:1 contrast, well
 * under the 4.5:1 WCAG AA floor for small text. gold-500 stays fine as a
 * *fill* (buttons/badges, always paired with dark on-accent text) and as
 * gold-400 text against dark sections, so only this light-mode text case
 * needed the swap. The underline stays the brighter accent tone since
 * it's decorative, not text.
 */
export default function SectionKicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <div
            className={`mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
                dark ? 'text-gold-400' : 'text-gold-700'
            }`}
        >
            <span className={`h-px w-6 ${dark ? 'bg-gold-400' : 'bg-accent'}`} />
            {children}
        </div>
    );
}
