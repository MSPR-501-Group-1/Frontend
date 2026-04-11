import type { DashboardData } from '@/types';

/**
 * Deprecated Dashboard mock.
 *
 * The dashboard now consumes only /dashboard (real API).
 * This payload stays intentionally neutral to avoid displaying synthetic KPIs
 * if someone wires this file again in local experiments.
 */
export const dashboardData: DashboardData = {
    kpis: [
        {
            id: 'dashboard-unavailable',
            label: 'Dashboard mock desactive',
            value: 'Non disponible',
            description: 'Utiliser uniquement le endpoint /dashboard pour des donnees calculables depuis SQL.',
            status: 'warning',
        },
    ],
    userActivity: [],
    dataQualityTrend: [],
    dataSources: [],
    anomaliesByType: [],
    dataIngestion: [],
    anomalyTrend: [],
};
