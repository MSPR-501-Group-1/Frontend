import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Fake credentials for development
const MOCK_USER: User = {
    id: '1',
    email: 'admin@healthai.fr',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'admin' as User['role'],
    avatar: undefined,
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

                if (email === 'admin@healthai.fr') {
                    set({ user: MOCK_USER, isAuthenticated: true, isLoading: false });
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
