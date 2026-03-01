/**
 * Validation service — public API consumed by React Query hooks.
 *
 * Models the ETL CSV OK/KO workflow (Approach A):
 *   - fetchValidationBatches(): list all ETL output batches
 *   - fetchValidationSummary(): aggregated KPI counters
 *   - approveBatch(): triggers ok.csv insertion into PostgreSQL
 *   - rejectBatch(): marks for re-submission to ETL
 *
 * Toggle `USE_MOCK` to switch between mock and real backend (DIP).
 */

import { apiClient } from '@/api';
import type { ValidationBatch, ValidationSummary, ValidationRecord } from '@/types';
import { validationMock } from '@/mocks/validation.mock';

const USE_MOCK = true;

// ─── Public service API ─────────────────────────────────────

/** Fetch all validation batches (ETL output lots). */
export async function fetchValidationBatches(): Promise<ValidationBatch[]> {
    if (USE_MOCK) return validationMock.fetchBatches();
    return apiClient.get<ValidationBatch[]>('/validation/batches');
}

/** Fetch aggregated summary (counts per status). */
export async function fetchValidationSummary(): Promise<ValidationSummary> {
    if (USE_MOCK) return validationMock.fetchSummary();
    return apiClient.get<ValidationSummary>('/validation/summary');
}

/** Fetch flagged records (ko.csv lines) for a specific batch. */
export async function fetchBatchRecords(batchId: string): Promise<ValidationRecord[]> {
    if (USE_MOCK) return validationMock.fetchRecordsByBatch(batchId);
    return apiClient.get<ValidationRecord[]>(`/validation/batches/${batchId}/records`);
}

/** Approve a batch — triggers ok.csv insertion into PostgreSQL. */
export async function approveBatch(id: string, comment: string): Promise<ValidationBatch> {
    if (USE_MOCK) return validationMock.approveBatch(id, comment);
    return apiClient.post<ValidationBatch>(`/validation/batches/${id}/approve`, { comment });
}

/** Reject a batch — marks for re-submission to ETL pipeline. */
export async function rejectBatch(id: string, comment: string): Promise<ValidationBatch> {
    if (USE_MOCK) return validationMock.rejectBatch(id, comment);
    return apiClient.post<ValidationBatch>(`/validation/batches/${id}/reject`, { comment });
}

/** Correct a single flagged record — admin provides the new value. */
export async function updateRecord(recordId: string, correctedValue: string): Promise<ValidationRecord> {
    if (USE_MOCK) return validationMock.updateRecord(recordId, correctedValue);
    return apiClient.patch<ValidationRecord>(`/validation/records/${recordId}`, { correctedValue });
}

/** Dismiss a flagged record — anomaly deemed irrelevant. */
export async function dismissRecord(recordId: string): Promise<ValidationRecord> {
    if (USE_MOCK) return validationMock.dismissRecord(recordId);
    return apiClient.patch<ValidationRecord>(`/validation/records/${recordId}/dismiss`, {});
}
