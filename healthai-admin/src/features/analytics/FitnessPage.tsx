import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { fitnessData } from '@/mocks/analytics';

export default function FitnessPage() {
    return (
        <AnalyticsPageLayout
            title="Fitness"
            subtitle="Suivi de l'activité physique — sessions, durées, calories brûlées et types d'exercice"
            data={fitnessData}
            chartConfig={{
                label: "Minutes d'activité par jour",
                color: '#DC2626',
                yAxisUnit: 'min',
            }}
            breakdownTitle="Répartition par type d'activité"
            distributionTitle="Calories brûlées par sport"
        />
    );
}
