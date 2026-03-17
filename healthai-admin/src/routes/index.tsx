

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole, RedirectIfAuth } from './guards';
import AppLayout from '@/components/layout/AppLayout';
import LoadingScreen from '@/components/feedback/LoadingScreen';
import { DATA_ROLES, ANALYTICS_ROLES, PARTNER_ROLES, ADMIN_ROLES, AUDIT_ROLES } from '@/lib/nav.constants';
import { UserRole } from '@/types';


const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));

// Datas
const PipelinePage = lazy(() => import('@/features/data/PipelinePage'));
const DataQualityPage = lazy(() => import('@/features/data-quality/DataQualityPage'));
const AnomaliesPage = lazy(() => import('@/features/anomalies/AnomaliesPage'));
const ValidationPage = lazy(() => import('@/features/data/ValidationPage'));

// Analytics
const NutritionPage = lazy(() => import('@/features/analytics/NutritionPage'));
const FitnessPage = lazy(() => import('@/features/analytics/FitnessPage'));
const BiometricPage = lazy(() => import('@/features/analytics/BiometricPage'));
const BusinessPage = lazy(() => import('@/features/analytics/BusinessPage'));

// Parteners B2B
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

function Page({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const router = createBrowserRouter([
    // ── Auth (publique) ──────────────────────────────────────────────────
    {
        path: '/login',
        element: (
            <RedirectIfAuth>
                <Page><LoginPage /></Page>
            </RedirectIfAuth>
        ),
    },
    {
        path: '/403',
        element: <Page><ForbiddenPage /></Page>,
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
                element: <Page><DashboardPage /></Page>,
            },
            {
                path: 'data/pipeline',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        <Page><PipelinePage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'data/quality',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        <Page><DataQualityPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'data/anomalies',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        <Page><AnomaliesPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'data/validation',
                element: (
                    <RequireRole roles={[...DATA_ROLES]}>
                        <Page><ValidationPage /></Page>
                    </RequireRole>
                ),
            },

            { path: 'data-quality', element: <Navigate to="/data/quality" replace /> },
            { path: 'anomalies', element: <Navigate to="/data/anomalies" replace /> },
            { path: 'audit', element: <Navigate to="/admin/audit" replace /> },
            { path: 'nutrition', element: <Navigate to="/analytics/nutrition" replace /> },
            { path: 'fitness', element: <Navigate to="/analytics/fitness" replace /> },
            { path: 'biometric', element: <Navigate to="/analytics/biometric" replace /> },

            {
                path: 'analytics/nutrition',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        <Page><NutritionPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/fitness',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        <Page><FitnessPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/biometric',
                element: (
                    <RequireRole roles={[...ANALYTICS_ROLES]}>
                        <Page><BiometricPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'analytics/business',
                element: (
                    <RequireRole roles={[UserRole.ADMIN, UserRole.PREMIUM_PLUS, UserRole.B2B]}>
                        <Page><BusinessPage /></Page>
                    </RequireRole>
                ),
            },

            {
                path: 'partners',
                element: (
                    <RequireRole roles={[...PARTNER_ROLES]}>
                        <Page><PartnersPage /></Page>
                    </RequireRole>
                ),
            },

            {
                path: 'admin/users',
                element: (
                    <RequireRole roles={[...ADMIN_ROLES]}>
                        <Page><UsersPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'admin/audit',
                element: (
                    <RequireRole roles={[...AUDIT_ROLES]}>
                        <Page><AuditPage /></Page>
                    </RequireRole>
                ),
            },
            {
                path: 'admin/config',
                element: (
                    <RequireRole roles={[...ADMIN_ROLES]}>
                        <Page><ConfigPage /></Page>
                    </RequireRole>
                ),
            },

            {
                path: '*',
                element: <Page><NotFoundPage /></Page>,
            },
        ],
    },

    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
]);
