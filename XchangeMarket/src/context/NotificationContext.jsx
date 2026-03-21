import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        // Load initial notifications from local storage if available
        const saved = localStorage.getItem('xchange_notifications');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        // Default dummy notifications if nothing is saved
        return [
            { id: 1, text: "Welcome to Xchange Market!", time: "Just now", unread: true },
            { id: 2, text: "Explore our latest vehicle listings.", time: "1 hour ago", unread: false }
        ];
    });

    // Save to local storage whenever notifications change
    useEffect(() => {
        localStorage.setItem('xchange_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (text) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newNotif = {
            id: Date.now(),
            text,
            time: `${dateStr}, ${timeStr}`,
            fullDate: now.toISOString(),
            unread: true
        };
        setNotifications(prev => {
            const updated = [newNotif, ...prev];
            return updated.slice(0, 4); // Keep only the last 4
        });
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
