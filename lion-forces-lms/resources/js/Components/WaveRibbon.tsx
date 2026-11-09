/**
 * Decorative flowing wave-ribbon lines for dark teal CTA banners (the
 * "Start your journey" reference). The pattern repeats once at x+800 so
 * translating the whole group by -800 loops seamlessly -- a pure CSS
 * animation (no JS, no new dependency) gives the slow drifting motion the
 * client asked for, inspired by the 21st.dev "WebGL Shader" hero reference,
 * kept in the site's own teal/gold palette instead of that reference's
 * rainbow gradient.
 */
export default function WaveRibbon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-full w-full overflow-hidden ${className}`}
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            fill="none"
        >
            <style>{`
                @keyframes wave-ribbon-flow {
                    from { transform: translateX(0); }
                    to { transform: translateX(-800px); }
                }
                .wave-ribbon-group {
                    animation: wave-ribbon-flow 16s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .wave-ribbon-group { animation: none; }
                }
            `}</style>
            <g className="wave-ribbon-group">
                {[0, 800].map((shift) => (
                    <g key={shift} transform={`translate(${shift} 0)`}>
                        <path
                            d="M-20 140C100 80 220 80 340 120C460 160 580 160 700 105C740 87 780 80 820 85"
                            stroke="var(--teal-400)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            opacity="0.3"
                        />
                        <path
                            d="M-20 165C110 100 250 90 370 130C490 170 610 165 730 115C760 102 790 96 820 100"
                            stroke="var(--teal-300)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            opacity="0.22"
                        />
                    </g>
                ))}
            </g>
        </svg>
    );
}
