/**
 * Decorative animated gradient-mesh background for hero/CTA sections.
 * Pure CSS (slow-drifting radial gradients) — no JS cost, and the
 * animation is killed globally by tokens.css under prefers-reduced-motion.
 * Marketing-only per tokens.css's glass-usage rule; never used in the
 * student portal.
 */
export default function GradientMesh({ className = '' }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        >
            <div
                className="absolute -left-1/4 -top-1/4 h-[60%] w-[60%] rounded-full opacity-40 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, var(--teal-400) 0%, transparent 70%)',
                    animation: 'mesh-drift-1 18s ease-in-out infinite',
                }}
            />
            <div
                className="absolute -right-1/4 top-0 h-[70%] w-[70%] rounded-full opacity-30 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, var(--teal-600) 0%, transparent 70%)',
                    animation: 'mesh-drift-2 22s ease-in-out infinite',
                }}
            />
            <div
                className="absolute bottom-[-20%] left-1/3 h-[50%] w-[50%] rounded-full opacity-25 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, var(--teal-900) 0%, transparent 70%)',
                    animation: 'mesh-drift-3 26s ease-in-out infinite',
                }}
            />
            <style>{`
                @keyframes mesh-drift-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(8%, 6%) scale(1.15); }
                }
                @keyframes mesh-drift-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-6%, 8%) scale(1.1); }
                }
                @keyframes mesh-drift-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(5%, -8%) scale(1.2); }
                }
            `}</style>
        </div>
    );
}
