import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchNutritionData } from '@/services/analytics.service';

export default function NutritionPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics', 'nutrition'],
        queryFn: fetchNutritionData,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données nutrition." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Nutrition"
            subtitle="Suivi nutritionnel des utilisateurs — calories, macronutriments et habitudes alimentaires"
            data={data}
            chartConfig={{
                label: 'Évolution des calories',
                color: '#F59E0B',
                yAxisUnit: 'kcal',
            }}
            breakdownTitle="Répartition macronutriments"
            distributionTitle="Calories par repas"
        />
    );
}
