

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole, RedirectIfAuth } from './guards';
import AppLayout from '@/components/layout/AppLayout';
import LoadingScreen from '@/components/feedback/LoadingScreen';
import {
    DATA_ROLES,
    ANALYTICS_ROLES,
    ANALYTICS_BUSINESS_ROLES,
    PARTNER_ROLES,
    ADMIN_ROLES,
    AUDIT_ROLES,
} from '@/lib/nav.constants';


const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));

// Datas
const PipelinePage = lazy(() => import('@/features/data/PipelinePage'));
const AnomaliesPage = lazy(() => import('@/features/anomalies/AnomaliesPage'));
const DataQualityPage = lazy(() => import('@/features/data-quality/DataQualityPage'));

// Analytics
const NutritionPage = lazy(() => import('@/features/analytics/NutritionPage'));
const FitnessPage = lazy(() => import('@/features/analytics/FitnessPage'));
const BiometricPage = lazy(() => import('@/features/analytics/BiometricPage'));
const BusinessPage = lazy(() => import('@/features/analytics/BusinessPage'));

// Partners B2B
const PartnersPage = lazy(() => import('@/features/partners/PartnersPage'));

// Administration
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));
const AuditPage = lazy(() => import('@/features/admin/AuditPage'));
const ConfigPage = lazy(() => import('@/features/admin/ConfigPage'));

// Errors
const ForbiddenPage = lazy(() => import('@/features/errors/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'));

// ---------------------------------------------------------------------------
// Suspense wrapper
// ---------------------------------------------------------------------------

const withPageLoader = (element: React.ReactNode) => (
    <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
);

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const router = createBrowserRouter([
    // ── Auth (publique) ──────────────────────────────────────────────────
    {
        path: '/login',
        element: (
            <RedirectIfAuth>
                {withPageLoader(<LoginPage />)}
            </RedirectIfAuth>
        ),
    },
    {
        path: '/403',
        element: withPageLoader(<ForbiddenPage />),
    },
    {
        path: '/',
        element: (
            <RequireAuth>
                <AppLayout />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: withPageLoader(<DashboardPage />),
            },
            {
                path: 'data/pipeline',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        {withPageLoader(<PipelinePage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'data/anomalies',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        {withPageLoader(<AnomaliesPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'data/quality',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        {withPageLoader(<DataQualityPage />)}
                    </RequireRole>
                ),
            },

            { path: 'anomalies', element: <Navigate to="/data/anomalies" replace /> },
            { path: 'audit', element: <Navigate to="/admin/audit" replace /> },
            { path: 'nutrition', element: <Navigate to="/analytics/nutrition" replace /> },
            { path: 'fitness', element: <Navigate to="/analytics/fitness" replace /> },
            { path: 'biometric', element: <Navigate to="/analytics/biometric" replace /> },

            {
                path: 'analytics/nutrition',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        {withPageLoader(<NutritionPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/fitness',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        {withPageLoader(<FitnessPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/biometric',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        {withPageLoader(<BiometricPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/business',
                element: (
                    <RequireRole roles={[...ANALYTICS_BUSINESS_ROLES]}>
                        {withPageLoader(<BusinessPage />)}
                    </RequireRole>
                ),
            },

            {
                path: 'partners',
                element: (
                    <RequireRole roles={[...PARTNER_ROLES]}>
                        {withPageLoader(<PartnersPage />)}
                    </RequireRole>
                ),
            },

            {
                path: 'admin/users',
                element: (
                    <RequireRole roles={[...ADMIN_ROLES]}>
                        {withPageLoader(<UsersPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'admin/audit',
                element: (
                    <RequireRole roles={[...AUDIT_ROLES]}>
                        {withPageLoader(<AuditPage />)}
                    </RequireRole>
                ),
            },
            {
                path: 'admin/config',
                element: (
                    <RequireRole roles={[...ADMIN_ROLES]}>
                        {withPageLoader(<ConfigPage />)}
                    </RequireRole>
                ),
            },

            {
                path: '*',
                element: withPageLoader(<NotFoundPage />),
            },
        ],
    },

    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
]);
