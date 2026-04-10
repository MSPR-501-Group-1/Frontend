/**
 * Data Quality service — public API consumed by React Query hooks.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-functions
 */

import { apiClient } from '@/api';
import { scoreToStatus } from '@/lib/status.utils';
import type { DataQualityScore, DateRange } from '@/types';

interface DataQualityApiPayload {
    overall?: { score?: number | string | null };
    dimensions?: Array<{ name?: string | null; score?: number | string | null }>;
    history?: Array<{ date?: string | null; score?: number | string | null }>;
}

interface DataQualityApiResponse {
    success?: boolean;
    data?: DataQualityApiPayload;
}

const DIMENSION_META: Record<string, { label: string; description: string }> = {
    null_check: {
        label: 'Complétude',
        description: 'Présence des champs attendus dans les données contrôlées.',
    },
    range_check: {
        label: 'Exactitude',
        description: 'Conformité des valeurs aux bornes métiers définies.',
    },
    duplicate_check: {
        label: 'Unicité',
        description: 'Absence de doublons sur les identifiants et enregistrements.',
    },
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

const toScore = (value: unknown) => {
    const score = Number(value);
    return Number.isFinite(score) ? clampScore(Math.round(score * 10) / 10) : 0;
};

const toDimensionKey = (name: unknown) => String(name ?? 'unknown').toLowerCase();

const toDimensionLabel = (key: string) => {
    const custom = DIMENSION_META[key]?.label;
    if (custom) return custom;
    return key
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const toDimensionDescription = (key: string) => {
    const custom = DIMENSION_META[key]?.description;
    if (custom) return custom;
    return `Score agrégé pour les contrôles ${key.replaceAll('_', ' ')}.`;
};

function normalizePayload(raw: DataQualityApiResponse | DataQualityApiPayload): DataQualityApiPayload {
    return (raw as DataQualityApiResponse).data ?? (raw as DataQualityApiPayload);
}

/** Fetch current data quality scores + 30-day history. */
export async function fetchDataQualityScore(range: DateRange = '30d'): Promise<DataQualityScore> {
    const raw = await apiClient.get<DataQualityApiResponse | DataQualityApiPayload>('/data-quality/score', {
        params: { range },
    });
    const payload = normalizePayload(raw);

    const dimensions = (payload.dimensions ?? []).map((dimension) => {
        const key = toDimensionKey(dimension.name);
        const score = toScore(dimension.score);

        return {
            id: key,
            label: toDimensionLabel(key),
            score,
            description: toDimensionDescription(key),
            status: scoreToStatus(score),
        };
    });

    return {
        overall: toScore(payload.overall?.score),
        dimensions,
        history: (payload.history ?? []).map((point) => ({
            date: String(point.date ?? ''),
            value: toScore(point.score),
            target: 90,
        })),
    };
}
