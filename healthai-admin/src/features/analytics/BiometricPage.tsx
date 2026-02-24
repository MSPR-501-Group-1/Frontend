import AnalyticsPageLayout from '@/components/analytics/AnalyticsPageLayout';
import { biometricData } from '@/mocks/analytics';

export default function BiometricPage() {
    return (
        <AnalyticsPageLayout
            title="Biométrique"
            subtitle="Suivi des données biométriques — poids, IMC, fréquence cardiaque et sommeil"
            data={biometricData}
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
