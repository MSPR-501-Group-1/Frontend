import type { DashboardData } from '@/types';

/**
 * Mock data for the main Dashboard.
 * Realistic health-platform values — will be replaced by API calls later.
 */
export const dashboardData: DashboardData = {
    // ── KPI Cards ────────────────────────────────────────────
    kpis: [
        {
            id: 'active-users',
            label: 'Utilisateurs actifs',
            value: 12_847,
            trend: 8.3,
            status: 'success',
        },
        {
            id: 'data-quality',
            label: 'Score qualité données',
            value: 87,
            unit: '%',
            target: 90,
            trend: 2.1,
            status: 'warning',
        },
        {
            id: 'anomalies-open',
            label: 'Anomalies ouvertes',
            value: 23,
            trend: -12.5,
            status: 'error',
        },
        {
            id: 'records-day',
            label: 'Enregistrements / jour',
            value: '45.2K',
            trend: 15.7,
            status: 'success',
        },
        {
            id: 'etl-success',
            label: 'Taux ETL succès',
            value: 98.5,
            unit: '%',
            target: 99,
            trend: 0.5,
            status: 'success',
        },
        {
            id: 'avg-response',
            label: 'Temps de réponse moyen',
            value: '142ms',
            trend: -5.2,
            status: 'success',
        },
    ],

    // ── Line chart: user activity over 30 days ──────────────
    userActivity: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(2026, 1, i + 1);
        const base = 11_000 + Math.sin(i / 4) * 2000;
        return {
            date: date.toISOString().slice(0, 10),
            value: Math.round(base + Math.random() * 500),
            target: 12_000,
        };
    }),

    // ── Line chart: data quality trend over 30 days ─────────
    dataQualityTrend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(2026, 1, i + 1);
        const base = 82 + (i / 30) * 6;
        return {
            date: date.toISOString().slice(0, 10),
            value: Math.round((base + (Math.random() - 0.5) * 3) * 10) / 10,
            target: 90,
        };
    }),

    // ── Pie chart: data sources breakdown ────────────────────
    dataSources: [
        { name: 'Nutrition', value: 35, color: '#2563EB' },
        { name: 'Fitness', value: 28, color: '#7C3AED' },
        { name: 'Biométrique', value: 22, color: '#16A34A' },
        { name: 'Sommeil', value: 10, color: '#F59E0B' },
        { name: 'Bien-être', value: 5, color: '#DC2626' },
    ],

    // ── Bar chart: anomalies by type ─────────────────────────
    anomaliesByType: [
        { name: 'Valeur hors plage', value: 42, color: '#DC2626' },
        { name: 'Donnée manquante', value: 31, color: '#F59E0B' },
        { name: 'Doublon', value: 18, color: '#7C3AED' },
        { name: 'Format invalide', value: 12, color: '#2563EB' },
        { name: 'Incohérence', value: 8, color: '#16A34A' },
    ],
};
