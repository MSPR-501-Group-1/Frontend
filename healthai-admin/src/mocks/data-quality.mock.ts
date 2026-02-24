/**
 * Isolated mock data for the Data Quality domain.
 * Removable once the backend is integrated.
 */

import { format, subDays } from 'date-fns';
import type { DataQualityScore } from '@/types';

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

export const dataQualityMock = {
    async fetchScore(): Promise<DataQualityScore> {
        await delay(300, 800);

        const today = new Date();

        return {
            overall: 87,
            dimensions: [
                { id: 'completeness', label: 'Complétude', score: 92, description: 'Proportion de champs requis renseignés', status: 'success' },
                { id: 'consistency', label: 'Cohérence', score: 85, description: 'Concordance entre sources de données', status: 'warning' },
                { id: 'freshness', label: 'Fraîcheur', score: 78, description: 'Données mises à jour dans les délais attendus', status: 'warning' },
                { id: 'accuracy', label: 'Exactitude', score: 94, description: 'Valeurs respectant les plages attendues', status: 'success' },
                { id: 'uniqueness', label: 'Unicité', score: 88, description: 'Absence de doublons dans les jeux de données', status: 'success' },
            ],
            history: Array.from({ length: 30 }, (_, i) => ({
                date: format(subDays(today, 29 - i), 'yyyy-MM-dd'),
                value: Math.round(82 + Math.random() * 10),
                target: 90,
            })),
        };
    },
};
