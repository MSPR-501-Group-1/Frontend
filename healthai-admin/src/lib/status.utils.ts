/**
 * Centralised status → color mapping used by KPI cards,
 * Data Quality dimensions, and any other status-driven UI.
 *
 * Single source of truth so the palette stays consistent
 * and a change propagates everywhere.
 */
import type { KPIStatus } from '@/types';

export const STATUS_HEX: Record<KPIStatus, string> = {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
};

export const STATUS_MUI_COLOR: Record<KPIStatus, 'success' | 'warning' | 'error'> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
};

/** Derive a KPIStatus from a 0–100 score. */
export function scoreToStatus(score: number): KPIStatus {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
}

/** Human-readable label for a KPIStatus score band. */
export function scoreToLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Acceptable';
    return 'Critique';
}
