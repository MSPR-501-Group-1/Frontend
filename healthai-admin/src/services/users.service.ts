/**
 * Users service — fetches admin user accounts.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { AdminUser, CreateUserPayload, UserRole } from '@/types';

type ApiEnvelope<T> = { data?: T } & T;

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
        const data = (payload as ApiEnvelope<T>).data;
        if (data !== undefined) return data;
    }
    return payload as T;
}

/** Fetch all admin user accounts. */
export async function fetchUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[] | ApiEnvelope<AdminUser[]>>('/users');
    return unwrapData(response);
}

/** Create a new admin user account. */
export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser | ApiEnvelope<AdminUser>>('/users', payload);
    return unwrapData(response);
}

/** Update role for an existing user account. */
export async function updateUserRole(userId: string, role_type: UserRole): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser | ApiEnvelope<AdminUser>>(`/users/${userId}`, { role_type });
    return unwrapData(response);
}
