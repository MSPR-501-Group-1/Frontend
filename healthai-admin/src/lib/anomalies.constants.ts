/**
 * Configuration maps for anomaly display.
 *
 * Extracted from AnomaliesPage so they can be reused by any
 * component that needs to render anomaly metadata (e.g. detail
 * drawers, export formatters, DataGrid columns).
 */

import type { AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';

export const SEVERITY_CONFIG: Record<
    AnomalySeverity,
    { label: string; color: 'error' | 'warning' | 'info' | 'success' }
> = {
    critical: { label: 'Critique', color: 'error' },
    high: { label: 'Élevée', color: 'warning' },
    medium: { label: 'Moyenne', color: 'info' },
    low: { label: 'Faible', color: 'success' },
};

export const STATUS_CONFIG: Record<
    AnomalyStatus,
    { label: string; color: 'error' | 'warning' | 'info' | 'success' | 'default' }
> = {
    open: { label: 'Ouverte', color: 'error' },
    in_review: { label: 'En revue', color: 'warning' },
    corrected: { label: 'Corrigée', color: 'success' },
    dismissed: { label: 'Écartée', color: 'default' },
};

export const TYPE_LABELS: Record<AnomalyType, string> = {
    out_of_range: 'Hors plage',
    duplicate: 'Doublon',
    missing: 'Manquant',
    inconsistent: 'Incohérent',
    format_error: 'Format invalide',
};

/** Ordered severity levels for DataGrid sort comparator. */
export const SEVERITY_ORDER: AnomalySeverity[] = ['critical', 'high', 'medium', 'low'];
