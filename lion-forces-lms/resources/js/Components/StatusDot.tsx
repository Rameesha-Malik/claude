interface Props {
    label: string;
    tone?: 'neutral' | 'positive' | 'warning' | 'negative';
}

/** Quiet dot + plain-case text, used in place of a bold all-caps
 * translucent pill badge -- client feedback was that the pill style reads
 * as generic/AI-generated. Only a state that genuinely needs attention
 * (warning/negative) gets a colored, semibold treatment; a routine state
 * (positive/neutral) stays visually quiet so it doesn't compete for
 * attention with the handful of rows that actually need a second look.
 * Callers map their own status vocabulary to a tone (e.g. "active" /
 * "verified" -> positive, "pending" -> warning, "rejected" / "suspended"
 * -> negative) since that vocabulary differs per page. */
export default function StatusDot({ label, tone = 'neutral' }: Props) {
    const dotColor =
        tone === 'negative' ? 'var(--color-danger)' : tone === 'warning' ? 'var(--color-warning)' : tone === 'positive' ? 'var(--color-success)' : 'var(--color-text-muted)';
    const textClass = tone === 'negative' ? 'font-semibold text-danger' : tone === 'warning' ? 'font-semibold text-warning' : 'text-text-secondary';

    return (
        <span className={`inline-flex items-center gap-1.5 text-sm capitalize ${textClass}`}>
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: dotColor }} />
            {label}
        </span>
    );
}
