import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import LoadingScreen from '@/components/feedback/LoadingScreen';
import type { UserRole } from '@/types';

interface Props {
    children: React.ReactNode;
}

function useAuthHydrated(): boolean {
    const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

    useEffect(() => {
        const unsubHydrate = useAuthStore.persist.onHydrate(() => setHydrated(false));
        const unsubFinish = useAuthStore.persist.onFinishHydration(() => setHydrated(true));

        setHydrated(useAuthStore.persist.hasHydrated());

        return () => {
            unsubHydrate();
            unsubFinish();
        };
    }, []);

    return hydrated;
}

/** Redirects to /login if not authenticated */
export function RequireAuth({ children }: Props) {
    const hydrated = useAuthHydrated();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (!hydrated) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

interface RequireRoleProps extends Props {
    roles: UserRole[];
}

/** Redirects to /403 if user role is not in allowed roles */
export function RequireRole({ children, roles }: RequireRoleProps) {
    const user = useAuthStore((s) => s.user);

    if (!user || !roles.includes(user.role_type)) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
}

/** Redirects authenticated users away from login */
export function RedirectIfAuth({ children }: Props) {
    const hydrated = useAuthHydrated();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (!hydrated) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
