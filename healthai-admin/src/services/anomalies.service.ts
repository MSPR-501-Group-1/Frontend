import { format, subDays, subHours } from 'date-fns';
import type { Anomaly, AnomalySeverity, AnomalyStatus, AnomalyType } from '@/types';

// ─── Static mock dataset ────────────────────────────────────

const SOURCES = ['Nutrition API', 'Fitness Tracker', 'Biometric Sensor', 'Lab Results', 'Partner Feed'];
const FIELDS = ['heart_rate', 'calories', 'blood_pressure', 'bmi', 'steps', 'sleep_hours', 'glucose', 'cholesterol'];
const TYPES: AnomalyType[] = ['out_of_range', 'duplicate', 'missing', 'inconsistent', 'format_error'];
const SEVERITIES: AnomalySeverity[] = ['critical', 'high', 'medium', 'low'];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDescription(type: AnomalyType, field: string, original: string): string {
    const descriptions: Record<AnomalyType, string> = {
        out_of_range: `Valeur ${original} hors plage pour "${field}"`,
        duplicate: `Enregistrement dupliqué détecté pour "${field}"`,
        missing: `Valeur manquante pour le champ "${field}"`,
        inconsistent: `Incohérence détectée entre sources pour "${field}"`,
        format_error: `Format invalide "${original}" pour "${field}"`,
    };
    return descriptions[type];
}

function generateOriginalValue(type: AnomalyType, field: string): string {
    if (type === 'missing') return '—';
    if (type === 'format_error') return 'abc-not-a-number';
    const values: Record<string, string> = {
        heart_rate: '320',
        calories: '-500',
        blood_pressure: '300/200',
        bmi: '0.3',
        steps: '999999',
        sleep_hours: '36',
        glucose: '1500',
        cholesterol: '-10',
    };
    return values[field] || '???';
}

function generateSuggestedValue(type: AnomalyType, field: string): string | undefined {
    if (type === 'duplicate') return undefined;
    const values: Record<string, string> = {
        heart_rate: '72',
        calories: '2100',
        blood_pressure: '120/80',
        bmi: '24.5',
        steps: '8500',
        sleep_hours: '7.5',
        glucose: '95',
        cholesterol: '185',
    };
    return values[field] || '50';
}

const now = new Date();

const MOCK_ANOMALIES: Anomaly[] = Array.from({ length: 28 }, (_, i) => {
    const type = pick(TYPES);
    const field = pick(FIELDS);
    const severity = pick(SEVERITIES);
    const original = generateOriginalValue(type, field);
    const hoursAgo = Math.floor(Math.random() * 720); // last 30 days

    const statuses: AnomalyStatus[] = ['open', 'open', 'open', 'in_review', 'corrected', 'dismissed'];
    const status = pick(statuses);

    const anomaly: Anomaly = {
        id: `ANO-${String(i + 1).padStart(4, '0')}`,
        detectedAt: format(subHours(now, hoursAgo), "yyyy-MM-dd'T'HH:mm:ss"),
        source: pick(SOURCES),
        field,
        type,
        severity,
        status,
        description: generateDescription(type, field, original),
        originalValue: original,
        suggestedValue: generateSuggestedValue(type, field),
    };

    if (status === 'corrected') {
        anomaly.correctedValue = anomaly.suggestedValue || '—';
        anomaly.correctedBy = 'admin@healthai.fr';
        anomaly.correctedAt = format(subDays(now, Math.floor(Math.random() * 5)), "yyyy-MM-dd'T'HH:mm:ss");
        anomaly.justification = 'Valeur corrigée après vérification manuelle';
    }

    return anomaly;
});

// ─── Service functions ──────────────────────────────────────

// We keep a mutable copy so corrections persist during the session
let anomalies = [...MOCK_ANOMALIES];

/** Fetch all anomalies (simulates API call) */
export async function fetchAnomalies(): Promise<Anomaly[]> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
    return [...anomalies];
}

/** Correct an anomaly (simulates API mutation) */
export async function correctAnomaly(
    id: string,
    correctedValue: string,
    justification: string,
): Promise<Anomaly> {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

    const index = anomalies.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Anomaly ${id} not found`);

    const updated: Anomaly = {
        ...anomalies[index],
        status: 'corrected',
        correctedValue,
        correctedBy: 'current-user',
        correctedAt: new Date().toISOString(),
        justification,
    };

    anomalies = anomalies.map((a) => (a.id === id ? updated : a));
    return updated;
}
