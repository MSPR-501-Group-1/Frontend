/**
 * Notification store — lightweight toast/snackbar state manager.
 *
 * Usage:
 *   import { useNotificationStore } from '@/stores/notification.store';
 *
 *   // In a component or mutation callback:
 *   useNotificationStore.getState().notify('Anomalie corrigée', 'success');
 */

import { create } from 'zustand';

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: number;
    message: string;
    severity: NotificationSeverity;
}

interface NotificationState {
    notification: Notification | null;
    notify: (message: string, severity?: NotificationSeverity) => void;
    dismiss: () => void;
}

let nextId = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
    notification: null,

    notify: (message, severity = 'success') => {
        set({ notification: { id: ++nextId, message, severity } });
    },

    dismiss: () => {
        set({ notification: null });
    },
}));
