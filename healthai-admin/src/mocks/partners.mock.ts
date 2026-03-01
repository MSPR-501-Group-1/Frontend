/**
 * Mock data & fake handlers for the Partners B2B domain.
 *
 * Pattern identique à anomalies.mock.ts :
 * - Dataset réaliste avec noms français
 * - fetchAll() avec latence simulée
 * - Fichier isolé du service (SRP)
 */

import { format, subDays, subMonths } from 'date-fns';
import type { Partner, PartnerDashboardData, CategoryDataPoint, TimeSeriesPoint } from '@/types';

// ─── Helpers (DRY: réutilisés dans tout le fichier) ─────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Partner dataset ────────────────────────────────────────

const now = new Date();

const PARTNERS: Partner[] = [
    {
        id: 'p-001',
        name: 'FitClub Lyon',
        type: 'gym',
        status: 'active',
        contractStart: '2025-03-01',
        contractEnd: '2026-03-01',
        usersCount: 2_340,
        apiCallsMonth: 184_500,
        lastActivity: format(subDays(now, 1), 'yyyy-MM-dd'),
        satisfactionScore: 92,
    },
    {
        id: 'p-002',
        name: 'AXA Prévoyance',
        type: 'insurance',
        status: 'active',
        contractStart: '2025-01-15',
        contractEnd: '2027-01-15',
        usersCount: 8_750,
        apiCallsMonth: 523_000,
        lastActivity: format(subDays(now, 0), 'yyyy-MM-dd'),
        satisfactionScore: 88,
    },
    {
        id: 'p-003',
        name: 'MutualSanté',
        type: 'mutual',
        status: 'active',
        contractStart: '2025-06-01',
        contractEnd: '2026-06-01',
        usersCount: 5_420,
        apiCallsMonth: 312_000,
        lastActivity: format(subDays(now, 2), 'yyyy-MM-dd'),
        satisfactionScore: 85,
    },
    {
        id: 'p-004',
        name: 'Wellness Corp',
        type: 'corporate_wellness',
        status: 'active',
        contractStart: '2025-09-01',
        contractEnd: '2026-09-01',
        usersCount: 1_200,
        apiCallsMonth: 67_800,
        lastActivity: format(subDays(now, 3), 'yyyy-MM-dd'),
        satisfactionScore: 91,
    },
    {
        id: 'p-005',
        name: 'SportPlus Paris',
        type: 'gym',
        status: 'trial',
        contractStart: '2026-01-10',
        contractEnd: '2026-04-10',
        usersCount: 580,
        apiCallsMonth: 34_200,
        lastActivity: format(subDays(now, 1), 'yyyy-MM-dd'),
        satisfactionScore: 78,
    },
    {
        id: 'p-006',
        name: 'Allianz Santé',
        type: 'insurance',
        status: 'active',
        contractStart: '2025-04-01',
        contractEnd: '2027-04-01',
        usersCount: 12_600,
        apiCallsMonth: 745_000,
        lastActivity: format(subDays(now, 0), 'yyyy-MM-dd'),
        satisfactionScore: 94,
    },
    {
        id: 'p-007',
        name: 'Harmonie Mutuelle',
        type: 'mutual',
        status: 'suspended',
        contractStart: '2025-02-15',
        contractEnd: '2026-02-15',
        usersCount: 3_100,
        apiCallsMonth: 0,
        lastActivity: format(subDays(now, 45), 'yyyy-MM-dd'),
        satisfactionScore: 62,
    },
    {
        id: 'p-008',
        name: 'VitalFit Bordeaux',
        type: 'gym',
        status: 'churned',
        contractStart: '2024-11-01',
        contractEnd: '2025-11-01',
        usersCount: 0,
        apiCallsMonth: 0,
        lastActivity: format(subDays(now, 120), 'yyyy-MM-dd'),
        satisfactionScore: 45,
    },
    {
        id: 'p-009',
        name: 'MAIF Prévention',
        type: 'insurance',
        status: 'active',
        contractStart: '2025-07-01',
        contractEnd: '2027-07-01',
        usersCount: 6_800,
        apiCallsMonth: 398_000,
        lastActivity: format(subDays(now, 1), 'yyyy-MM-dd'),
        satisfactionScore: 90,
    },
    {
        id: 'p-010',
        name: 'Zenith Bien-être',
        type: 'corporate_wellness',
        status: 'trial',
        contractStart: '2026-02-01',
        contractEnd: '2026-05-01',
        usersCount: 450,
        apiCallsMonth: 21_500,
        lastActivity: format(subDays(now, 4), 'yyyy-MM-dd'),
        satisfactionScore: 80,
    },
];

// ─── Aggregated data ────────────────────────────────────────

const usageByPartner: CategoryDataPoint[] = PARTNERS
    .filter((p) => p.apiCallsMonth > 0)
    .sort((a, b) => b.apiCallsMonth - a.apiCallsMonth)
    .map((p) => ({ name: p.name, value: p.apiCallsMonth }));

const TYPE_COLORS: Record<string, string> = {
    gym: '#7C3AED',
    insurance: '#2563EB',
    mutual: '#16A34A',
    corporate_wellness: '#F59E0B',
};

const partnerTypesBreakdown: CategoryDataPoint[] = (() => {
    const counts: Record<string, number> = {};
    for (const p of PARTNERS) {
        counts[p.type] = (counts[p.type] || 0) + 1;
    }
    const labels: Record<string, string> = {
        gym: 'Salles de sport',
        insurance: 'Assurances',
        mutual: 'Mutuelles',
        corporate_wellness: 'Bien-être entreprise',
    };
    return Object.entries(counts).map(([type, count]) => ({
        name: labels[type] || type,
        value: count,
        color: TYPE_COLORS[type],
    }));
})();

const monthlyApiCalls: TimeSeriesPoint[] = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(now, 11 - i);
    const base = 1_200_000 + i * 150_000;
    return {
        date: format(date, 'yyyy-MM-dd'),
        value: Math.round(base + (Math.random() - 0.3) * 200_000),
    };
});

// ─── Public mock API ────────────────────────────────────────

export const partnersMock = {
    async fetchAll(): Promise<Partner[]> {
        await delay(200, 500);
        return [...PARTNERS];
    },

    async fetchDashboard(): Promise<PartnerDashboardData> {
        await delay(300, 600);
        return {
            partners: [...PARTNERS],
            usageByPartner,
            partnerTypesBreakdown,
            monthlyApiCalls,
        };
    },
};
