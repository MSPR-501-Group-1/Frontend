/**
 * Business KPIs service — fetches direction-level analytics.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { BusinessPageData } from '@/types';
import { businessMock } from '@/mocks/business.mock';
import { USE_MOCK } from '@/lib/env';

/** Fetch the complete business KPIs dataset. */
export async function fetchBusinessData(): Promise<BusinessPageData> {
    if (USE_MOCK) return businessMock.fetch();
    return apiClient.get<BusinessPageData>('/analytics/business');
}
