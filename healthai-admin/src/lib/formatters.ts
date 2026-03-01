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

// ─── Date formatters (DataGrid valueFormatter) ──────────────

const frDateTime = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const frDateOnly = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

/**
 * Format an ISO date string as "dd/MM/yyyy HH:mm".
 *
 * Usage as DataGrid `valueFormatter`:
 *   `valueFormatter: (v: string) => formatDateTime(v)`
 */
export function formatDateTime(value: string | null | undefined): string {
    if (!value) return 'Jamais';
    return frDateTime.format(new Date(value));
}

/**
 * Format an ISO date string as "dd/MM/yyyy".
 *
 * Usage as DataGrid `valueFormatter`:
 *   `valueFormatter: (v: string) => formatDate(v)`
 */
export function formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    return frDateOnly.format(new Date(value));
}

/**
 * Format a duration in seconds as "Xm Ys" or "Xs".
 */
export function formatDuration(seconds: number): string {
    if (seconds === 0) return '—';
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

/**
 * Pluralise a French word (simplistic: appends 's' if count > 1).
 *
 * Usage: `${count} ${pluralize(count, 'anomalie')}` → "3 anomalies"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    if (count <= 1) return singular;
    return plural ?? `${singular}s`;
}
