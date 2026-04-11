import { apiClient } from '@/api';
import type {
    Anomaly,
    AnomalySeverity,
    AnomalyStatus,
    AnomalyType,
    DateRange,
} from '@/types';

type BackendStatus = 'open' | 'resolved' | 'all';

interface AnomalyApiItem {
    anomaly_id: string;
    source_table: string | null;
    field_name: string | null;
    record_identifier: string | null;
    original_value: string | null;
    detected_at: string | null;
    severity: string | null;
    is_resolved: boolean;
    resolution_action: string | null;
    check_id: string | null;
    execution_id: string | null;
    extra?: {
        check_type?: string | null;
        check_rule?: string | null;
        execution_name?: string | null;
        execution_status?: string | null;
    };
}

interface AnomaliesApiData {
    items: AnomalyApiItem[];
    total: number;
    page: number;
    perPage: number;
}

interface ApiEnvelope<T> {
    success?: boolean;
    data?: T;
}

export interface FetchAnomaliesParams {
    range?: DateRange;
    status?: BackendStatus;
    page?: number;
    perPage?: number;
    organizationId?: string;
}

const CHECK_TYPE_TO_ANOMALY_TYPE: Record<string, AnomalyType> = {
    RANGE_CHECK: 'out_of_range',
    DUPLICATE_CHECK: 'duplicate',
    NULL_CHECK: 'missing',
    FORMAT_CHECK: 'format_error',
    CONSISTENCY_CHECK: 'inconsistent',
};

const normalizePayload = <T>(payload: T | ApiEnvelope<T>): T => {
    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
        const data = (payload as ApiEnvelope<T>).data;
        if (data !== undefined) {
            return data;
        }
    }

    return payload as T;
};

const toSeverity = (rawSeverity: string | null): AnomalySeverity => {
    const normalized = String(rawSeverity || '').trim().toUpperCase();

    if (normalized === 'CRITICAL') return 'critical';
    if (normalized === 'HIGH') return 'high';
    if (normalized === 'MEDIUM') return 'medium';
    if (normalized === 'LOW') return 'low';

    return 'medium';
};

const toStatus = (isResolved: boolean): AnomalyStatus => {
    return isResolved ? 'corrected' : 'open';
};

const toType = (checkType: string | null | undefined): AnomalyType => {
    const normalized = String(checkType || '').trim().toUpperCase();
    return CHECK_TYPE_TO_ANOMALY_TYPE[normalized] || 'inconsistent';
};

const buildDescription = (item: AnomalyApiItem): string => {
    const source = item.source_table || 'unknown_source';
    const field = item.field_name || 'unknown_field';
    const identifier = item.record_identifier || 'unknown_record';
    const rule = item.extra?.check_rule || 'rule_not_available';

    return `${source}.${field} (${identifier}) - ${rule}`;
};

const toAnomaly = (item: AnomalyApiItem): Anomaly => ({
    id: item.anomaly_id,
    detectedAt: item.detected_at || '',
    source: item.source_table || 'unknown_source',
    field: item.field_name || 'unknown_field',
    type: toType(item.extra?.check_type),
    severity: toSeverity(item.severity),
    status: toStatus(Boolean(item.is_resolved)),
    description: buildDescription(item),
    originalValue: item.original_value || '',
    justification: item.resolution_action || undefined,
});

export async function fetchAnomalies(params: FetchAnomaliesParams = {}): Promise<Anomaly[]> {
    const query = {
        range: params.range || 'all',
        status: params.status || 'all',
        page: params.page || 1,
        perPage: params.perPage || 200,
        organization_id: params.organizationId,
    };

    const response = await apiClient.get<AnomaliesApiData | ApiEnvelope<AnomaliesApiData>>('/anomalies', {
        params: query,
    });

    const payload = normalizePayload(response);
    return (payload.items || []).map(toAnomaly);
}

export async function correctAnomaly(
    id: string,
    resolutionAction: string,
    resolvedBy: string,
): Promise<Anomaly> {
    const normalizedAction = resolutionAction.trim();
    const normalizedResolvedBy = resolvedBy.trim();

    if (!normalizedAction) {
        throw new Error('Action de resolution obligatoire.');
    }

    if (normalizedAction.length > 50) {
        throw new Error('Action de resolution trop longue (50 caracteres max).');
    }

    if (!normalizedResolvedBy) {
        throw new Error('Utilisateur non authentifie pour la correction.');
    }

    const response = await apiClient.patch<AnomalyApiItem | ApiEnvelope<AnomalyApiItem>>(
        `/anomalies/${id}/correct`,
        {
            resolution_action: normalizedAction,
            resolved_by: normalizedResolvedBy,
        }
    );

    const payload = normalizePayload(response);
    return toAnomaly(payload);
}
