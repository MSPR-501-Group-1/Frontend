import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchFitnessData } from '@/services/analytics.service';
import type { DateRange } from '@/types';

export default function FitnessPage() {
    const [range, setRange] = useState<DateRange>('30d');

    const { data, isLoading, isError } = useQuery<import('@/types').AnalyticsPageData, Error>({
        queryKey: ['analytics', 'fitness', range],
        queryFn: () => fetchFitnessData(range),
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données fitness." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Fitness"
            subtitle="Suivi de l'activité physique — sessions, durées et types d'exercice"
            data={data}
            onRangeChange={(r: DateRange) => setRange(r)}
            chartConfig={{
                label: "Minutes d'activité par jour",
                color: '#1162b8ff',
                yAxisUnit: 'min',
            }}
            breakdownTitle="Répartition par type d'activité"
        />
    );
}
