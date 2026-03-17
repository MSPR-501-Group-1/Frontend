/**
 * Mock data for the Validation Batch domain (ETL CSV OK/KO workflow).
 *
 * Simulates the output of the Spark ETL pipeline:
 * - Each batch = one ETL run producing ok.csv + ko.csv
 * - Batches go through the ValidationStatus workflow
 * - Records represent flagged lines from ko.csv
 *
 * Pattern identical to anomalies.mock.ts (SRP: data isolated from service).
 */

import { format, subHours } from 'date-fns';
import { DataSource, ValidationStatus } from '@/types';
import type { ValidationBatch, ValidationRecord, ValidationSummary } from '@/types';

// ─── Helpers ────────────────────────────────────────────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Source labels (DRY: reused across mock generators) ─────

const SOURCE_FILE_PREFIX: Record<DataSource, string> = {
    [DataSource.OPEN_FOOD_FACTS]: 'openfoodfacts',
    [DataSource.WHO_NUTRITION_DB]: 'who_nutrition_db',
    [DataSource.EXERCISE_DB]: 'exercise_db',
    [DataSource.USER_WEARABLES]: 'user_wearables',
    [DataSource.ANSES_CIQUAL]: 'anses_ciqual',
};

// ─── Batch dataset ──────────────────────────────────────────

const now = new Date();

const STATUSES: ValidationStatus[] = [
    ValidationStatus.PENDING,
    ValidationStatus.PENDING,
    ValidationStatus.PENDING,
    ValidationStatus.IN_REVIEW,
    ValidationStatus.IN_REVIEW,
    ValidationStatus.APPROVED,
    ValidationStatus.APPROVED,
    ValidationStatus.APPROVED,
    ValidationStatus.REJECTED,
    ValidationStatus.CORRECTED,
];

const REVIEWERS = ['admin@healthai.fr', 'data@healthai.fr'];

const BATCHES: ValidationBatch[] = Array.from({ length: 18 }, (_, i) => {
    const source = pick(Object.values(DataSource));
    const status = STATUSES[i % STATUSES.length];
    const received = subHours(now, i * 6 + Math.floor(Math.random() * 4));
    const prefix = SOURCE_FILE_PREFIX[source];
    const dateStr = format(received, 'yyyyMMdd_HHmm');
    const okCount = Math.round(800 + Math.random() * 4000);
    const koCount = Math.round(5 + Math.random() * 80);

    const isReviewed = [ValidationStatus.APPROVED, ValidationStatus.REJECTED, ValidationStatus.CORRECTED].includes(status);
    const isInReview = status === ValidationStatus.IN_REVIEW;

    return {
        id: `batch-${String(i + 1).padStart(3, '0')}`,
        source,
        pipelineRunId: `run-${String(100 + i).padStart(4, '0')}`,
        receivedAt: received.toISOString(),
        status,
        okRecordCount: okCount,
        koRecordCount: koCount,
        reviewer: isReviewed || isInReview ? pick(REVIEWERS) : undefined,
        reviewedAt: isReviewed ? subHours(received, -2).toISOString() : undefined,
        comment: isReviewed
            ? status === ValidationStatus.APPROVED
                ? 'Lot conforme, insertion autorisée.'
                : status === ValidationStatus.REJECTED
                    ? 'Trop d\'anomalies — re-soumission requise.'
                    : 'Corrections appliquées sur ko.csv, lot re-validé.'
            : undefined,
        okFileName: `${prefix}_${dateStr}_ok.csv`,
        koFileName: `${prefix}_${dateStr}_ko.csv`,
    };
});

// ─── Flagged records (ko.csv lines) ─────────────────────────

const FLAG_REASONS = [
    'Valeur hors plage physiologique',
    'Champ obligatoire manquant',
    'Doublon détecté (même timestamp + source)',
    'Format de date invalide',
    'Type de données incompatible',
    'Incohérence entre champs liés',
    'Valeur négative non autorisée',
];

const FIELDS = ['heart_rate', 'calories', 'steps', 'weight_kg', 'blood_pressure', 'sleep_hours', 'glucose', 'bmi'];
const RULES = ['range_check', 'required_field', 'duplicate_check', 'format_check', 'type_check', 'cross_field_check'];

const RECORDS: ValidationRecord[] = (() => {
    const records: ValidationRecord[] = [];
    let id = 0;
    for (const batch of BATCHES) {
        const count = Math.min(batch.koRecordCount, 5); // max 5 sample records per batch for the mock
        for (let j = 0; j < count; j++) {
            id++;
            const statusOptions: ValidationRecord['validationStatus'][] =
                batch.status === ValidationStatus.CORRECTED
                    ? ['corrected']
                    : batch.status === ValidationStatus.REJECTED
                        ? ['flagged', 'dismissed']
                        : ['flagged'];
            const status = pick(statusOptions);
            const originalValue = pick(['320', '-500', '', 'abc', '2026-13-45', '0.001', '999999', 'null']);
            records.push({
                id: `rec-${String(id).padStart(4, '0')}`,
                batchId: batch.id,
                field: pick(FIELDS),
                originalValue,
                correctedValue: status === 'corrected' ? pick(['72', '1800', '8500', '75.2', '0.5', '120/80']) : undefined,
                validationStatus: status,
                rule: pick(RULES),
                flagReason: pick(FLAG_REASONS),
                correctedBy: status === 'corrected' ? 'admin@healthai.fr' : undefined,
                correctedAt: status === 'corrected' ? new Date().toISOString() : undefined,
            });
        }
    }
    return records;
})();

// ─── Summary (computed — DRY: single derivation logic) ──────

function computeSummary(batches: ValidationBatch[]): ValidationSummary {
    return {
        pending: batches.filter((b) => b.status === ValidationStatus.PENDING).length,
        inReview: batches.filter((b) => b.status === ValidationStatus.IN_REVIEW).length,
        approved: batches.filter((b) => b.status === ValidationStatus.APPROVED).length,
        rejected: batches.filter((b) => b.status === ValidationStatus.REJECTED).length,
        corrected: batches.filter((b) => b.status === ValidationStatus.CORRECTED).length,
        total: batches.length,
    };
}

// ─── Public mock API ────────────────────────────────────────

export const validationMock = {
    async fetchBatches(): Promise<ValidationBatch[]> {
        await delay(200, 500);
        return [...BATCHES];
    },

    async fetchSummary(): Promise<ValidationSummary> {
        await delay(100, 300);
        return computeSummary(BATCHES);
    },

    async fetchRecordsByBatch(batchId: string): Promise<ValidationRecord[]> {
        await delay(150, 400);
        return RECORDS.filter((r) => r.batchId === batchId);
    },

    async approveBatch(id: string, comment: string): Promise<ValidationBatch> {
        await delay(200, 500);
        const batch = BATCHES.find((b) => b.id === id);
        if (!batch) throw new Error(`Batch ${id} introuvable`);
        batch.status = ValidationStatus.APPROVED;
        batch.reviewer = 'admin@healthai.fr';
        batch.reviewedAt = new Date().toISOString();
        batch.comment = comment;
        return { ...batch };
    },

    async rejectBatch(id: string, comment: string): Promise<ValidationBatch> {
        await delay(200, 500);
        const batch = BATCHES.find((b) => b.id === id);
        if (!batch) throw new Error(`Batch ${id} introuvable`);
        batch.status = ValidationStatus.REJECTED;
        batch.reviewer = 'admin@healthai.fr';
        batch.reviewedAt = new Date().toISOString();
        batch.comment = comment;
        return { ...batch };
    },

    /** Corriger la valeur d'un enregistrement flagged dans ko.csv */
    async updateRecord(recordId: string, correctedValue: string): Promise<ValidationRecord> {
        await delay(100, 300);
        const record = RECORDS.find((r) => r.id === recordId);
        if (!record) throw new Error(`Record ${recordId} introuvable`);
        record.correctedValue = correctedValue;
        record.validationStatus = 'corrected';
        record.correctedBy = 'admin@healthai.fr';
        record.correctedAt = new Date().toISOString();
        return { ...record };
    },

    /** Ignorer (dismiss) un enregistrement — anomalie jugée non-pertinente */
    async dismissRecord(recordId: string): Promise<ValidationRecord> {
        await delay(100, 300);
        const record = RECORDS.find((r) => r.id === recordId);
        if (!record) throw new Error(`Record ${recordId} introuvable`);
        record.validationStatus = 'dismissed';
        record.correctedBy = 'admin@healthai.fr';
        record.correctedAt = new Date().toISOString();
        return { ...record };
    },
};
