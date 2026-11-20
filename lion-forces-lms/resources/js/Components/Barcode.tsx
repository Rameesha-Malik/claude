// Deterministic pseudo-random bar widths from a seed, so a barcode looks
// distinct per item but never changes between renders. Purely decorative
// (not a real scannable code) -- used on receipt/ticket-styled cards.
export default function Barcode({ seed, barCount = 20, className = 'h-4' }: { seed: number; barCount?: number; className?: string }) {
    const bars = Array.from({ length: barCount }, (_, i) => {
        const v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
        return v - Math.floor(v) > 0.55 ? 2 : 1;
    });
    return (
        <div className={`flex items-end justify-center gap-[1.5px] ${className}`} aria-hidden>
            {bars.map((w, i) => (
                <span key={i} className="bg-text-muted" style={{ width: w, height: i % 4 === 0 ? '100%' : '65%', opacity: 0.45 }} />
            ))}
        </div>
    );
}
