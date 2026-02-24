import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types';

interface Props {
    children: React.ReactNode;
}

/** Redirects to /login if not authenticated */
export function RequireAuth({ children }: Props) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

    if (!user || !roles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
}

/** Redirects authenticated users away from login */
export function RedirectIfAuth({ children }: Props) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
