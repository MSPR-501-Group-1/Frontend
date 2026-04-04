import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { LoadingState, ErrorState } from '@/components/feedback';
import { fetchBiometricData } from '@/services/analytics.service';
import type { AnalyticsPageData, DateRange } from '@/types';

export default function BiometricPage() {
    const [range, setRange] = useState<DateRange>('all');

    const { data, isLoading, isError } = useQuery<AnalyticsPageData, Error>({
        queryKey: ['analytics', 'biometric', range],
        queryFn: () => fetchBiometricData(range),
    });

    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState message="Erreur lors du chargement des données biométriques." />;
    if (!data) return null;

    return (
        <AnalyticsPageLayout
            title="Biométrique"
            subtitle="Suivi des données biométriques - poids, IMC, fréquence cardiaque et sommeil"
            data={data}
            onRangeChange={(r: DateRange) => setRange(r)}
            chartConfig={{
                label: 'Evolution du poids',
                color: '#7C3AED',
                yAxisUnit: 'kg',
            }}
            breakdownTitle="Distribution fréquence cardiaque au repos"
        />
    );
}