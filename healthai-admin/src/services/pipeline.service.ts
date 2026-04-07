/**
 * Pipeline service — fetches and manages ETL execution records.
 */

import { apiClient } from '@/api';
import type { EtlExecution } from '@/types';

/** Fetch all ETL execution records. */
export async function fetchEtlExecutions(): Promise<EtlExecution[]> {
    const response = await apiClient.get<{ success: boolean; data: EtlExecution[] }>('/etl/etlExecutions');
    return response.data;
}

/** Fetch a single ETL execution by ID. */
export async function fetchEtlExecution(id: string): Promise<EtlExecution> {
    return apiClient.get<EtlExecution>(`/etl/${id}`);
}

/** Launch an ETL pipeline. */
export async function launchEtlPipeline(pipeline: 'nutrition' | 'exercises'): Promise<EtlExecution> {
    return apiClient.post<EtlExecution>(`/etl/${pipeline}`, {});
}

/** Approve/Load an ETL execution (update status to loaded). */
export async function approveEtlExecution(id: string): Promise<void> {
    return apiClient.post<void>(`/etl/validate/${id}`, {});
}

/** Reject an ETL execution (update status to rejected). */
export async function rejectEtlExecution(id: string): Promise<void> {
    return apiClient.post<void>(`/etl/reject/${id}`, {});
}

/** Delete an ETL execution. */
export async function deleteEtlExecution(id: string): Promise<void> {
    return apiClient.delete<void>(`/etl/${id}`);
}
