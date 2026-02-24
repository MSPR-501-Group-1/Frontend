import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, RequireRole, RedirectIfAuth } from './guards';
import { UserRole } from '@/types';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import AnomaliesPage from '@/features/anomalies/AnomaliesPage';
import NutritionPage from '@/features/analytics/NutritionPage';
import AuditPage from '@/features/admin/AuditPage';
import ForbiddenPage from '@/features/errors/ForbiddenPage';

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
            { path: 'anomalies', element: <AnomaliesPage /> },
            { path: 'nutrition', element: <NutritionPage /> },
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
        element: (
            <div style={{ padding: 32, textAlign: 'center' }}>
                <h1>404</h1>
                <p>Page introuvable</p>
            </div>
        ),
    },
]);
