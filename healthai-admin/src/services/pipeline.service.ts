/**
 * Pipeline service — fetches ETL execution records.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { PipelineRun } from '@/types';
import { pipelineMock } from '@/mocks/pipeline.mock';

const USE_MOCK = true;

/** Fetch all pipeline execution records. */
export async function fetchPipelineRuns(): Promise<PipelineRun[]> {
    if (USE_MOCK) return pipelineMock.fetchAll();
    return apiClient.get<PipelineRun[]>('/data/pipeline');
}
