/**
 * Config service — public API consumed by React Query hooks.
 *
 * Toggle `USE_MOCK` to switch between embedded mock and real backend.
 * Public signatures stay identical (DIP / Adapter pattern).
 */

import { apiClient } from '@/api';
import type { SystemConfig, ValidationRule, AlertThreshold } from '@/types';
import { configMock } from '@/mocks/config.mock';
import { USE_MOCK } from '@/lib/env';

// ─── Public service API ─────────────────────────────────────

/** Fetch the full system configuration (rules + thresholds + params). */
export async function fetchSystemConfig(): Promise<SystemConfig> {
    if (USE_MOCK) return configMock.fetchConfig();
    return apiClient.get<SystemConfig>('/config');
}

/** Update a single validation rule (partial patch). */
export async function updateValidationRule(
    id: string,
    updates: Partial<ValidationRule>,
): Promise<ValidationRule> {
    if (USE_MOCK) return configMock.updateValidationRule(id, updates);
    return apiClient.patch<ValidationRule>(`/config/rules/${id}`, updates);
}

/** Toggle an alert threshold on/off. */
export async function toggleAlertThreshold(
    id: string,
    enabled: boolean,
): Promise<AlertThreshold> {
    if (USE_MOCK) return configMock.toggleAlertThreshold(id, enabled);
    return apiClient.patch<AlertThreshold>(`/config/thresholds/${id}`, { enabled });
}

/** Update system-level parameters (retention, refresh). */
export async function updateSystemParams(
    retentionDays: number,
    refreshInterval: number,
): Promise<Pick<SystemConfig, 'retentionDays' | 'refreshInterval'>> {
    if (USE_MOCK) return configMock.updateSystemParams(retentionDays, refreshInterval);
    return apiClient.patch<Pick<SystemConfig, 'retentionDays' | 'refreshInterval'>>('/config/params', {
        retentionDays,
        refreshInterval,
    });
}
