/**
 * Business KPIs service — fetches direction-level analytics from backend.
 */

import { apiClient } from '@/api';
import type { BusinessPageData, DateRange } from '@/types';

interface BusinessResponseEnvelope {
    success?: boolean;
    data?: BusinessPageData;
}

/** Fetch the complete business KPIs dataset. */
export async function fetchBusinessData(range: DateRange = '30d'): Promise<BusinessPageData> {
    const response = await apiClient.get<BusinessPageData | BusinessResponseEnvelope>('/analytics/business', {
        params: { range },
    });
    return (response as BusinessResponseEnvelope).data ?? (response as BusinessPageData);
}
