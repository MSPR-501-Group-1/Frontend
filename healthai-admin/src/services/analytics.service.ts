import { apiClient } from '@/api';
import { format } from 'date-fns';
import type { AnalyticsPageData, DateRange } from '@/types';

interface FitnessMetricsPayload {
    dailyMetrics: Array<{ jour: string; total_minutes: number | string }>;
    averageSessionsPerWeek: number | string | null;
    averageSessionsPerWeekTrend?: number | string | null;
    previousAverageSessionsPerWeek?: number | string | null;
    averageDuration: number | string | null;
    averageDurationTrend?: number | string | null;
    previousAverageDuration?: number | string | null;
    totalMinutes?: number | string | null;
    totalMinutesTrend?: number | string | null;
    previousTotalMinutes?: number | string | null;
    distribution?: Array<{ category: string; count: number | string }>;
}

interface FitnessMetricsResponse {
    success?: boolean;
    data?: FitnessMetricsPayload;
}

interface AnalyticsResponseEnvelope {
    success?: boolean;
    data?: AnalyticsPageData;
}

function normalizeFitnessPayload(resp: FitnessMetricsResponse | FitnessMetricsPayload): FitnessMetricsPayload {
    return (resp as FitnessMetricsResponse).data ?? (resp as FitnessMetricsPayload);
}

function normalizeAnalyticsPayload(resp: AnalyticsResponseEnvelope | AnalyticsPageData): AnalyticsPageData {
    return (resp as AnalyticsResponseEnvelope).data ?? (resp as AnalyticsPageData);
}

export async function fetchNutritionData(range: DateRange = 'all'): Promise<AnalyticsPageData> {
    const raw = await apiClient.get<AnalyticsResponseEnvelope | AnalyticsPageData>('/analytics/nutrition', {
        params: { range },
    });
    return normalizeAnalyticsPayload(raw);
}

export async function fetchBiometricData(range: DateRange = 'all'): Promise<AnalyticsPageData> {
    const raw = await apiClient.get<AnalyticsResponseEnvelope | AnalyticsPageData>('/analytics/biometric', {
        params: { range },
    });
    return normalizeAnalyticsPayload(raw);
}

// Fetch fitness analytics from real backend endpoint
export async function fetchFitnessData(range: DateRange = 'all'): Promise<AnalyticsPageData> {
    const raw = await apiClient.get<FitnessMetricsResponse | FitnessMetricsPayload>('/metrics/fitness', { params: { range } });
    const payload = normalizeFitnessPayload(raw);

    const daily = payload.dailyMetrics ?? [];

    const timeSeries = daily.map((d) => ({
        date: format(new Date(d.jour), 'yyyy-MM-dd'),
        value: Number(d.total_minutes ?? 0),
    }));

    // To be sure that the dates are in chronological order
    timeSeries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Fallback: compute total minutes from daily points if API did not provide aggregate.
    const totalMinutes = payload.totalMinutes !== undefined && payload.totalMinutes !== null
        ? Number(payload.totalMinutes)
        : daily.reduce((s, p) => s + Number(p.total_minutes ?? 0), 0);

    const sessionsTrend = payload.averageSessionsPerWeekTrend !== undefined && payload.averageSessionsPerWeekTrend !== null
        ? Number(payload.averageSessionsPerWeekTrend)
        : undefined;
    const avgDurationTrend = payload.averageDurationTrend !== undefined && payload.averageDurationTrend !== null
        ? Number(payload.averageDurationTrend)
        : undefined;
    const totalMinutesTrend = payload.totalMinutesTrend !== undefined && payload.totalMinutesTrend !== null
        ? Number(payload.totalMinutesTrend)
        : undefined;

    const kpis = [
        {
            id: 'sessions-week',
            label: 'Sessions / semaine',
            description: 'Nombre moyen de sessions hebdomadaires sur la fenetre selectionnee.',
            value: Number(payload.averageSessionsPerWeek ?? 0),
            comparedValue: payload.previousAverageSessionsPerWeek !== undefined && payload.previousAverageSessionsPerWeek !== null
                ? Number(payload.previousAverageSessionsPerWeek)
                : null,
            trend: sessionsTrend,
            trendUnit: '%',
            status: 'success',
        } as const,
        {
            id: 'avg-duration',
            label: 'Durée moyenne',
            description: 'Duree moyenne d\'une session workout sur la periode.',
            value: Number(payload.averageDuration ?? 0),
            unit: 'min',
            comparedValue: payload.previousAverageDuration !== undefined && payload.previousAverageDuration !== null
                ? Number(payload.previousAverageDuration)
                : null,
            comparedUnit: 'min',
            trend: avgDurationTrend,
            trendUnit: '%',
            status: 'success',
        } as const,
        {
            id: 'total-duration-period',
            label: 'Durée totale sur la période',
            description: 'Somme des minutes d\'activite enregistrees sur la fenetre.',
            value: totalMinutes,
            unit: 'min',
            comparedValue: payload.previousTotalMinutes !== undefined && payload.previousTotalMinutes !== null
                ? Number(payload.previousTotalMinutes)
                : null,
            comparedUnit: 'min',
            trend: totalMinutesTrend,
            trendUnit: '%',
            status: 'success',
        } as const,
    ] as unknown as import('@/types').BusinessKPI[];

    const breakdown = (payload.distribution ?? []).map((d) => ({ name: d.category, value: Number(d.count) }));

    return {
        kpis,
        timeSeries,
        breakdown,
        distribution: breakdown,
    };
}