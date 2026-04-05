/**
 * Partners service — always backed by real backend endpoints.
 */

import { apiClient } from '@/api';
import type { Partner, PartnerDashboardData } from '@/types';

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

// ─── Public service API ─────────────────────────────────────

/** Fetch all partners. */
export async function fetchPartners(): Promise<Partner[]> {
    const response = await apiClient.get<Partner[] | ApiEnvelope<Partner[]>>('/partners');
    return unwrapData(response);
}

/** Fetch the partner dashboard (partners + aggregated charts data). */
export async function fetchPartnerDashboard(): Promise<PartnerDashboardData> {
    const response = await apiClient.get<PartnerDashboardData | ApiEnvelope<PartnerDashboardData>>('/partners/dashboard');
    return unwrapData(response);
}
