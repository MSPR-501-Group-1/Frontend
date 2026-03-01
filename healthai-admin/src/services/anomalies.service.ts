/**
 * Anomalies service — public API consumed by React Query hooks.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.  The public signatures stay identical.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-functions
 */

import { apiClient } from '@/api';
import type { Anomaly } from '@/types';
import { anomaliesMock } from '@/mocks/anomalies.mock';
import { USE_MOCK } from '@/lib/env';

// ─── Public service API ─────────────────────────────────────

/** Fetch all anomalies. */
export async function fetchAnomalies(): Promise<Anomaly[]> {
    if (USE_MOCK) return anomaliesMock.fetchAll();
    return apiClient.get<Anomaly[]>('/anomalies');
}

/** Correct a single anomaly. */
export async function correctAnomaly(
    id: string,
    correctedValue: string,
    justification: string,
): Promise<Anomaly> {
    if (USE_MOCK) return anomaliesMock.correct(id, correctedValue, justification);
    return apiClient.patch<Anomaly>(`/anomalies/${id}/correct`, { correctedValue, justification });
}
