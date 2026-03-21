import { apiClient } from '@/api';
import { format } from 'date-fns';
import type { AnalyticsPageData } from '@/types';

// Fetch fitness analytics on UsersMetrics
export async function fetchFitnessData(range?: string): Promise<AnalyticsPageData> {
    const resp = await apiClient.get<{
        success: boolean;
        data: {
            dailyMetrics: Array<{ jour: string; total_minutes: string }>;
            averageSessionsPerWeek: string;
            averageDuration: string;
            distribution?: Array<{ category: string; count: number | string }>;
        };
    }>('/metrics/usersMetrics', { params: { range } });

    const daily = resp.data.dailyMetrics ?? [];

    const timeSeries = daily.map((d) => ({
        date: format(new Date(d.jour), 'yyyy-MM-dd'),
        value: Number(d.total_minutes ?? 0),
    }));

    // To be sure that the dates are in chronological order
    timeSeries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Total minutes calculated
    const totalMinutes = daily.reduce((s, p) => s + Number(p.total_minutes ?? 0), 0);

    const kpis = [
        { id: 'sessions-week', label: 'Sessions / semaine', value: Number(resp.data.averageSessionsPerWeek ?? 0), status: 'success' } as const,
        { id: 'avg-duration', label: 'Durée moyenne', value: Number(resp.data.averageDuration ?? 0), unit: 'min', status: 'success' } as const,
        { id: 'total-duration-period', label: 'Durée totale sur la période', value: totalMinutes, unit: 'min', status: 'success' } as const,
    ] as unknown as import('@/types').BusinessKPI[];

    const breakdown = (resp.data.distribution ?? []).map((d) => ({ name: d.category, value: Number(d.count) }));

    return {
        kpis,
        timeSeries,
        breakdown,
        distribution: breakdown,
    };
}