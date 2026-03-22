/**
 * UI store — persists user interface preferences (theme mode, etc.).
 *
 * Kept separate from auth.store.ts (SRP): auth owns identity,
 * ui owns display preferences.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface UIState {
    themeMode: ThemeMode;
    highContrast: boolean;
    toggleTheme: () => void;
    toggleHighContrast: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            themeMode: 'light',
            highContrast: false,
            toggleTheme: () =>
                set((state) => ({
                    themeMode: state.themeMode === 'light' ? 'dark' : 'light',
                })),
            toggleHighContrast: () =>
                set((state) => ({
                    highContrast: !state.highContrast,
                })),
        }),
        {
            name: 'healthai-ui',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
