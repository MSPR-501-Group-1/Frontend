import { UserRole } from '@/types';

// ---------------------------------------------------------------------------
// Role shortcuts
// ---------------------------------------------------------------------------

export const ALL_ROLES = Object.values(UserRole) as UserRole[];
export const DATA_ROLES = [UserRole.ADMIN, UserRole.PREMIUM_PLUS] as const;
export const ANALYTICS_ROLES = [UserRole.ADMIN, UserRole.PREMIUM, UserRole.PREMIUM_PLUS, UserRole.B2B] as const;
export const PARTNER_ROLES = [UserRole.ADMIN, UserRole.B2B] as const;
export const ADMIN_ROLES = [UserRole.ADMIN] as const;
export const AUDIT_ROLES = [UserRole.ADMIN, UserRole.PREMIUM_PLUS] as const;

// ---------------------------------------------------------------------------
// Nav item types
// ---------------------------------------------------------------------------

export interface NavLeaf {
    key: string;
    label: string;
    path: string;
    roles?: readonly UserRole[];
}

export interface NavSection {
    key: string;
    label: string;
    icon: string;
    roles?: readonly UserRole[];
}

export interface NavLeafSection extends NavSection {
    path: string;
}

export interface NavGroupSection extends NavSection {
    children: NavLeaf[];
}

export type NavItem = NavLeafSection | NavGroupSection;

export const NAV_SECTIONS: NavItem[] = [
    {
        key: 'dashboard',
        label: 'Tableau de bord',
        icon: 'Dashboard',
        path: '/',
    } satisfies NavLeafSection,

    {
        key: 'data',
        label: 'Données',
        icon: 'Storage',
        roles: DATA_ROLES,
        children: [
            {
                key: 'pipeline',
                label: 'Pipeline ETL',
                path: '/data/pipeline',
                roles: DATA_ROLES,
            },
            {
                key: 'quality',
                label: 'Qualité des données',
                path: '/data/quality',
                roles: DATA_ROLES,
            },
            {
                key: 'anomalies',
                label: 'Anomalies',
                path: '/data/anomalies',
                roles: DATA_ROLES,
            },
            {
                key: 'validation',
                label: 'Validation',
                path: '/data/validation',
                roles: DATA_ROLES,
            },
        ],
    } satisfies NavGroupSection,

    {
        key: 'analytics',
        label: 'Analytics',
        icon: 'BarChart',
        roles: ADMIN_ROLES,
        children: [
            {
                key: 'nutrition',
                label: 'Nutrition',
                path: '/analytics/nutrition',
                roles: ANALYTICS_ROLES,
            },
            {
                key: 'fitness',
                label: 'Activité physique',
                path: '/analytics/fitness',
                roles: ANALYTICS_ROLES,
            },
            {
                key: 'biometric',
                label: 'Biométrique',
                path: '/analytics/biometric',
                roles: ANALYTICS_ROLES,
            },
            {
                key: 'business',
                label: 'KPIs Business',
                path: '/analytics/business',
                roles: [UserRole.ADMIN, UserRole.PREMIUM_PLUS, UserRole.B2B],
            },
        ],
    } satisfies NavGroupSection,

    {
        key: 'partners',
        label: 'Partenaires B2B',
        icon: 'Business',
        path: '/partners',
        roles: PARTNER_ROLES,
    } satisfies NavLeafSection,

    {
        key: 'admin',
        label: 'Administration',
        icon: 'AdminPanelSettings',
        roles: AUDIT_ROLES,
        children: [
            {
                key: 'users',
                label: 'Utilisateurs & Rôles',
                path: '/admin/users',
                roles: ADMIN_ROLES,
            },
            {
                key: 'audit',
                label: 'Audit & Logs',
                path: '/admin/audit',
                roles: AUDIT_ROLES,
            },
            {
                key: 'config',
                label: 'Configuration',
                path: '/admin/config',
                roles: ADMIN_ROLES,
            },
        ],
    } satisfies NavGroupSection,
];

export function isRoleAllowed(
    userRole: UserRole,
    allowedRoles?: readonly UserRole[],
): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return (allowedRoles as UserRole[]).includes(userRole);
}
