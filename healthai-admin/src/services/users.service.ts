/**
 * Users service — fetches admin user accounts.
 *
 * Toggle `USE_MOCK` to switch between embedded mock data and real
 * backend calls via `apiClient`.
 */

import { apiClient } from '@/api';
import type { AdminUser, CreateUserPayload, UserRole } from '@/types';

/** Fetch all admin user accounts. */
export async function fetchUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>('/admin/users');
}

/** Create a new admin user account. */
export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', payload);
}

/** Update role for an existing user account. */
export async function updateUserRole(userId: string, role_type: UserRole): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role_type });
}
