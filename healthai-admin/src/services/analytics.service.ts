import { apiClient } from '@/api';
import { format } from 'date-fns';
import type { AnalyticsPageData } from '@/types';

interface FitnessMetricsPayload {
    dailyMetrics: Array<{ jour: string; total_minutes: number | string }>;
    averageSessionsPerWeek: number | string | null;
    averageDuration: number | string | null;
    distribution?: Array<{ category: string; count: number | string }>;
}

interface FitnessMetricsResponse {
    success?: boolean;
    data?: FitnessMetricsPayload;
}

function normalizeFitnessPayload(resp: FitnessMetricsResponse | FitnessMetricsPayload): FitnessMetricsPayload {
    return (resp as FitnessMetricsResponse).data ?? (resp as FitnessMetricsPayload);
}

// Fetch fitness analytics from real backend endpoint
export async function fetchFitnessData(range?: string): Promise<AnalyticsPageData> {
    const raw = await apiClient.get<FitnessMetricsResponse | FitnessMetricsPayload>('/metrics/fitness', { params: { range } });
    const payload = normalizeFitnessPayload(raw);

    const daily = payload.dailyMetrics ?? [];

    const timeSeries = daily.map((d) => ({
        date: format(new Date(d.jour), 'yyyy-MM-dd'),
        value: Number(d.total_minutes ?? 0),
    }));

    // To be sure that the dates are in chronological order
    timeSeries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Total minutes calculated
    const totalMinutes = daily.reduce((s, p) => s + Number(p.total_minutes ?? 0), 0);

    const kpis = [
        { id: 'sessions-week', label: 'Sessions / semaine', value: Number(payload.averageSessionsPerWeek ?? 0), status: 'success' } as const,
        { id: 'avg-duration', label: 'Durée moyenne', value: Number(payload.averageDuration ?? 0), unit: 'min', status: 'success' } as const,
        { id: 'total-duration-period', label: 'Durée totale sur la période', value: totalMinutes, unit: 'min', status: 'success' } as const,
    ] as unknown as import('@/types').BusinessKPI[];

    const breakdown = (payload.distribution ?? []).map((d) => ({ name: d.category, value: Number(d.count) }));

    return {
        kpis,
        timeSeries,
        breakdown,
        distribution: breakdown,
    };
}