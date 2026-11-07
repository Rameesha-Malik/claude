/**
 * Decorative animated gradient-mesh background. Pure CSS (slow-drifting
 * radial gradients, a tiled dot grid, and a couple of expanding "sonar
 * ping" rings) — no JS cost, and every animation is killed globally by
 * tokens.css under prefers-reduced-motion.
 *
 * The dot grid + ping rings were added after the client pointed at the
 * 21st.dev "Sonar Grid" reference and asked for the same kind of visible
 * movement across every section background that was using this component
 * (they were fine with the brand's own teal/gold/oxblood palette rather
 * than that reference's indigo). Layered on top of the existing blob
 * drift rather than replacing it, so sections keep their current depth.
 *
 * Two variants:
 * - "dark" (default): bright, higher-opacity blobs + bright dot grid for
 *   dark/teal sections (hero, CTA banners).
 * - "light": the same drifting motion but soft, low-opacity teal/oxblood
 *   blobs + a faint dot grid tuned for white/light-gray sections — enough
 *   to break up flat solid backgrounds without ever competing with body
 *   text contrast.
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
                    style={{ background: 'radial-gradient(circle, var(--oxblood-400) 0%, transparent 70%)', animation: 'mesh-drift-2 24s ease-in-out infinite' }}
                />
                <div
                    className="absolute bottom-[-15%] left-1/3 h-[45%] w-[45%] rounded-full opacity-[0.08] blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--teal-600) 0%, transparent 70%)', animation: 'mesh-drift-3 28s ease-in-out infinite' }}
                />
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, var(--color-primary) 1px, transparent 1.5px)', backgroundSize: '26px 26px' }}
                />
                <SonarPings color="var(--color-primary)" />
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
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle, var(--teal-200) 1px, transparent 1.5px)', backgroundSize: '26px 26px' }}
            />
            <SonarPings color="var(--teal-300)" />
            <style>{MESH_KEYFRAMES}</style>
        </div>
    );
}

// Two expanding rings per spot (staggered) read as a continuous "ping"
// rather than one ring resetting -- the classic radar/sonar look.
function SonarPings({ color }: { color: string }) {
    const spots: Array<{ top: string; left: string }> = [
        { top: '22%', left: '18%' },
        { top: '68%', left: '82%' },
    ];
    return (
        <>
            {spots.map((spot, i) => (
                <div key={i} className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2" style={{ top: spot.top, left: spot.left }}>
                    <span className="absolute inset-0 rounded-full border" style={{ borderColor: color, animation: 'sonar-ping 4s ease-out infinite' }} />
                    <span
                        className="absolute inset-0 rounded-full border"
                        style={{ borderColor: color, animation: 'sonar-ping 4s ease-out infinite', animationDelay: '2s' }}
                    />
                </div>
            ))}
        </>
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
    @keyframes sonar-ping {
        0% { transform: scale(0.2); opacity: 0.6; }
        100% { transform: scale(2.4); opacity: 0; }
    }
`;
