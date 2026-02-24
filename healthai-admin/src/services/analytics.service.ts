/**
 * Analytics service — fetches domain-specific analytics data.
 *
 * Provides one function per domain (nutrition, fitness, biometric).
 * Each returns an AnalyticsPageData object ready for AnalyticsPageLayout.
 */

import { apiClient } from '@/api';
import type { AnalyticsPageData } from '@/types';
import { nutritionData, fitnessData, biometricData } from '@/mocks/analytics';

const USE_MOCK = true;

/** Fetch nutrition analytics. */
export async function fetchNutritionData(): Promise<AnalyticsPageData> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
        return nutritionData;
    }
    return apiClient.get<AnalyticsPageData>('/analytics/nutrition');
}

/** Fetch fitness analytics. */
export async function fetchFitnessData(): Promise<AnalyticsPageData> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
        return fitnessData;
    }
    return apiClient.get<AnalyticsPageData>('/analytics/fitness');
}

/** Fetch biometric analytics. */
export async function fetchBiometricData(): Promise<AnalyticsPageData> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
        return biometricData;
    }
    return apiClient.get<AnalyticsPageData>('/analytics/biometric');
}
