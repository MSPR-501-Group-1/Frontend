import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchNutritionData } from '@/services/analytics.service';
import type { AnalyticsPageData, DateRange } from '@/types';

export default function NutritionPage() {
    const [range, setRange] = useState<DateRange>('all');

    const { data, isLoading, isError } = useQuery<AnalyticsPageData, Error>({
        queryKey: ['analytics', 'nutrition', range],
        queryFn: () => fetchNutritionData(range),
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données nutrition." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Nutrition"
            subtitle="Suivi nutritionnel des utilisateurs - calories, macronutriments et habitudes alimentaires"
            data={data}
            onRangeChange={(r: DateRange) => setRange(r)}
            chartConfig={{
                label: 'Evolution des calories',
                color: '#F59E0B',
                yAxisUnit: 'kcal',
            }}
            breakdownTitle="Repartition macronutriments"
        />
    );
}