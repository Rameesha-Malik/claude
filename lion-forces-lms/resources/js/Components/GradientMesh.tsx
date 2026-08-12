/**
 * Decorative animated gradient-mesh background. Pure CSS (slow-drifting
 * radial gradients) — no JS cost, and the animation is killed globally by
 * tokens.css under prefers-reduced-motion.
 *
 * Two variants:
 * - "dark" (default): bright, higher-opacity blobs for dark/teal sections
 *   (hero, CTA banners).
 * - "light": the same drifting motion but soft, low-opacity teal/gold
 *   blobs tuned for white/light-gray sections — enough to break up flat
 *   solid backgrounds without ever competing with body text contrast.
 */
export default function GradientMesh({ className = '', variant = 'dark' }: { className?: string; variant?: 'dark' | 'light' }) {
    if (variant === 'light') {
        return (
            <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
                <div
                    className="absolute -left-1/4 -top-1/4 h-[55%] w-[55%] rounded-full opacity-[0.12] blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', animation: 'mesh-drift-1 20s ease-in-out infinite' }}
                />
                <div
                    className="absolute -right-1/4 top-0 h-[60%] w-[60%] rounded-full opacity-[0.10] blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--gold-400) 0%, transparent 70%)', animation: 'mesh-drift-2 24s ease-in-out infinite' }}
                />
                <div
                    className="absolute bottom-[-15%] left-1/3 h-[45%] w-[45%] rounded-full opacity-[0.08] blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--teal-600) 0%, transparent 70%)', animation: 'mesh-drift-3 28s ease-in-out infinite' }}
                />
                <style>{MESH_KEYFRAMES}</style>
            </div>
        );
    }

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
            <style>{MESH_KEYFRAMES}</style>
        </div>
    );
}

const MESH_KEYFRAMES = `
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
`;
