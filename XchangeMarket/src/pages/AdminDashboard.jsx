import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaUsers, FaCar, FaChartLine,
    FaCheckCircle, FaTimesCircle, FaEllipsisV, FaSearch, FaBell, FaTrash,
    FaShoppingCart, FaDollarSign, FaChevronDown
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { adminAPI, userAPI, productAPI } from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [applicationFilter, setApplicationFilter] = useState('PENDING');
    const [stats, setStats] = useState({
        totalUsers: 0,
        usersRegisteredToday: 0,
        totalSellers: 0,
        activeAds: 0,
        productsAddedToday: 0,
        totalOrders: 0,
        ordersPlacedToday: 0,
        totalRevenue: 0,
        revenueChangePercent: 0
    });
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appLoading, setAppLoading] = useState({});
    const [deleteLoading, setDeleteLoading] = useState({});
    const [userDeleteLoading, setUserDeleteLoading] = useState({});
    const [roleLoading, setRoleLoading] = useState({});
    const [weeklyRevenueData, setWeeklyRevenueData] = useState([]);
    const [stores, setStores] = useState([]);
    const [storeDeleteLoading, setStoreDeleteLoading] = useState({});

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchApplications();
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'ads') {
            fetchProducts();
        } else if (activeTab === 'stores') {
            fetchStores();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const productsRes = await productAPI.getAllProducts();
            const products = Array.isArray(productsRes.data) ? productsRes.data : [];
            console.log('Products fetched:', products.length);
            
            // Fetch users count
            const usersRes = await userAPI.getAllUsers();
            const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
            console.log('Users fetched:', usersList.length);
            
            // Fetch all orders
            const ordersRes = await adminAPI.getAllOrders();
            const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
            console.log('Orders fetched:', allOrders.length);
            
            // Calculate today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Calculate users registered today
            const usersRegisteredToday = usersList.filter(user => {
                const userDate = new Date(user.createdAt);
                userDate.setHours(0, 0, 0, 0);
                return userDate.getTime() === today.getTime();
            }).length;
            
            // Calculate products added today
            const productsAddedToday = products.filter(product => {
                const productDate = new Date(product.createdAt || product.uploadedAt || product.dateAdded);
                productDate.setHours(0, 0, 0, 0);
                return productDate.getTime() === today.getTime();
            }).length;
            
            // Calculate orders placed today
            const ordersPlacedToday = allOrders.filter(order => {
                if (!order.createdAt) return false;
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            }).length;
            
            // Calculate total revenue from all orders
            const totalRevenue = allOrders.reduce((sum, order) => {
                const price = parseFloat(order.totalPrice) || 0;
                return sum + price;
            }, 0);

            // Calculate previous week's revenue
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
            thisWeekStart.setHours(0, 0, 0, 0);

            const prevWeekStart = new Date(thisWeekStart);
            prevWeekStart.setDate(thisWeekStart.getDate() - 7); // Start of previous week
            
            const prevWeekRevenue = allOrders.reduce((sum, order) => {
                if (!order.createdAt) return sum;
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                // Check if order is in previous week
                if (orderDate.getTime() >= prevWeekStart.getTime() && orderDate.getTime() < thisWeekStart.getTime()) {
                    const price = parseFloat(order.totalPrice) || 0;
                    return sum + price;
                }
                return sum;
            }, 0);

            // Calculate percentage change
            let revenueChangePercent = 0;
            if (prevWeekRevenue > 0) {
                revenueChangePercent = ((totalRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;
            } else if (totalRevenue > 0) {
                revenueChangePercent = 100; // 100% increase if last week had 0 revenue
            }

            // Calculate daily revenue for the past 7 days
            const weeklyData = [];
            for (let i = 6; i >= 0; i--) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);
                day.setHours(0, 0, 0, 0);
                
                const nextDay = new Date(day);
                nextDay.setDate(day.getDate() + 1);
                
                const dayRevenue = allOrders.reduce((sum, order) => {
                    if (!order.createdAt) return sum;
                    const orderDate = new Date(order.createdAt);
                    orderDate.setHours(0, 0, 0, 0);
                    if (orderDate.getTime() >= day.getTime() && orderDate.getTime() < nextDay.getTime()) {
                        const price = parseFloat(order.totalPrice) || 0;
                        return sum + price;
                    }
                    return sum;
                }, 0);
                
                weeklyData.push({
                    day: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: parseFloat(dayRevenue.toFixed(2))
                });
            }
            
            setWeeklyRevenueData(weeklyData);
            
            setStats(prev => ({
                ...prev,
                totalUsers: usersList.length,
                usersRegisteredToday: usersRegisteredToday,
                activeAds: products.length,
                productsAddedToday: productsAddedToday,
                totalOrders: allOrders.length,
                ordersPlacedToday: ordersPlacedToday,
                totalRevenue: totalRevenue,
                revenueChangePercent: parseFloat(revenueChangePercent.toFixed(2))
            }));
        } catch (err) {
            console.error('Error fetching stats:', err);
            console.error('Error response:', err.response?.data || err.message);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllSellerApplications();
            const apps = Array.isArray(response.data) ? response.data : [];
            console.log('Seller applications fetched:', apps.length);
            setApplications(apps);
            
            // Calculate stats
            const totalCount = apps.length;
            setStats(prev => ({
                ...prev,
                totalSellers: totalCount
            }));
        } catch (err) {
            console.error('Error fetching applications:', err);
            console.error('Error response:', err.response?.data || err.message);
            toast.error('Failed to load seller applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllUsers();
            const userList = Array.isArray(response.data) ? response.data : [];
            console.log('Users fetched:', userList.length);
            setUsers(userList);
        } catch (err) {
            console.error('Error fetching users:', err);
            console.error('Error response:', err.response?.data || err.message);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAllProducts();
            const productList = Array.isArray(response.data) ? response.data : [];
            console.log('Products fetched:', productList.length);
            setProducts(productList);
        } catch (err) {
            console.error('Error fetching products:', err);
            console.error('Error response:', err.response?.data || err.message);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            setLoading(true);
            const shopsResponse = await adminAPI.getAllShops();
            const shopList = Array.isArray(shopsResponse.data) ? shopsResponse.data : [];
            
            const usersResponse = await userAPI.getAllUsers();
            const usersList = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            
            // Create a map of userId to user for quick lookup
            const userMap = {};
            usersList.forEach(user => {
                userMap[user.id] = user;
            });
            
            // Merge shop data with user names and remove duplicates
            const shopsWithOwnerNames = shopList.map(shop => ({
                ...shop,
                userName: userMap[shop.userId]?.name || userMap[shop.userId]?.fullName || 'N/A'
            }));
            
            // Remove duplicate shops - keep the latest by ID for each shopName
            const uniqueShops = {};
            shopsWithOwnerNames.forEach(shop => {
                const key = shop.userId; // Group by userId since each user should have one shop
                if (!uniqueShops[key] || (shop.id > uniqueShops[key].id)) {
                    uniqueShops[key] = shop;
                }
            });
            
            const dedupedShops = Object.values(uniqueShops);
            
            console.log('Shops fetched:', dedupedShops.length);
            setStores(dedupedShops);
        } catch (err) {
            console.error('Error fetching shops:', err);
            console.error('Error response:', err.response?.data || err.message);
            toast.error('Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId) => {
        try {
            setAppLoading(prev => ({ ...prev, [applicationId]: true }));
            await adminAPI.approveSellerApplication(applicationId);
            toast.success('Application approved!');
            fetchApplications();
        } catch (err) {
            console.error('Error approving application:', err);
            toast.error('Failed to approve application');
        } finally {
            setAppLoading(prev => ({ ...prev, [applicationId]: false }));
        }
    };

    const handleReject = async (applicationId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            setAppLoading(prev => ({ ...prev, [applicationId]: true }));
            await adminAPI.rejectSellerApplication(applicationId, { reason });
            toast.success('Application rejected');
            fetchApplications();
        } catch (err) {
            console.error('Error rejecting application:', err);
            toast.error('Failed to reject application');
        } finally {
            setAppLoading(prev => ({ ...prev, [applicationId]: false }));
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setDeleteLoading(prev => ({ ...prev, [productId]: true }));
            await productAPI.deleteProduct(productId);
            toast.success('Product deleted successfully!');
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product');
        } finally {
            setDeleteLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleUpdateUserRole = async (userId, role) => {
        try {
            setRoleLoading(prev => ({ ...prev, [userId]: true }));
            await adminAPI.updateUserRole(userId, role);
            toast.success('User role updated successfully!');
            fetchUsers();
        } catch (err) {
            console.error('Error updating user role:', err);
            toast.error('Failed to update user role');
        } finally {
            setRoleLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleRemoveUserRole = async (userId, role) => {
        try {
            setRoleLoading(prev => ({ ...prev, [userId]: true }));
            await adminAPI.removeUserRole(userId, role);
            toast.success('User role removed successfully!');
            fetchUsers();
        } catch (err) {
            console.error('Error removing user role:', err);
            toast.error('Failed to remove user role');
        } finally {
            setRoleLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete the account of ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            setUserDeleteLoading(prev => ({ ...prev, [userId]: true }));
            await adminAPI.deleteUser(userId);
            toast.success('User account deleted successfully!');
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error('Failed to delete user account');
        } finally {
            setUserDeleteLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDeleteStore = async (storeId, storeName, ownerId) => {
        if (!window.confirm(`Are you sure you want to delete the store "${storeName}"? The owner's role will be changed to buyer.`)) {
            return;
        }

        try {
            setStoreDeleteLoading(prev => ({ ...prev, [storeId]: true }));
            // Delete the shop from the database
            await adminAPI.deleteShop(storeId);
            // Remove the seller role from the store owner (this will automatically add ROLE_BUYER)
            await adminAPI.removeUserRole(ownerId, 'SELLER');
            toast.success('Store deleted successfully! Owner role changed to buyer.');
            fetchStores();
        } catch (err) {
            console.error('Error deleting store:', err);
            toast.error('Failed to delete store');
        } finally {
            setStoreDeleteLoading(prev => ({ ...prev, [storeId]: false }));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const filteredApplications = applications.filter(app => app.status === applicationFilter);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white hidden lg:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-black tracking-tighter flex items-center gap-1">
                        <span className="text-red-600">Welcome,</span>
                        <span>Admin</span>
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem 
                        icon={<FaChartLine />} 
                        label="Dashboard" 
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem 
                        icon={<FaUsers />} 
                        label="Users" 
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarItem 
                        icon={<FaCar />} 
                        label="Advertisements" 
                        active={activeTab === 'ads'}
                        onClick={() => setActiveTab('ads')}
                    />
                    <SidebarItem 
                        icon={<FaShoppingCart />} 
                        label="Stores" 
                        active={activeTab === 'stores'}
                        onClick={() => setActiveTab('stores')}
                    />
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
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {applications.filter(app => app.status === 'PENDING').length}
                            </span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{user?.fullName || user?.name || 'Admin User'}</p>
                                <p className="text-xs text-gray-500">System Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                                {(user?.fullName || user?.name || 'A').charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="p-8 space-y-8 overflow-y-auto">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
                            </div>

                            {/* Stats Cards */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
                            >
                                <StatCard
                                    icon={<FaUsers color="#dc2626" />}
                                    label="Total Users"
                                    value={stats.totalUsers}
                                    trend={`+${stats.usersRegisteredToday} registered today`}
                                />
                                <StatCard
                                    icon={<FaChartLine color="#dc2626" />}
                                    label="No of Sellers"
                                    value={stats.totalSellers}
                                    trend={`${applications.filter(app => app.status === 'PENDING').length} awaiting approval`}
                                    warning={applications.filter(app => app.status === 'PENDING').length > 0}
                                />
                                <div className="lg:row-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="text-gray-500 text-sm font-medium">Total Revenue</h4>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-2xl font-bold text-gray-800">{`Rs. ${parseFloat(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 bg-green-100 text-green-600`}>
                                                {`${stats.revenueChangePercent >= 0 ? '+' : ''}${stats.revenueChangePercent}% vs last week`}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <FaDollarSign color="#dc2626" size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-1 mt-4">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart data={weeklyRevenueData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#4b4a4a" />
                                                <YAxis tick={{ fontSize: 11 }} stroke="#4b4a4a" />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                                                    formatter={(value) => `Rs. ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    stroke="#dc2626" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#dc2626', r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <StatCard
                                    icon={<FaCar color="#dc2626" />}
                                    label="Active Products"
                                    value={stats.activeAds}
                                    trend={`+${stats.productsAddedToday} New today`}
                                />
                                <StatCard
                                    icon={<FaShoppingCart color="#dc2626" />}
                                    label="Total Orders"
                                    value={stats.totalOrders}
                                    trend={`+${stats.ordersPlacedToday} placed today`}
                                />
                            </motion.div>

                            {/* Seller Applications Table with Filters */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="p-6 border-b border-gray-50">
                                    <h3 className="font-bold text-gray-800 mb-4">Seller Applications</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setApplicationFilter('PENDING')}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                applicationFilter === 'PENDING'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Pending ({applications.filter(app => app.status === 'PENDING').length})
                                        </button>
                                        <button
                                            onClick={() => setApplicationFilter('APPROVED')}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                applicationFilter === 'APPROVED'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Approved ({applications.filter(app => app.status === 'APPROVED').length})
                                        </button>
                                        <button
                                            onClick={() => setApplicationFilter('REJECTED')}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                applicationFilter === 'REJECTED'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Rejected ({applications.filter(app => app.status === 'REJECTED').length})
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                                        </div>
                                    ) : filteredApplications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <p>No {applicationFilter.toLowerCase()} applications</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Shop Name</th>
                                                    <th className="px-6 py-4">Store Creator</th>
                                                    <th className="px-6 py-4">Location</th>
                                                    <th className="px-6 py-4">Categories</th>
                                                    <th className="px-6 py-4">Applied Date</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    {applicationFilter === 'PENDING' && <th className="px-6 py-4">Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {filteredApplications.map((app) => (
                                                    <TableRow
                                                        key={app.id}
                                                        app={app}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                        isLoading={appLoading[app.id]}
                                                        showAction={applicationFilter === 'PENDING'}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
                                <span className="text-sm text-gray-500">Total: {users.length} users</span>
                            </div>

                            {/* Users Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <p>No users found</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Name</th>
                                                    <th className="px-6 py-4">Email</th>
                                                    <th className="px-6 py-4">Address</th>
                                                    <th className="px-6 py-4">Contact Number</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {users.map((usr) => (
                                                    <UserTableRow 
                                                        key={usr.id} 
                                                        user={usr} 
                                                        onUpdateRole={handleUpdateUserRole}
                                                        onRemoveRole={handleRemoveUserRole}
                                                        onDeleteUser={handleDeleteUser}
                                                        isRoleLoading={roleLoading[usr.id]}
                                                        isDeleteLoading={userDeleteLoading[usr.id]}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'ads' && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Advertisements Management</h2>
                                <span className="text-sm text-gray-500">Total: {products.length} products</span>
                            </div>

                            {/* Products Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <p>No products found</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Product Image</th>
                                                    <th className="px-6 py-4">Product Name</th>
                                                    <th className="px-6 py-4">Seller Store</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Stock</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {products.map((product) => (
                                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="h-12 w-12 object-cover rounded"
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-semibold">{product.name || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{product.shopName || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-600">Rs. {product.price?.toFixed(2) || '0.00'}</td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                product.stockQuantity > 0 
                                                                    ? 'bg-green-50 text-green-700' 
                                                                    : 'bg-red-50 text-red-700'
                                                            }`}>
                                                                {product.stockQuantity || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                product.status === 'ACTIVE'
                                                                    ? 'bg-blue-50 text-blue-700'
                                                                    : product.status === 'SOLD'
                                                                    ? 'bg-gray-50 text-gray-700'
                                                                    : 'bg-yellow-50 text-yellow-700'
                                                            }`}>
                                                                {product.status || 'ACTIVE'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                disabled={deleteLoading[product.id]}
                                                                className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                                title="Delete Product"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'stores' && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Stores Management</h2>
                                <span className="text-sm text-gray-500">Total: {stores.length} stores</span>
                            </div>

                            {/* Stores Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                                        </div>
                                    ) : stores.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <p>No stores found</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Store Name</th>
                                                    <th className="px-6 py-4">Owner</th>
                                                    <th className="px-6 py-4">City</th>
                                                    <th className="px-6 py-4">District</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {stores.map((store) => (
                                                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-gray-600 font-semibold">{store.shopName || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{store.userName || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{store.city || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-600">{store.district || 'N/A'}</td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleDeleteStore(store.id, store.shopName, store.userId)}
                                                                disabled={storeDeleteLoading[store.id]}
                                                                className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                                title="Delete Store"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatCard = ({ icon, label, value, trend, warning }) => (
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${warning ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                    {trend}
                </span>
            </div>
        </div>
    </div>
);

const TableRow = ({ app, onApprove, onReject, isLoading, showAction }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>;
            case 'APPROVED':
                return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Approved</span>;
            case 'REJECTED':
                return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>;
            default:
                return <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-600 font-semibold">{app.shopName}</td>
            <td className="px-6 py-4 text-gray-600">{app.userName || 'N/A'}</td>
            <td className="px-6 py-4 text-gray-600 text-xs">{app.city}, {app.district}</td>
            <td className="px-6 py-4 text-gray-600 text-xs">
                <span className="bg-blue-50 px-2 py-1 rounded">{app.shopCategories?.join(', ') || 'N/A'}</span>
            </td>
            <td className="px-6 py-4 text-gray-500 text-xs">{new Date(app.appliedAt).toLocaleDateString()}</td>
            <td className="px-6 py-4">
                {getStatusBadge(app.status)}
            </td>
            {showAction && (
                <td className="px-6 py-4">
                    {app.status === 'PENDING' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onApprove(app.id)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold text-sm"
                                title="Approve"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onReject(app.id)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold text-sm"
                                title="Reject"
                            >
                                Reject
                            </button>
                        </div>
                    ) : (
                        <span className="text-gray-500 text-sm">—</span>
                    )}
                </td>
            )}
        </tr>
    );
};

const UserTableRow = ({ user, onUpdateRole, onRemoveRole, onDeleteUser, isRoleLoading, isDeleteLoading }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const isAdmin = user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ADMIN');
    const isSeller = user.roles?.includes('ROLE_SELLER') || user.roles?.includes('SELLER');
    
    const getCurrentRole = () => {
        if (isAdmin) return 'Admin';
        if (isSeller) return 'Seller';
        return 'User';
    };

    const handleRoleChange = (newRole) => {
        onUpdateRole(user.id, newRole);
        setShowDropdown(false);
    };

    const handleRoleRemove = (roleToRemove) => {
        onRemoveRole(user.id, roleToRemove);
        setShowDropdown(false);
    };
    
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800">{user.name || user.fullName || 'N/A'}</span>
            </td>
            <td className="px-6 py-4 text-gray-600">{user.email}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{user.address || 'N/A'}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{user.phone || 'N/A'}</td>
            <td className="px-6 py-4">
                <div className="relative inline-block">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        disabled={isRoleLoading}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 ${
                            isAdmin
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : isSeller
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {getCurrentRole()}
                        <FaChevronDown size={10} />
                    </button>
                    {showDropdown && (
                        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {!isAdmin && (
                                <button
                                    onClick={() => handleRoleChange('ADMIN')}
                                    disabled={isRoleLoading}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                    {isRoleLoading ? 'Updating...' : 'Make Admin'}
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => handleRoleRemove('ADMIN')}
                                    disabled={isRoleLoading}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                    {isRoleLoading ? 'Updating...' : 'Remove Admin'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => onDeleteUser(user.id, user.name || user.fullName || user.email)}
                    disabled={isDeleteLoading}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete User"
                >
                    <FaTrash size={14} />
                </button>
            </td>
        </tr>
    );
};

export default AdminDashboard;

