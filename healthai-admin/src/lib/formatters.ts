/**
 * Shared formatting utilities used across charts and data displays.
 *
 * Extracted to avoid copy-pasting the same Intl / Date formatting
 * logic inside every Recharts `tickFormatter` or `labelFormatter`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
 */

const frNumber = new Intl.NumberFormat('fr-FR');
const frDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
});

/** Format a number with French locale separators. */
export function formatNumber(value: number): string {
    return frNumber.format(value);
}

/** "15/2" style short date for chart X-axis ticks. */
export function formatShortDate(isoOrLabel: string): string {
    const d = new Date(isoOrLabel);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** "lun. 15 fév." style label for Recharts tooltip `labelFormatter`. */
export function formatTooltipDate(label: unknown): string {
    return frDate.format(new Date(String(label)));
}

/** Format a value with an optional unit suffix. */
export function formatWithUnit(value: number, unit?: string): string {
    const formatted = frNumber.format(value);
    return unit ? `${formatted} ${unit}` : formatted;
}

/** Abbreviate large numbers: 45 200 → "45.2K". */
export function formatCompact(value: number): string {
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return String(value);
}
