import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await notificationAPI.getMyNotifications();
            const data = response.data.map(n => ({
                id: n.id,
                text: n.message,
                time: new Date(n.createdAt).toLocaleString(),
                unread: !n.read,
                type: n.type
            }));
            setNotifications(data);
            
            const countResponse = await notificationAPI.getUnreadCount();
            setUnreadCount(countResponse.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifs = notifications.filter(n => n.unread);
        if (unreadNotifs.length === 0) return;

        try {
            // Call API for each unread notification
            await Promise.all(unreadNotifs.map(n => notificationAPI.markAsRead(n.id)));
            
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
            // Re-fetch to ensure sync if some failed
            fetchNotifications();
        }
    };

    const addNotification = (text) => {
        // This can still be used for local UI feedback if needed
        const newNotif = {
            id: Date.now().toString(),
            text,
            time: "Just now",
            unread: true
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, addNotification }}>
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
