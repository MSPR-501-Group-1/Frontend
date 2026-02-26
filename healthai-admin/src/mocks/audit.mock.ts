/**
 * Isolated mock data for the Audit Logs domain.
 *
 * Generates realistic admin-platform audit entries.
 * Will be deleted once the real backend is integrated.
 */

import { format, subHours } from 'date-fns';
import type { AuditLog, AuditAction } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

const USERS = [
    'admin@healthai.fr',
    'data@healthai.fr',
    'po@healthai.fr',
    'direction@healthai.fr',
    'partner@healthai.fr',
];

const ACTIONS: AuditAction[] = [
    'login', 'logout', 'create_user', 'update_role',
    'correct_anomaly', 'approve_batch', 'reject_batch',
    'export_data', 'update_config', 'delete_record',
];

const IPS = [
    '192.168.1.42', '10.0.0.15', '172.16.0.100',
    '192.168.1.87', '10.0.0.23', '172.16.0.55',
];

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

function detailForAction(action: AuditAction, user: string): { detail: string; target?: string } {
    const map: Record<AuditAction, () => { detail: string; target?: string }> = {
        login: () => ({ detail: `Connexion réussie depuis ${pick(IPS)}` }),
        logout: () => ({ detail: 'Déconnexion manuelle' }),
        create_user: () => ({
            detail: `Création du compte test-${Math.floor(Math.random() * 100)}@healthai.fr`,
            target: 'users',
        }),
        update_role: () => ({
            detail: `Rôle mis à jour : data_engineer → admin`,
            target: `user:${user}`,
        }),
        correct_anomaly: () => ({
            detail: `Anomalie ANO-${String(Math.floor(Math.random() * 28) + 1).padStart(4, '0')} corrigée`,
            target: 'anomalies',
        }),
        approve_batch: () => ({
            detail: `Batch ETL #${Math.floor(Math.random() * 500) + 100} approuvé`,
            target: 'pipeline',
        }),
        reject_batch: () => ({
            detail: `Batch ETL #${Math.floor(Math.random() * 500) + 100} rejeté — données incohérentes`,
            target: 'pipeline',
        }),
        export_data: () => ({
            detail: `Export CSV des anomalies (28 lignes)`,
            target: 'export',
        }),
        update_config: () => ({
            detail: `Seuil d'alerte qualité modifié : 85% → 90%`,
            target: 'config',
        }),
        delete_record: () => ({
            detail: `Suppression de l'enregistrement doublon #${Math.floor(Math.random() * 10000)}`,
            target: 'records',
        }),
    };
    return map[action]();
}

// ─── Seed dataset ───────────────────────────────────────────

const now = new Date();

const SEED: AuditLog[] = Array.from({ length: 50 }, (_, i) => {
    const action = pick(ACTIONS);
    const user = pick(USERS);
    const { detail, target } = detailForAction(action, user);

    return {
        id: `LOG-${String(i + 1).padStart(4, '0')}`,
        timestamp: format(subHours(now, Math.floor(Math.random() * 720)), "yyyy-MM-dd'T'HH:mm:ss"),
        user,
        action,
        target,
        detail,
        ip: pick(IPS),
    };
});

// ─── Public mock handlers ───────────────────────────────────

export const auditMock = {
    async fetchAll(): Promise<AuditLog[]> {
        await delay(400, 800);
        return [...SEED].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
    },
};
