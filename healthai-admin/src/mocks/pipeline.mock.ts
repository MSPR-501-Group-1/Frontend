/**
 * Isolated mock data for the Pipeline ETL domain.
 *
 * Generates realistic ETL batch execution records.
 * Will be deleted once the real backend is integrated.
 */

import { format, subHours, subMinutes } from 'date-fns';
import type { PipelineRun, PipelineStatus } from '@/types';
import { DataSource } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

const SOURCES = Object.values(DataSource);
const STATUSES: PipelineStatus[] = ['success', 'success', 'success', 'success', 'failed', 'running', 'pending'];
const TRIGGERS = ['scheduler', 'admin@healthai.fr', 'data@healthai.fr', 'scheduler', 'scheduler'];

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Seed dataset ───────────────────────────────────────────

const now = new Date();

const SEED: PipelineRun[] = Array.from({ length: 35 }, (_, i) => {
    const status = pick(STATUSES);
    const source = pick(SOURCES);
    const recordsProcessed = status === 'pending' ? 0 : Math.floor(Math.random() * 50_000) + 1_000;
    const failRate = status === 'failed' ? 0.15 + Math.random() * 0.3 : Math.random() * 0.02;
    const duration = status === 'pending' ? 0 : status === 'running'
        ? Math.floor(Math.random() * 120)
        : Math.floor(Math.random() * 300) + 30;

    return {
        id: `ETL-${String(i + 1).padStart(4, '0')}`,
        source,
        startedAt: format(
            subMinutes(subHours(now, Math.floor(Math.random() * 168)), Math.floor(Math.random() * 60)),
            "yyyy-MM-dd'T'HH:mm:ss",
        ),
        duration,
        status,
        recordsProcessed,
        recordsFailed: Math.floor(recordsProcessed * failRate),
        errorMessage: status === 'failed'
            ? pick([
                'Timeout lors de la connexion à la source',
                'Schéma de données incompatible',
                'Quota API dépassé',
                'Erreur d\'authentification auprès du fournisseur',
                'Disque temporaire saturé',
            ])
            : undefined,
        triggeredBy: pick(TRIGGERS),
    };
});

// ─── Public mock handlers ───────────────────────────────────

export const pipelineMock = {
    async fetchAll(): Promise<PipelineRun[]> {
        await delay(400, 800);
        return [...SEED].sort(
            (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
    },
};
