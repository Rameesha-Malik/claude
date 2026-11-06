interface Props {
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
    /** Second color for a top-to-bottom gradient fill on each bar, instead
     * of a flat color. Opt-in so existing callers are unaffected. */
    gradientTo?: string;
    /** Shows a floating callout bubble over the highest-value bar, same
     * idea as the "GPA 80" bubble on the reference chart the client sent --
     * kept as a styling flourish on top of the bar format itself, which
     * stays bars (see note below), not a switch to a line/area chart. */
    showPeak?: boolean;
}

/** Simple CSS-bar trend chart (not SVG/canvas, same div-based approach as
 * the progress bars used elsewhere in the app) -- client feedback was that
 * a bar chart reads the day-by-day activity more accurately than a
 * smoothed line chart did for this kind of count data. That decision
 * stands; gradientTo/showPeak only add visual richness on top of it. */
export default function BarChart({ data, color = 'var(--color-primary)', height = 160, gradientTo, showPeak = false }: Props) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const peakIndex = showPeak ? data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0) : -1;
    const labelIndices = data.length <= 6 ? data.map((_, i) => i) : [0, Math.floor((data.length - 1) / 2), data.length - 1];

    return (
        <div>
            <div className="flex items-end gap-1" style={{ height }}>
                {data.map((d, i) => (
                    <div key={i} className="group relative h-full flex-1">
                        {i === peakIndex && d.value > 0 && (
                            <span
                                className="absolute left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-bold text-white shadow-md"
                                style={{ bottom: `calc(${Math.max(2, (d.value / max) * 100)}% + 10px)` }}
                            >
                                {d.label}: {d.value}
                            </span>
                        )}
                        <div
                            className="absolute bottom-0 w-full rounded-t-sm transition-all duration-normal group-hover:opacity-80"
                            style={{
                                height: `${Math.max(2, (d.value / max) * 100)}%`,
                                background: gradientTo ? `linear-gradient(to top, ${color}, ${gradientTo})` : color,
                                opacity: d.value === 0 ? 0.2 : 1,
                            }}
                        />
                        {i !== peakIndex && (
                            <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-1.5 py-0.5 text-[0.65rem] font-bold text-surface group-hover:block">
                                {d.label}: {d.value}
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-text-muted">
                {labelIndices.map((i) => (
                    <span key={i}>{data[i]?.label}</span>
                ))}
            </div>
        </div>
    );
}
