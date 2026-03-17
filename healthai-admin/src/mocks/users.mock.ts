/**
 * Isolated mock data for the Users management domain.
 *
 * Generates realistic admin-user entries.
 * Will be deleted once the real backend is integrated.
 */

import { format, subDays } from 'date-fns';
import type { AdminUser, CreateUserPayload } from '@/types';
import { UserRole } from '@/types';

// ─── Seed helpers ───────────────────────────────────────────

function delay(min: number, max: number): Promise<void> {
    return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

// ─── Seed dataset ───────────────────────────────────────────

const now = new Date();

const SEED: AdminUser[] = [
    {
        user_id: 'USR_001',
        email: 'alice.martin@email.com',
        first_name: 'Alice',
        last_name: 'Martin',
        role_type: UserRole.PREMIUM,
        is_active: true,
        created_at: format(subDays(now, 365), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_002',
        email: 'bob.dupont@email.com',
        first_name: 'Bob',
        last_name: 'Dupont',
        role_type: UserRole.FREEMIUM,
        is_active: true,
        created_at: format(subDays(now, 280), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_003',
        email: 'claire.leroy@email.com',
        first_name: 'Claire',
        last_name: 'Leroy',
        role_type: UserRole.PREMIUM_PLUS,
        is_active: true,
        created_at: format(subDays(now, 200), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_004',
        email: 'david.petit@email.com',
        first_name: 'David',
        last_name: 'Petit',
        role_type: UserRole.B2B,
        is_active: true,
        created_at: format(subDays(now, 150), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_005',
        email: 'emma.blanc@email.com',
        first_name: 'Emma',
        last_name: 'Blanc',
        role_type: UserRole.PREMIUM,
        is_active: true,
        created_at: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_006',
        email: 'francois.noir@email.com',
        first_name: 'Francois',
        last_name: 'Noir',
        role_type: UserRole.FREEMIUM,
        is_active: false,
        created_at: format(subDays(now, 400), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_007',
        email: 'admin@healthapp.com',
        first_name: 'Admin',
        last_name: 'System',
        role_type: UserRole.ADMIN,
        is_active: true,
        created_at: format(subDays(now, 500), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_008',
        email: 'lea.simon@email.com',
        first_name: 'Lea',
        last_name: 'Simon',
        role_type: UserRole.PREMIUM_PLUS,
        is_active: true,
        created_at: format(subDays(now, 120), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_009',
        email: 'marc.henry@email.com',
        first_name: 'Marc',
        last_name: 'Henry',
        role_type: UserRole.B2B,
        is_active: true,
        created_at: format(subDays(now, 45), "yyyy-MM-dd'T'HH:mm:ss"),
    },
    {
        user_id: 'USR_010',
        email: 'hugo.blanc@email.com',
        first_name: 'Hugo',
        last_name: 'Blanc',
        role_type: UserRole.PREMIUM,
        is_active: true,
        created_at: format(subDays(now, 60), "yyyy-MM-dd'T'HH:mm:ss"),
    },
];

// ─── Public mock handlers ───────────────────────────────────

export const usersMock = {
    async fetchAll(): Promise<AdminUser[]> {
        await delay(300, 600);
        return [...SEED];
    },

    async createUser(payload: CreateUserPayload): Promise<AdminUser> {
        await delay(300, 600);

        const nextId = String(SEED.length + 1).padStart(3, '0');
        const newUser: AdminUser = {
            user_id: `USR_${nextId}`,
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            role_type: payload.role_type,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        SEED.push(newUser);
        return { ...newUser };
    },

    async updateUserRole(userId: string, role_type: UserRole): Promise<AdminUser> {
        await delay(200, 450);
        const index = SEED.findIndex((user) => user.user_id === userId);
        if (index === -1) throw new Error(`Utilisateur ${userId} introuvable`);

        SEED[index] = {
            ...SEED[index],
            role_type,
        };

        return { ...SEED[index] };
    },
};
