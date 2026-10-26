interface Segment {
    label: string;
    value: number;
    color: string;
}
interface Props {
    segments: Segment[];
    size?: number;
    strokeWidth?: number;
}

export default function DonutChart({ segments, size = 140, strokeWidth = 14 }: Props) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((sum, s) => sum + s.value, 0);

    if (total <= 0) {
        return (
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
            </svg>
        );
    }

    let offsetAcc = 0;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {segments.map((s, i) => {
                const dash = (s.value / total) * circumference;
                const circle = (
                    <circle
                        key={i}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offsetAcc}
                    />
                );
                offsetAcc += dash;
                return circle;
            })}
        </svg>
    );
}
