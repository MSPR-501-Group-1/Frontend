import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { UserRole } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Mock users — multiple roles for RBAC demonstration
const MOCK_USERS: Record<string, User> = {
    'admin@healthai.fr': {
        id: '1',
        email: 'admin@healthai.fr',
        firstName: 'Marie',
        lastName: 'Dupont',
        role: UserRole.ADMIN,
    },
    'data@healthai.fr': {
        id: '2',
        email: 'data@healthai.fr',
        firstName: 'Lucas',
        lastName: 'Martin',
        role: UserRole.DATA_ENGINEER,
    },
    'direction@healthai.fr': {
        id: '3',
        email: 'direction@healthai.fr',
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: UserRole.DIRECTION,
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, _password: string) => {
                set({ isLoading: true });
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                const mockUser = MOCK_USERS[email];
                if (mockUser) {
                    set({ user: mockUser, isAuthenticated: true, isLoading: false });
                } else {
                    set({ isLoading: false });
                    throw new Error('Identifiants invalides');
                }
            },

            logout: () => {
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
