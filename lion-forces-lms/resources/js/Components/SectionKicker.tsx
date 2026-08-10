/**
 * Small uppercase gold label above a section heading — the recurring
 * "poster tag" motif that gives every section a consistent, distinct
 * identity instead of a plain H2.
 */
export default function SectionKicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <div
            className={`mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${
                dark ? 'text-gold-400' : 'text-accent'
            }`}
        >
            <span className={`h-px w-6 ${dark ? 'bg-gold-400' : 'bg-accent'}`} />
            {children}
        </div>
    );
}
