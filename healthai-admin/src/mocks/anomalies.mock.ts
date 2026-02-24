/**
 * Isolated mock data & fake handlers for the Anomalies domain.
 *
 * This file will be deleted once the real backend is integrated.
 * It is intentionally separated from the service so the service
 * module stays clean and backend-ready (Single Responsibility).
 */

import { format, subDays, subHours } from 'date-fns';
import type { Anomaly, AnomalyType, AnomalySeverity, AnomalyStatus } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

const SOURCES = ['Nutrition API', 'Fitness Tracker', 'Biometric Sensor', 'Lab Results', 'Partner Feed'];
const FIELDS = ['heart_rate', 'calories', 'blood_pressure', 'bmi', 'steps', 'sleep_hours', 'glucose', 'cholesterol'];
const TYPES: AnomalyType[] = ['out_of_range', 'duplicate', 'missing', 'inconsistent', 'format_error'];
const SEVERITIES: AnomalySeverity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: AnomalyStatus[] = ['open', 'open', 'open', 'in_review', 'corrected', 'dismissed'];

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

function description(type: AnomalyType, field: string, original: string): string {
    const map: Record<AnomalyType, string> = {
        out_of_range: `Valeur ${original} hors plage pour "${field}"`,
        duplicate: `Enregistrement dupliqué détecté pour "${field}"`,
        missing: `Valeur manquante pour le champ "${field}"`,
        inconsistent: `Incohérence détectée entre sources pour "${field}"`,
        format_error: `Format invalide "${original}" pour "${field}"`,
    };
    return map[type];
}

function originalValue(type: AnomalyType, field: string): string {
    if (type === 'missing') return '—';
    if (type === 'format_error') return 'abc-not-a-number';
    const defaults: Record<string, string> = {
        heart_rate: '320', calories: '-500', blood_pressure: '300/200',
        bmi: '0.3', steps: '999999', sleep_hours: '36', glucose: '1500', cholesterol: '-10',
    };
    return defaults[field] || '???';
}

function suggestedValue(type: AnomalyType, field: string): string | undefined {
    if (type === 'duplicate') return undefined;
    const defaults: Record<string, string> = {
        heart_rate: '72', calories: '2100', blood_pressure: '120/80',
        bmi: '24.5', steps: '8500', sleep_hours: '7.5', glucose: '95', cholesterol: '185',
    };
    return defaults[field] || '50';
}

// ─── Seed dataset ───────────────────────────────────────────

const now = new Date();

const SEED: Anomaly[] = Array.from({ length: 28 }, (_, i) => {
    const type = pick(TYPES);
    const field = pick(FIELDS);
    const original = originalValue(type, field);
    const status = pick(STATUSES);

    const anomaly: Anomaly = {
        id: `ANO-${String(i + 1).padStart(4, '0')}`,
        detectedAt: format(subHours(now, Math.floor(Math.random() * 720)), "yyyy-MM-dd'T'HH:mm:ss"),
        source: pick(SOURCES),
        field,
        type,
        severity: pick(SEVERITIES),
        status,
        description: description(type, field, original),
        originalValue: original,
        suggestedValue: suggestedValue(type, field),
    };

    if (status === 'corrected') {
        anomaly.correctedValue = anomaly.suggestedValue || '—';
        anomaly.correctedBy = 'admin@healthai.fr';
        anomaly.correctedAt = format(subDays(now, Math.floor(Math.random() * 5)), "yyyy-MM-dd'T'HH:mm:ss");
        anomaly.justification = 'Valeur corrigée après vérification manuelle';
    }
    return anomaly;
});

// ─── Mutable in-memory store ────────────────────────────────

let dataset = [...SEED];

// ─── Public mock handlers ───────────────────────────────────

export const anomaliesMock = {
    async fetchAll(): Promise<Anomaly[]> {
        await delay(400, 800);
        return [...dataset];
    },

    async correct(id: string, correctedValue: string, justification: string): Promise<Anomaly> {
        await delay(300, 600);
        const idx = dataset.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error(`Anomaly ${id} not found`);

        const updated: Anomaly = {
            ...dataset[idx],
            status: 'corrected',
            correctedValue,
            correctedBy: 'current-user',
            correctedAt: new Date().toISOString(),
            justification,
        };
        dataset = dataset.map((a) => (a.id === id ? updated : a));
        return updated;
    },
};
