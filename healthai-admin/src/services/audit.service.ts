/**
 * Audit service — fetches audit log entries.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { AuditLog } from '@/types';
import { auditMock } from '@/mocks/audit.mock';

const USE_MOCK = true;

/** Fetch all audit log entries. */
export async function fetchAuditLogs(): Promise<AuditLog[]> {
    if (USE_MOCK) return auditMock.fetchAll();
    return apiClient.get<AuditLog[]>('/admin/audit');
}
