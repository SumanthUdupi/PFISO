import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'item';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (message: string, type?: NotificationType, duration?: number) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
            notifications: [...state.notifications, { id, message, type, duration }],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, duration);
        }
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}));
