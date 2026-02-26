/**
 * Isolated mock data for the Business KPIs page.
 *
 * Generates direction-level engagement and retention metrics.
 * Will be deleted once the real backend is integrated.
 */

import type { BusinessPageData } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Dataset ────────────────────────────────────────────────

const data: BusinessPageData = {
    kpis: [
        {
            id: 'dau',
            label: 'Utilisateurs actifs / jour',
            value: 3_842,
            trend: 12.4,
            status: 'success',
        },
        {
            id: 'mau',
            label: 'Utilisateurs actifs / mois',
            value: 12_847,
            trend: 8.3,
            status: 'success',
        },
        {
            id: 'retention-30',
            label: 'Rétention J+30',
            value: 64,
            unit: '%',
            target: 70,
            trend: -2.1,
            status: 'warning',
        },
        {
            id: 'engagement',
            label: 'Taux d\'engagement',
            value: 78,
            unit: '%',
            target: 80,
            trend: 5.6,
            status: 'success',
        },
        {
            id: 'nps',
            label: 'NPS',
            value: 42,
            trend: 3.0,
            status: 'success',
        },
        {
            id: 'churn',
            label: 'Taux de churn',
            value: 4.2,
            unit: '%',
            target: 3,
            trend: -0.8,
            status: 'warning',
        },
    ],

    // DAU trend over 30 days
    engagementTrend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(2026, 1, i + 1);
        const base = 3_500 + Math.sin(i / 5) * 500;
        return {
            date: date.toISOString().slice(0, 10),
            value: Math.round(base + Math.random() * 300),
            target: 4_000,
        };
    }),

    // Retention by cohort month
    retentionCohorts: [
        { name: 'Oct 2025', value: 72, color: '#2563EB' },
        { name: 'Nov 2025', value: 68, color: '#7C3AED' },
        { name: 'Déc 2025', value: 65, color: '#16A34A' },
        { name: 'Jan 2026', value: 64, color: '#F59E0B' },
        { name: 'Fév 2026', value: 61, color: '#DC2626' },
    ],

    // Feature adoption rates
    featureAdoption: [
        { name: 'Suivi nutrition', value: 85, color: '#2563EB' },
        { name: 'Activité physique', value: 72, color: '#7C3AED' },
        { name: 'Biométrique', value: 58, color: '#16A34A' },
        { name: 'Coaching IA', value: 45, color: '#F59E0B' },
        { name: 'Objectifs', value: 38, color: '#DC2626' },
    ],

    // Revenue vs target by month
    revenueVsTarget: [
        { date: 'Oct', actual: 42_000, target: 40_000 },
        { date: 'Nov', actual: 45_500, target: 43_000 },
        { date: 'Déc', actual: 38_000, target: 45_000 },
        { date: 'Jan', actual: 48_200, target: 47_000 },
        { date: 'Fév', actual: 51_000, target: 50_000 },
    ],
};

// ─── Public mock handler ────────────────────────────────────

export const businessMock = {
    async fetch(): Promise<BusinessPageData> {
        await delay(300, 600);
        return data;
    },
};
