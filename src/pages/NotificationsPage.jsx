import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaBell, FaTrash, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getMyNotifications();
            setNotifications(response.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        if (type.includes('APPROVED')) return <FaCheckCircle className="text-green-500 text-2xl" />;
        if (type.includes('REJECTED')) return <FaTimesCircle className="text-red-500 text-2xl" />;
        return <FaBell className="text-blue-500 text-2xl" />;
    };

    const getNotificationColor = (type) => {
        if (type.includes('APPROVED')) return 'border-l-green-500 bg-green-50';
        if (type.includes('REJECTED')) return 'border-l-red-500 bg-red-50';
        return 'border-l-blue-500 bg-blue-50';
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <FaBell className="text-3xl text-red-600" />
                        <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="ml-auto bg-red-600 text-white rounded-full px-3 py-1 text-sm font-semibold">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-4 mb-6">
                        {['all', 'unread', 'read'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === f
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-xl shadow-sm"
                    >
                        <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-500">No notifications yet</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border-l-4 rounded-lg p-4 bg-white shadow-sm ${getNotificationColor(notification.type)} hover:shadow-md transition`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="pt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-800">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                                <FaClock className="text-xs" />
                                                {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(notification.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
