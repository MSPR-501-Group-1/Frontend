import { subDays, format } from 'date-fns';
import type { AnalyticsPageData, TimeSeriesPoint, CategoryDataPoint, BusinessKPI } from '@/types';

// ─── Helpers ────────────────────────────────────────────────

const today = new Date(2026, 1, 24); // Feb 24 2026

function generateTimeSeries(
    days: number,
    baseFn: (i: number) => number,
    target?: number,
): TimeSeriesPoint[] {
    return Array.from({ length: days }, (_, i) => {
        const date = subDays(today, days - 1 - i);
        return {
            date: format(date, 'yyyy-MM-dd'),
            value: Math.round(baseFn(i) * 10) / 10,
            ...(target !== undefined ? { target } : {}),
        };
    });
}

// ─── NUTRITION ──────────────────────────────────────────────

const nutritionKpis: BusinessKPI[] = [
    { id: 'cal-avg', label: 'Calories moy/jour', value: 2150, unit: 'kcal', trend: 3.2, status: 'success' },
    { id: 'protein-avg', label: 'Protéines moy', value: 95, unit: 'g', trend: 5.1, status: 'success' },
    { id: 'balance-score', label: 'Score équilibre', value: 78, unit: '%', target: 85, trend: 1.8, status: 'warning' },
    { id: 'hydration', label: 'Hydratation moy', value: 2.1, unit: 'L', trend: -2.3, status: 'warning' },
];

const nutritionTimeSeries = generateTimeSeries(
    90,
    (i) => 1900 + Math.sin(i / 7) * 250 + Math.random() * 200 + (i / 90) * 100,
    2200,
);

const nutritionBreakdown: CategoryDataPoint[] = [
    { name: 'Protéines', value: 25, color: '#2563EB' },
    { name: 'Glucides', value: 50, color: '#F59E0B' },
    { name: 'Lipides', value: 25, color: '#DC2626' },
];

const nutritionDistribution: CategoryDataPoint[] = [
    { name: 'Petit-déjeuner', value: 480, color: '#60A5FA' },
    { name: 'Déjeuner', value: 720, color: '#2563EB' },
    { name: 'Dîner', value: 650, color: '#1D4ED8' },
    { name: 'Snacks', value: 300, color: '#93C5FD' },
];

export const nutritionData: AnalyticsPageData = {
    kpis: nutritionKpis,
    timeSeries: nutritionTimeSeries,
    breakdown: nutritionBreakdown,
    distribution: nutritionDistribution,
};

// ─── FITNESS ────────────────────────────────────────────────

const fitnessKpis: BusinessKPI[] = [
    { id: 'sessions-week', label: 'Sessions / semaine', value: 4.2, trend: 8.5, status: 'success' },
    { id: 'avg-duration', label: 'Durée moyenne', value: 48, unit: 'min', trend: 3.1, status: 'success' },
    { id: 'cal-burned', label: 'Calories brûlées / sem.', value: 2800, unit: 'kcal', trend: 12.4, status: 'success' },
    { id: 'streak', label: 'Jours consécutifs', value: 14, trend: 40.0, status: 'success' },
];

const fitnessTimeSeries = generateTimeSeries(
    90,
    (i) => {
        // Weekend pattern: less activity on day 6,7 cycle
        const dayOfWeek = i % 7;
        const weekend = dayOfWeek >= 5 ? 0.6 : 1;
        return (30 + Math.sin(i / 5) * 15 + Math.random() * 20 + (i / 90) * 10) * weekend;
    },
    45,
);

const fitnessBreakdown: CategoryDataPoint[] = [
    { name: 'Cardio', value: 35, color: '#DC2626' },
    { name: 'Musculation', value: 30, color: '#2563EB' },
    { name: 'Flexibilité', value: 15, color: '#16A34A' },
    { name: 'HIIT', value: 20, color: '#F59E0B' },
];

const fitnessDistribution: CategoryDataPoint[] = [
    { name: 'Course', value: 420, color: '#DC2626' },
    { name: 'Vélo', value: 280, color: '#F59E0B' },
    { name: 'Natation', value: 190, color: '#2563EB' },
    { name: 'Yoga', value: 160, color: '#16A34A' },
    { name: 'Musculation', value: 350, color: '#7C3AED' },
    { name: 'Marche', value: 220, color: '#94A3B8' },
];

export const fitnessData: AnalyticsPageData = {
    kpis: fitnessKpis,
    timeSeries: fitnessTimeSeries,
    breakdown: fitnessBreakdown,
    distribution: fitnessDistribution,
};

// ─── BIOMETRIC ──────────────────────────────────────────────

const biometricKpis: BusinessKPI[] = [
    { id: 'weight', label: 'Poids actuel', value: 78.5, unit: 'kg', trend: -1.2, status: 'success' },
    { id: 'bmi', label: 'IMC', value: 24.3, status: 'success' },
    { id: 'resting-hr', label: 'FC repos', value: 62, unit: 'bpm', trend: -3.1, status: 'success' },
    { id: 'blood-pressure', label: 'Tension artérielle', value: '120/78', unit: 'mmHg', trend: -1.0, status: 'success' },
];

const biometricTimeSeries = generateTimeSeries(
    90,
    (i) => 81 - (i / 90) * 3 + (Math.random() - 0.5) * 0.6,
    75,
);

const biometricBreakdown: CategoryDataPoint[] = [
    { name: '<50 bpm', value: 5, color: '#2563EB' },
    { name: '50–60 bpm', value: 22, color: '#16A34A' },
    { name: '60–70 bpm', value: 45, color: '#F59E0B' },
    { name: '70–80 bpm', value: 20, color: '#DC2626' },
    { name: '>80 bpm', value: 8, color: '#7C3AED' },
];

const biometricDistribution: CategoryDataPoint[] = [
    { name: 'Sommeil léger', value: 45, color: '#93C5FD' },
    { name: 'Sommeil profond', value: 25, color: '#1D4ED8' },
    { name: 'REM', value: 20, color: '#7C3AED' },
    { name: 'Éveillé', value: 10, color: '#F59E0B' },
];

export const biometricData: AnalyticsPageData = {
    kpis: biometricKpis,
    timeSeries: biometricTimeSeries,
    breakdown: biometricBreakdown,
    distribution: biometricDistribution,
};
