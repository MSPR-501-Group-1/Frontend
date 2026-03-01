/**
 * Mock data for the Configuration domain.
 *
 * Validation rules for physiological data, alert thresholds,
 * and system parameters. Pattern identical to anomalies.mock.ts (SRP).
 */

import { DataSource } from '@/types';
import type { SystemConfig, ValidationRule, AlertThreshold } from '@/types';

// ─── Helpers ────────────────────────────────────────────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Validation rules (physiological ranges) ────────────────

const VALIDATION_RULES: ValidationRule[] = [
    {
        id: 'vr-001',
        field: 'heart_rate',
        source: DataSource.BIOMETRIC,
        type: 'range',
        minValue: 30,
        maxValue: 220,
        enabled: true,
        description: 'Fréquence cardiaque — plage physiologique acceptable (30–220 bpm)',
    },
    {
        id: 'vr-002',
        field: 'calories_daily',
        source: DataSource.NUTRITION,
        type: 'range',
        minValue: 500,
        maxValue: 8000,
        enabled: true,
        description: 'Calories journalières — plage réaliste (500–8 000 kcal)',
    },
    {
        id: 'vr-003',
        field: 'steps_daily',
        source: DataSource.FITNESS_TRACKER,
        type: 'range',
        minValue: 0,
        maxValue: 100_000,
        enabled: true,
        description: 'Pas quotidiens — plage physiquement réaliste (0–100 000)',
    },
    {
        id: 'vr-004',
        field: 'weight_kg',
        source: DataSource.USER_PROFILES,
        type: 'range',
        minValue: 20,
        maxValue: 300,
        enabled: true,
        description: 'Poids — plage acceptable (20–300 kg)',
    },
    {
        id: 'vr-005',
        field: 'bmi',
        source: DataSource.BIOMETRIC,
        type: 'range',
        minValue: 10,
        maxValue: 60,
        enabled: true,
        description: 'IMC — plage médicalement documentée (10–60)',
    },
    {
        id: 'vr-006',
        field: 'blood_pressure_systolic',
        source: DataSource.BIOMETRIC,
        type: 'range',
        minValue: 70,
        maxValue: 250,
        enabled: true,
        description: 'Pression artérielle systolique — plage (70–250 mmHg)',
    },
    {
        id: 'vr-007',
        field: 'sleep_hours',
        source: DataSource.FITNESS_TRACKER,
        type: 'range',
        minValue: 0,
        maxValue: 24,
        enabled: true,
        description: 'Heures de sommeil — maximum 24h par jour',
    },
    {
        id: 'vr-008',
        field: 'glucose_mg_dl',
        source: DataSource.BIOMETRIC,
        type: 'range',
        minValue: 20,
        maxValue: 600,
        enabled: true,
        description: 'Glycémie — plage clinique (20–600 mg/dL)',
    },
    {
        id: 'vr-009',
        field: 'email',
        source: DataSource.USER_PROFILES,
        type: 'pattern',
        pattern: '^[\\w.-]+@[\\w.-]+\\.\\w{2,}$',
        enabled: true,
        description: 'Email — format RFC simplifié (regex)',
    },
    {
        id: 'vr-010',
        field: 'exercise_duration',
        source: DataSource.EXERCISES,
        type: 'range',
        minValue: 1,
        maxValue: 480,
        enabled: false,
        description: 'Durée d\'exercice — plage raisonnable (1–480 min)',
    },
];

// ─── Alert thresholds ───────────────────────────────────────

const ALERT_THRESHOLDS: AlertThreshold[] = [
    {
        id: 'at-001',
        metric: 'Score qualité données',
        warningLevel: 80,
        criticalLevel: 70,
        enabled: true,
        description: 'Seuil sur le score global de qualité des données',
    },
    {
        id: 'at-002',
        metric: 'Taux d\'anomalies',
        warningLevel: 5,
        criticalLevel: 10,
        enabled: true,
        description: 'Pourcentage d\'anomalies détectées sur les ingestions',
    },
    {
        id: 'at-003',
        metric: 'Latence pipeline ETL',
        warningLevel: 300,
        criticalLevel: 600,
        enabled: true,
        description: 'Durée d\'exécution du pipeline en secondes',
    },
    {
        id: 'at-004',
        metric: 'Taux d\'échec pipeline',
        warningLevel: 3,
        criticalLevel: 8,
        enabled: true,
        description: 'Pourcentage de runs ETL en échec',
    },
    {
        id: 'at-005',
        metric: 'Taux de rétention utilisateurs',
        warningLevel: 70,
        criticalLevel: 50,
        enabled: false,
        description: 'Rétention mensuelle des utilisateurs actifs (%)',
    },
];

// ─── System config ──────────────────────────────────────────

const SYSTEM_CONFIG: SystemConfig = {
    validationRules: VALIDATION_RULES,
    alertThresholds: ALERT_THRESHOLDS,
    retentionDays: 365,
    refreshInterval: 30,
};

// ─── Public mock API ────────────────────────────────────────

export const configMock = {
    async fetchConfig(): Promise<SystemConfig> {
        await delay(200, 500);
        return structuredClone(SYSTEM_CONFIG);
    },

    async updateValidationRule(id: string, updates: Partial<ValidationRule>): Promise<ValidationRule> {
        await delay(150, 400);
        const rule = VALIDATION_RULES.find((r) => r.id === id);
        if (!rule) throw new Error(`Règle ${id} introuvable`);
        Object.assign(rule, updates);
        return { ...rule };
    },

    async toggleAlertThreshold(id: string, enabled: boolean): Promise<AlertThreshold> {
        await delay(100, 300);
        const threshold = ALERT_THRESHOLDS.find((t) => t.id === id);
        if (!threshold) throw new Error(`Seuil ${id} introuvable`);
        threshold.enabled = enabled;
        return { ...threshold };
    },

    async updateSystemParams(retentionDays: number, refreshInterval: number): Promise<Pick<SystemConfig, 'retentionDays' | 'refreshInterval'>> {
        await delay(150, 400);
        SYSTEM_CONFIG.retentionDays = retentionDays;
        SYSTEM_CONFIG.refreshInterval = refreshInterval;
        return { retentionDays, refreshInterval };
    },
};
