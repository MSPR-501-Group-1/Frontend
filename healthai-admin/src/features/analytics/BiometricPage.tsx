import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchBiometricData } from '@/services/analytics.service';

export default function BiometricPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics', 'biometric'],
        queryFn: fetchBiometricData,
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données biométriques." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Biométrique"
            subtitle="Suivi des données biométriques — poids, IMC, fréquence cardiaque et sommeil"
            data={data}
            chartConfig={{
                label: 'Évolution du poids',
                color: '#7C3AED',
                yAxisUnit: 'kg',
            }}
            breakdownTitle="Distribution fréquence cardiaque au repos"
            distributionTitle="Phases de sommeil"
        />
    );
}
