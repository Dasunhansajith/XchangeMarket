import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaUsers, FaCar, FaFlag, FaChartLine, FaShieldAlt,
    FaCheckCircle, FaTimesCircle, FaEllipsisV, FaSearch, FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, sellerAPI, fraudAPI } from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingSellers: 0,
        activeAds: 0,
        fraudReports: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock data for initial UI - in real app would use useEffect to fetch
    useEffect(() => {
        const fetchStats = async () => {
            // These would be real API calls in a real setup
            setStats({
                totalUsers: 1250,
                pendingSellers: 8,
                activeAds: 450,
                fraudReports: 3
            });
            setLoading(false);
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white hidden lg:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-black tracking-tighter flex items-center gap-1">
                        <span className="text-red-600">X</span>
                        <span>ADMIN</span>
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<FaChartLine />} label="Dashboard" active />
                    <SidebarItem icon={<FaUsers />} label="Users" />
                    <SidebarItem icon={<FaCar />} label="Vehicles" />
                    <SidebarItem icon={<FaFlag />} label="Fraud Reports" />
                    <SidebarItem icon={<FaShieldAlt />} label="Security" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96">
                        <FaSearch className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-gray-600">
                            <FaBell size={20} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">3</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{user?.fullName || 'Admin User'}</p>
                                <p className="text-xs text-gray-500">System Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                                {user?.fullName?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="p-8 space-y-8 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                        <span className="text-sm text-gray-500">Last updated: Mar 4, 2026</span>
                    </div>

                    {/* Stats Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <StatCard
                            icon={<FaUsers color="#dc2626" />}
                            label="Total Users"
                            value={stats.totalUsers}
                            trend="+4% from last week"
                        />
                        <StatCard
                            icon={<FaShieldAlt color="#dc2626" />}
                            label="Seller Applications"
                            value={stats.pendingSellers}
                            trend="8 pending approval"
                            warning
                        />
                        <StatCard
                            icon={<FaCar color="#dc2626" />}
                            label="Active Ads"
                            value={stats.activeAds}
                            trend="+12 New today"
                        />
                        <StatCard
                            icon={<FaFlag color="#dc2626" />}
                            label="Fraud Reports"
                            value={stats.fraudReports}
                            trend="2 require review"
                            danger
                        />
                    </motion.div>

                    {/* Secondary Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Pending Approvals Table */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Pending Seller Applications</h3>
                                <button className="text-sm text-red-600 font-semibold hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Shop Name</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        <TableRow
                                            name="Kasun Perera"
                                            shop="Kasun's Electronics"
                                            date="2026-03-03"
                                        />
                                        <TableRow
                                            name="Nimali Silva"
                                            shop="Green Market"
                                            date="2026-03-02"
                                        />
                                        <TableRow
                                            name="Saman Kumara"
                                            shop="Rapid Autos"
                                            date="2026-03-01"
                                        />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-50">
                                <h3 className="font-bold text-gray-800">Recent Security Alerts</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <ActivityItem
                                    text="Multiple login attempts detected from IP 192.168.1.1"
                                    time="2 mins ago"
                                    type="danger"
                                />
                                <ActivityItem
                                    text="New fraud report submitted for Ad #7482"
                                    time="45 mins ago"
                                    type="warning"
                                />
                                <ActivityItem
                                    text="System backup completed successfully"
                                    time="2 hours ago"
                                    type="success"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatCard = ({ icon, label, value, trend, danger, warning }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
            <FaEllipsisV className="text-gray-300 cursor-pointer" />
        </div>
        <div>
            <h4 className="text-gray-500 text-sm font-medium">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-800">{value}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${danger ? 'bg-red-100 text-red-600' : warning ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                    {trend}
                </span>
            </div>
        </div>
    </div>
);

const TableRow = ({ name, shop, date }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                {name.charAt(0)}
            </div>
            <span className="font-semibold text-gray-800">{name}</span>
        </td>
        <td className="px-6 py-4 text-gray-600">{shop}</td>
        <td className="px-6 py-4 text-gray-500 text-xs">{date}</td>
        <td className="px-6 py-4">
            <div className="flex gap-2">
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <FaCheckCircle />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FaTimesCircle />
                </button>
            </div>
        </td>
    </tr>
);

const ActivityItem = ({ text, time, type }) => (
    <div className="flex gap-4">
        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${type === 'danger' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <div>
            <p className="text-sm text-gray-700 leading-tight">{text}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{time}</p>
        </div>
    </div>
);

export default AdminDashboard;
