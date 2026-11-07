/**
 * Laravel's decimal:N casts (percentage, score, total_marks on TestAttempt)
 * come across the wire as fixed-precision strings like "0.00" or "66.70" --
 * correct for calculation, ugly to read as-is. Trims to at most
 * `maxDecimals` places and drops a trailing ".0"/".00" entirely, so a whole
 * result reads as "66%" or "1/1" instead of "66.00%" / "1.00/1.00".
 */
export function trimDecimal(value: string | number, maxDecimals = 1): string {
    const num = Number(value);

    if (!Number.isFinite(num)) {
        return String(value);
    }

    return parseFloat(num.toFixed(maxDecimals)).toString();
}
