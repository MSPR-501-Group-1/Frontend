/**
 * Dashboard service — always backed by the real backend endpoint.
 */

import { apiClient } from '@/api';
import type { DashboardData, DateRange } from '@/types';

type ApiEnvelope<T> = {
    success?: boolean;
    data?: T;
};

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
        const data = (payload as ApiEnvelope<T>).data;
        if (data !== undefined) return data;
    }
    return payload as T;
}

/** Fetch the complete dashboard dataset (KPIs + all chart series). */
export async function fetchDashboardData(range: DateRange = '30d'): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData | ApiEnvelope<DashboardData>>('/dashboard', {
        params: { range },
    });
    return unwrapData(response);
}
