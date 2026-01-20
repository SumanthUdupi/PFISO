import React from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationOverlay: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications);

    return (
        <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`
                            px-4 py-3 rounded shadow-lg backdrop-blur-md text-white min-w-[200px]
                            ${notification.type === 'error' ? 'bg-red-900/80 border border-red-500' :
                                notification.type === 'success' ? 'bg-green-900/80 border border-green-500' :
                                    'bg-zinc-900/80 border border-zinc-700'}
                        `}
                    >
                        {notification.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
