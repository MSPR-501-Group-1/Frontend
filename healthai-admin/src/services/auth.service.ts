/**
 * Auth service — handles authentication against the backend.
 *
 * Extracted from the Zustand store so the store only manages state,
 * not HTTP logic (Single Responsibility Principle).
 */

import { apiClient } from '@/api';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { USE_MOCK } from '@/lib/env';

// ─── Types ──────────────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

// ─── Mock accounts ──────────────────────────────────────────

const MOCK_USERS: Record<string, User> = {
    'admin@healthapp.com': {
        user_id: 'USR_007',
        email: 'admin@healthapp.com',
        first_name: 'Admin',
        last_name: 'System',
        role_type: UserRole.ADMIN,
    },
    'alice.martin@email.com': {
        user_id: 'USR_001',
        email: 'alice.martin@email.com',
        first_name: 'Alice',
        last_name: 'Martin',
        role_type: UserRole.PREMIUM,
    },
    'bob.dupont@email.com': {
        user_id: 'USR_002',
        email: 'bob.dupont@email.com',
        first_name: 'Bob',
        last_name: 'Dupont',
        role_type: UserRole.FREEMIUM,
    },
    'claire.leroy@email.com': {
        user_id: 'USR_003',
        email: 'claire.leroy@email.com',
        first_name: 'Claire',
        last_name: 'Leroy',
        role_type: UserRole.PREMIUM_PLUS,
    },
    'david.petit@email.com': {
        user_id: 'USR_004',
        email: 'david.petit@email.com',
        first_name: 'David',
        last_name: 'Petit',
        role_type: UserRole.B2B,
    },
};

// ─── Public API ─────────────────────────────────────────────

export async function loginUser(email: string, _password: string): Promise<LoginResponse> {
    if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        const user = MOCK_USERS[email];
        if (!user) throw new Error('Identifiants invalides');
        return { user, token: 'mock-jwt-token' };
    }
    return apiClient.post<LoginResponse>('/auth/login', { email, password: _password });
}

export async function logoutUser(): Promise<void> {
    if (USE_MOCK) return;
    return apiClient.post<void>('/auth/logout');
}
