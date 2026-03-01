/**
 * Isolated mock data for the Users management domain.
 *
 * Generates realistic admin-user entries.
 * Will be deleted once the real backend is integrated.
 */

import { format, subDays, subHours } from 'date-fns';
import type { AdminUser } from '@/types';
import { UserRole } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Seed dataset ───────────────────────────────────────────

const now = new Date();

const SEED: AdminUser[] = [
    {
        id: '1',
        email: 'admin@healthai.fr',
        firstName: 'Marie',
        lastName: 'Dupont',
        role: UserRole.ADMIN,
        status: 'active',
        createdAt: format(subDays(now, 365), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subHours(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '2',
        email: 'data@healthai.fr',
        firstName: 'Lucas',
        lastName: 'Martin',
        role: UserRole.DATA_ENGINEER,
        status: 'active',
        createdAt: format(subDays(now, 280), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subHours(now, 3), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '3',
        email: 'direction@healthai.fr',
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: UserRole.DIRECTION,
        status: 'active',
        createdAt: format(subDays(now, 200), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '4',
        email: 'po@healthai.fr',
        firstName: 'Thomas',
        lastName: 'Lefort',
        role: UserRole.PRODUCT_OWNER,
        status: 'active',
        createdAt: format(subDays(now, 150), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subHours(now, 12), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '5',
        email: 'partner@healthai.fr',
        firstName: 'Claire',
        lastName: 'Moreau',
        role: UserRole.B2B_PARTNER,
        status: 'active',
        createdAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 5), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '6',
        email: 'jean.petit@healthai.fr',
        firstName: 'Jean',
        lastName: 'Petit',
        role: UserRole.DATA_ENGINEER,
        status: 'inactive',
        createdAt: format(subDays(now, 400), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 60), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '7',
        email: 'anne.garcia@healthai.fr',
        firstName: 'Anne',
        lastName: 'Garcia',
        role: UserRole.PRODUCT_OWNER,
        status: 'suspended',
        createdAt: format(subDays(now, 300), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 30), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '8',
        email: 'paul.roux@healthai.fr',
        firstName: 'Paul',
        lastName: 'Roux',
        role: UserRole.DIRECTION,
        status: 'active',
        createdAt: format(subDays(now, 120), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subHours(now, 6), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '9',
        email: 'emma.faure@healthai.fr',
        firstName: 'Emma',
        lastName: 'Faure',
        role: UserRole.B2B_PARTNER,
        status: 'active',
        createdAt: format(subDays(now, 45), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '10',
        email: 'hugo.blanc@healthai.fr',
        firstName: 'Hugo',
        lastName: 'Blanc',
        role: UserRole.DATA_ENGINEER,
        status: 'active',
        createdAt: format(subDays(now, 60), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subHours(now, 2), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '11',
        email: 'lea.simon@healthai.fr',
        firstName: 'Léa',
        lastName: 'Simon',
        role: UserRole.ADMIN,
        status: 'inactive',
        createdAt: format(subDays(now, 500), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        id: '12',
        email: 'marc.henry@healthai.fr',
        firstName: 'Marc',
        lastName: 'Henry',
        role: UserRole.B2B_PARTNER,
        status: 'suspended',
        createdAt: format(subDays(now, 180), "yyyy-MM-dd'T'HH:mm:ss"),
        lastLogin: null,
    },
];

// ─── Public mock handlers ───────────────────────────────────

export const usersMock = {
    async fetchAll(): Promise<AdminUser[]> {
        await delay(300, 600);
        return [...SEED];
    },

    async createUser(payload: { email: string; firstName: string; lastName: string; role: import('@/types').UserRole }): Promise<AdminUser> {
        await delay(300, 600);
        const newUser: AdminUser = {
            id: String(SEED.length + 1),
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            role: payload.role,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null,
        };
        SEED.push(newUser);
        return { ...newUser };
    },
};
