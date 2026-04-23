/**
 * Shared chart styling constants for Recharts components.
 *
 * Centralises visual tokens so every chart renders consistently.
 * Changing a value here propagates to ALL charts — no more
 * duplicate hex strings scattered across components.
 *
 * @see https://recharts.org/en-US/api — Recharts API reference
 */

// ─── Axis & Grid ────────────────────────────────────────────

export const AXIS_TICK_STYLE = { fontSize: 11, fill: '#334155' } as const;
export const AXIS_LINE_STYLE = { stroke: '#E2E8F0' } as const;
export const GRID_STROKE = '#E2E8F0';
export const GRID_DASH = '3 3';

// ─── Tooltip ────────────────────────────────────────────────

export const TOOLTIP_STYLE: React.CSSProperties = {
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: 13,
};

// ─── Legend ──────────────────────────────────────────────────

export const LEGEND_STYLE: React.CSSProperties = { fontSize: 12 };
export const LEGEND_ICON_SIZE = 8;
export const LEGEND_ICON_TYPE = 'circle' as const;

// ─── Animation ──────────────────────────────────────────────

export const ANIMATION_DURATION = 1000;
export const ANIMATION_DURATION_SLOW = 1400;

// ─── Label line ─────────────────────────────────────────────

export const LABEL_LINE_STYLE = { stroke: '#475569', strokeWidth: 1 };

// ─── Reference line ─────────────────────────────────────────

export const REFERENCE_LINE_COLORS = {
    target: '#DC2626',
    average: '#475569',
} as const;
