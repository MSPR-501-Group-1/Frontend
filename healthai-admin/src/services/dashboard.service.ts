/**
 * Dashboard service — fetches KPIs and chart data for the main dashboard.
 *
 * Currently delegates to mocks. When backend is live, just set USE_MOCK = false.
 */

import { apiClient } from '@/api';
import type { DashboardData } from '@/types';
import { dashboardData as mockData } from '@/mocks/data';
import { USE_MOCK } from '@/lib/env';

/** Fetch the complete dashboard dataset (KPIs + all chart series). */
export async function fetchDashboardData(): Promise<DashboardData> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
        return mockData;
    }
    return apiClient.get<DashboardData>('/dashboard');
}
