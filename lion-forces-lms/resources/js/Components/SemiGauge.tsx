interface Props {
    percentage: number;
    color: string;
    trackColor?: string;
    size?: number;
    strokeWidth?: number;
}

// Half-circle gauge (client's reference: "Protection Score" / "Investment
// Score" cards) -- flat color, not that reference's gradient fill, matching
// RingStat's own flat-color convention elsewhere on this dashboard.
export default function SemiGauge({ percentage, color, trackColor = 'var(--color-border)', size = 160, strokeWidth = 14 }: Props) {
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const halfCircumference = Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percentage));
    const offset = halfCircumference - (clamped / 100) * halfCircumference;
    const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`;

    return (
        <svg width={size} height={size / 2 + strokeWidth / 2} viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`} className="flex-shrink-0">
            <path d={path} fill="none" stroke={trackColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={halfCircumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
        </svg>
    );
}
