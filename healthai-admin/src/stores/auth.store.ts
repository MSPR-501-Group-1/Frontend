/**
 * Auth store — manages authentication state.
 *
 * HTTP logic is delegated to auth.service.ts (SRP).
 * The store only owns state transitions.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser, logoutUser } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const { user } = await loginUser(email, password);
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            logout: () => {
                logoutUser().catch(() => { /* best-effort server logout */ });
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'healthai-auth',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
