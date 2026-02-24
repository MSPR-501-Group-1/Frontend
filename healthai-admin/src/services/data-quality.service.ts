import { format, subDays } from 'date-fns';
import type { DataQualityScore } from '@/types';

/** Simulates an API call to fetch data quality scores */
export async function fetchDataQualityScore(): Promise<DataQualityScore> {
    // Simulate network latency (300–800ms)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

    const today = new Date();

    return {
        overall: 87,
        dimensions: [
            {
                id: 'completeness',
                label: 'Complétude',
                score: 92,
                description: 'Proportion de champs requis renseignés',
                status: 'success',
            },
            {
                id: 'consistency',
                label: 'Cohérence',
                score: 85,
                description: 'Concordance entre sources de données',
                status: 'warning',
            },
            {
                id: 'freshness',
                label: 'Fraîcheur',
                score: 78,
                description: 'Données mises à jour dans les délais attendus',
                status: 'warning',
            },
            {
                id: 'accuracy',
                label: 'Exactitude',
                score: 94,
                description: 'Valeurs respectant les plages attendues',
                status: 'success',
            },
            {
                id: 'uniqueness',
                label: 'Unicité',
                score: 88,
                description: 'Absence de doublons dans les jeux de données',
                status: 'success',
            },
        ],
        history: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(today, 29 - i), 'yyyy-MM-dd'),
            value: Math.round(82 + Math.random() * 10),
            target: 90,
        })),
    };
}
