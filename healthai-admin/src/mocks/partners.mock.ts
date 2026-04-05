/**
 * Mock data for Partners B2B.
 *
 * Kept only for local testing. Contract mirrors the strict DB-backed fields.
 */

import { format, subDays, subMonths } from 'date-fns';
import type { Partner, PartnerDashboardData, CategoryDataPoint, TimeSeriesPoint } from '@/types';

function delay(min: number, max: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

const now = new Date();

const PARTNERS: Partner[] = [
    {
        id: 'org-001',
        name: 'FitCorp Enterprise',
        status: 'active',
        usersCount: 240,
        b2bUsersCount: 12,
        activeUsers30d: 120,
        logins30d: 460,
        workoutSessions30d: 320,
        activityEvents30d: 780,
        lastActivity: format(subDays(now, 1), 'yyyy-MM-dd'),
    },
    {
        id: 'org-002',
        name: 'City Gym Network',
        status: 'active',
        usersCount: 180,
        b2bUsersCount: 8,
        activeUsers30d: 101,
        logins30d: 390,
        workoutSessions30d: 280,
        activityEvents30d: 670,
        lastActivity: format(subDays(now, 0), 'yyyy-MM-dd'),
    },
    {
        id: 'org-003',
        name: 'MutualSante Plus',
        status: 'active',
        usersCount: 160,
        b2bUsersCount: 7,
        activeUsers30d: 72,
        logins30d: 260,
        workoutSessions30d: 210,
        activityEvents30d: 470,
        lastActivity: format(subDays(now, 2), 'yyyy-MM-dd'),
    },
    {
        id: 'org-004',
        name: 'Green Health NGO',
        status: 'inactive',
        usersCount: 80,
        b2bUsersCount: 3,
        activeUsers30d: 0,
        logins30d: 0,
        workoutSessions30d: 0,
        activityEvents30d: 0,
        lastActivity: null,
    },
    {
        id: 'org-005',
        name: 'SportTech Labs',
        status: 'active',
        usersCount: 110,
        b2bUsersCount: 5,
        activeUsers30d: 45,
        logins30d: 170,
        workoutSessions30d: 98,
        activityEvents30d: 268,
        lastActivity: format(subDays(now, 4), 'yyyy-MM-dd'),
    },
];

const usageByPartner: CategoryDataPoint[] = PARTNERS
    .slice()
    .sort((a, b) => b.activityEvents30d - a.activityEvents30d)
    .map((partner) => ({ name: partner.name, value: partner.activityEvents30d }));

const partnerStatusBreakdown: CategoryDataPoint[] = (() => {
    const active = PARTNERS.filter((partner) => partner.status === 'active').length;
    const inactive = PARTNERS.length - active;

    return [
        { name: 'Actifs sur 30 jours', value: active, color: '#16A34A' },
        { name: 'Sans activite sur 30 jours', value: inactive, color: '#6B7280' },
    ];
})();

const monthlyActivityEvents: TimeSeriesPoint[] = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(now, 5 - index);
    const base = 1500 + index * 120;

    return {
        date: format(date, 'yyyy-MM-dd'),
        value: Math.round(base + (Math.random() - 0.5) * 180),
    };
});

export const partnersMock = {
    async fetchAll(): Promise<Partner[]> {
        await delay(200, 500);
        return [...PARTNERS];
    },

    async fetchDashboard(): Promise<PartnerDashboardData> {
        await delay(300, 600);
        return {
            partners: [...PARTNERS],
            usageByPartner,
            partnerStatusBreakdown,
            monthlyActivityEvents,
        };
    },
};
