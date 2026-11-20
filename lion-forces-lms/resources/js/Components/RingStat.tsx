interface Props {
    percentage: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}

/** Circular progress ring used for percentage-of-whole dashboard stats
 * (e.g. active students, accuracy) -- kept separate from plain counts,
 * which read better as a flat number than a mostly-decorative ring. */
export default function RingStat({ percentage, color, size = 60, strokeWidth = 7 }: Props) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percentage));
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="flex-shrink-0">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
        </svg>
    );
}
