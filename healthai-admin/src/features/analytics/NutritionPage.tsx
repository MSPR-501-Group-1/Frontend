import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { nutritionData } from '@/mocks/analytics';

export default function NutritionPage() {
    return (
        <AnalyticsPageLayout
            title="Nutrition"
            subtitle="Suivi nutritionnel des utilisateurs — calories, macronutriments et habitudes alimentaires"
            data={nutritionData}
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
