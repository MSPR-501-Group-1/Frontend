import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, RequireRole, RedirectIfAuth } from './guards';
import { UserRole } from '@/types';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import AnomaliesPage from '@/features/anomalies/AnomaliesPage';
import DataQualityPage from '@/features/data-quality/DataQualityPage';
import NutritionPage from '@/features/analytics/NutritionPage';
import FitnessPage from '@/features/analytics/FitnessPage';
import BiometricPage from '@/features/analytics/BiometricPage';
import AuditPage from '@/features/admin/AuditPage';
import ForbiddenPage from '@/features/errors/ForbiddenPage';
import NotFoundPage from '@/features/errors/NotFoundPage';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <RedirectIfAuth>
                <LoginPage />
            </RedirectIfAuth>
        ),
    },
    {
        path: '/403',
        element: <ForbiddenPage />,
    },
    {
        path: '/',
        element: (
            <RequireAuth>
                <AppLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'data-quality', element: <DataQualityPage /> },
            { path: 'anomalies', element: <AnomaliesPage /> },
            { path: 'nutrition', element: <NutritionPage /> },
            { path: 'fitness', element: <FitnessPage /> },
            { path: 'biometric', element: <BiometricPage /> },
            {
                path: 'audit',
                element: (
                    <RequireRole roles={[UserRole.ADMIN]}>
                        <AuditPage />
                    </RequireRole>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
