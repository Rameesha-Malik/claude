/**
 * Decorative flowing wave-ribbon lines for dark teal CTA banners (the
 * "Start your journey" reference). Pure static SVG, no JS — sits pinned to
 * the bottom edge of whatever `relative` container it's dropped into.
 */
export default function WaveRibbon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-full w-full ${className}`}
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            fill="none"
        >
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
        </svg>
    );
}
