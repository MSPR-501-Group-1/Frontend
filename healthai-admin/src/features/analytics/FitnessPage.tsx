import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchFitnessData } from '@/services/analytics.service';

export default function FitnessPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics', 'fitness'],
        queryFn: fetchFitnessData,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données fitness." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Fitness"
            subtitle="Suivi de l'activité physique — sessions, durées, calories brûlées et types d'exercice"
            data={data}
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
