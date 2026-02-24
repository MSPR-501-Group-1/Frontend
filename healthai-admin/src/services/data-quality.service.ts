/**
 * Data Quality service — public API consumed by React Query hooks.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-functions
 */

import { apiClient } from '@/api';
import type { DataQualityScore } from '@/types';
import { dataQualityMock } from '@/mocks/data-quality.mock';

const USE_MOCK = true;

/** Fetch current data quality scores + 30-day history. */
export async function fetchDataQualityScore(): Promise<DataQualityScore> {
    if (USE_MOCK) return dataQualityMock.fetchScore();
    return apiClient.get<DataQualityScore>('/data-quality/score');
}
