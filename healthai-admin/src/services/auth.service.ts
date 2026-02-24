/**
 * Auth service — handles authentication against the backend.
 *
 * Extracted from the Zustand store so the store only manages state,
 * not HTTP logic (Single Responsibility Principle).
 */

import { apiClient } from '@/api';
import type { User } from '@/types';
import { UserRole } from '@/types';

const USE_MOCK = true;

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
    'admin@healthai.fr': { id: '1', email: 'admin@healthai.fr', firstName: 'Marie', lastName: 'Dupont', role: UserRole.ADMIN },
    'data@healthai.fr': { id: '2', email: 'data@healthai.fr', firstName: 'Lucas', lastName: 'Martin', role: UserRole.DATA_ENGINEER },
    'direction@healthai.fr': { id: '3', email: 'direction@healthai.fr', firstName: 'Sophie', lastName: 'Bernard', role: UserRole.DIRECTION },
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
