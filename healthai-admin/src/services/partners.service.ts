/**
 * Partners service — public API consumed by React Query hooks.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`. Public signatures stay identical (DIP).
 */

import { apiClient } from '@/api';
import type { Partner, PartnerDashboardData } from '@/types';
import { partnersMock } from '@/mocks/partners.mock';

const USE_MOCK = true;

// ─── Public service API ─────────────────────────────────────

/** Fetch all partners. */
export async function fetchPartners(): Promise<Partner[]> {
    if (USE_MOCK) return partnersMock.fetchAll();
    return apiClient.get<Partner[]>('/partners');
}

/** Fetch the partner dashboard (partners + aggregated charts data). */
export async function fetchPartnerDashboard(): Promise<PartnerDashboardData> {
    if (USE_MOCK) return partnersMock.fetchDashboard();
    return apiClient.get<PartnerDashboardData>('/partners/dashboard');
}
