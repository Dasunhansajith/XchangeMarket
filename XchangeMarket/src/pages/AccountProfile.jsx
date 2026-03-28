import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderAPI, reviewAPI } from '../services/api';
import { StarSelector } from '../components/ProductReviews';
import toast from 'react-hot-toast';

const AccountProfile = () => {
    const { user, updateUser, logout, deleteAccount, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    const [editing, setEditing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [editingReviewOrder, setEditingReviewOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        nickname: user?.nickname || user?.name?.split(' ')[0] || '',
        phone: user?.phone || '',
        address: user?.address || '',
        nicNumber: user?.nicNumber || '',
        profilePhotoUrl: user?.profilePhotoUrl || '',
        gender: user?.gender || 'Male',
        country: user?.country || 'Sri Lanka',
        userLanguage: user?.userLanguage || 'English',
        timezone: user?.timezone || '(GMT+05:30) Colombo',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                nicNumber: user.nicNumber || '',
                profilePhotoUrl: user.profilePhotoUrl || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const response = await orderAPI.getMyOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load order history');
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewText.trim()) {
            toast.error('Please write a short review.');
            return;
        }
        setReviewSubmitting(true);
        try {
            await orderAPI.submitReview(reviewOrder.id, { rating, review: reviewText });
            toast.success('Thank you for your review!');
            setReviewOrder(null);
            setReviewText('');
            setRating(5);
            fetchOrders();
        } catch (error) {
            console.error('Review error:', error);
            toast.error('Failed to submit review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleEditReviewSubmit = async () => {
        if (!reviewText.trim()) {
            toast.error('Please write a short review.');
            return;
        }
        setReviewSubmitting(true);
        try {
            await orderAPI.editReview(editingReviewOrder.id, { rating, review: reviewText });
            toast.success('Review updated!');
            setEditingReviewOrder(null);
            setReviewText('');
            setRating(5);
            fetchOrders();
        } catch (error) {
            console.error('Edit review error:', error);
            toast.error('Failed to update review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleDeleteReview = async (order) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await orderAPI.deleteReview(order.id);
            toast.success('Review deleted.');
            fetchOrders();
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error('Failed to delete review');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePhotoUrl: reader.result });
                toast.success('Photo ready to update');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        const res = await updateUser(formData);
        if (res.success) {
            setEditing(false);
            toast.success('Settings updated successfully!');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return <div className="p-20 text-center">Please login to view profile.</div>;

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-2 sm:p-4 md:p-8 font-sans">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex min-h-[85vh]">

                {/* Sidebar */}
                <aside className="w-20 md:w-24 bg-white border-r border-gray-100 flex flex-col items-center py-10 space-y-8 flex-shrink-0">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </div>
                    {['orders', 'profile'].map((icon) => (
                        <button
                            key={icon}
                            onClick={() => icon === 'orders' ? setSearchParams({ tab: 'orders' }) : setSearchParams({ tab: 'profile' })}
                            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === icon ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'}`}
                        >
                            <span className="capitalize text-[10px] font-bold hidden md:block mt-1">{icon}</span>
                            {icon === 'orders' && <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                            {icon === 'profile' && <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        </button>
                    ))}
                    <div className="flex-1"></div>
                    <button onClick={handleLogout} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4-4H3" /></svg>
                    </button>
                </aside>

                {/* Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* Top Header */}
                    <header className="px-10 py-8 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}</h2>
                            <p className="text-sm text-slate-400 font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative group hidden sm:block">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" placeholder="Search" className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all w-64" />
                            </div>
                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </button>
                            <img src={user.profilePhotoUrl || 'https://placehold.co/40'} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm" alt="Me" />
                        </div>
                    </header>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-8 pb-4">
                        {activeTab === 'profile' ? (
                            <div className="space-y-4 animate-in fade-in duration-500">

                                {/* Banner & Profile Card - More Compact */}
                                <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="h-16 bg-gradient-to-r from-blue-50 via-indigo-50 to-rose-50"></div>
                                    <div className="px-6 pb-4 -mt-8 flex items-end justify-between">
                                        <div className="flex items-end gap-5">
                                            <div className="relative group">
                                                <img
                                                    src={formData.profilePhotoUrl || 'https://placehold.co/100'}
                                                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                                                    alt="Profile"
                                                />
                                                {editing && (
                                                    <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-lg cursor-pointer shadow-md hover:bg-blue-700 transition-all scale-75">
                                                        <input type="file" className="hidden" onChange={handleFileChange} />
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                                                    </label>
                                                )}
                                            </div>
                                            <div className="mb-1">
                                                <h3 className="text-lg font-bold text-slate-800">{formData.name}</h3>
                                                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => editing ? handleSave() : setEditing(true)}
                                            className={`px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 ${editing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                        >
                                            {editing ? 'Save' : 'Edit Profile'}
                                        </button>
                                    </div>
                                </div>

                                {/* Form Grid - Very Denser */}
                                <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            {[
                                                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Name' },
                                                { label: 'Nick Name', name: 'nickname', type: 'text', placeholder: 'Nick' },
                                                { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                                                { label: 'Country', name: 'country', type: 'select', options: ['Sri Lanka', 'India', 'UK', 'USA'] },
                                                { label: 'Language', name: 'userLanguage', type: 'select', options: ['English', 'Sinhala', 'Tamil'] },
                                                { label: 'Time Zone', name: 'timezone', type: 'select', options: ['(GMT+05:30) Colombo', '(GMT+00:00) London'] },
                                                { label: 'Phone', name: 'phone', type: 'text', placeholder: 'Phone Number' },
                                                { label: 'NIC Number', name: 'nicNumber', type: 'text', placeholder: 'NIC Number' },
                                            ].map((field) => (
                                                <div key={field.name} className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                                                    {field.type === 'select' ? (
                                                        <div className="relative">
                                                            <select
                                                                name={field.name}
                                                                value={formData[field.name]}
                                                                onChange={handleChange}
                                                                disabled={!editing}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-100 transition-all appearance-none disabled:opacity-80"
                                                            >
                                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            name={field.name}
                                                            value={formData[field.name]}
                                                            onChange={handleChange}
                                                            placeholder={field.placeholder}
                                                            disabled={!editing}
                                                            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-1 focus:ring-blue-100 transition-all disabled:opacity-80"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            /* Orders view with the same clean layout */
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-800 px-2">Order History</h3>
                                {ordersLoading ? (
                                    <div className="p-20 text-center text-slate-400 font-bold">Loading orders...</div>
                                ) : orders.length > 0 ? (
                                    <div className="grid gap-4">
                                        {[...orders].sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)).map(order => (
                                            <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100">
                                                        <img
                                                            src={(order.productImage && order.productImage !== "") ? order.productImage : 'https://placehold.co/100?text=Product'}
                                                            className="w-full h-full object-cover"
                                                            alt="Product"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/100?text=Product'; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{order.productName}</p>
                                                        <p className="text-xs text-slate-400 font-medium">#{order.id.slice(0, 8)} • {new Date(order.createdAt || order.orderDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center gap-3">
                                                    {!order.rating && order.status === 'ACCEPTED' && (
                                                        <>
                                                            <button
                                                                onClick={() => { setReviewOrder(order); setRating(5); }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all active:scale-95 border border-amber-100"
                                                            >
                                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                Rate
                                                            </button>
                                                            <button
                                                                onClick={() => { setReviewOrder(order); setReviewText(''); }}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                                Review
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="text-right flex flex-col items-end gap-2 pr-2">
                                                    <div>
                                                        <p className="font-bold text-blue-600">RS {order.totalPrice}</p>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${order.status === 'PENDING' ? 'text-amber-500 bg-amber-50' :
                                                            order.status === 'ACCEPTED' || order.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-50' :
                                                                order.status === 'DECLINED' || order.status === 'CANCELLED' ? 'text-red-500 bg-red-50' :
                                                                    'text-slate-500 bg-slate-50'
                                                            }`}>{order.status}</span>
                                                    </div>

                                                    {/* Rating/Review display + Edit/Delete actions */}
                                                    {order.rating && (
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <div className="flex text-amber-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <svg key={i} className={`w-3 h-3 ${i < order.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                ))}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 italic max-w-[150px] truncate">"{order.review}"</p>
                                                            {order.status === 'ACCEPTED' && (
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingReviewOrder(order);
                                                                            setRating(order.rating);
                                                                            setReviewText(order.review || '');
                                                                        }}
                                                                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReview(order)}
                                                                        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 text-slate-400 font-bold">
                                        No transaction history found yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Submit New Review Modal */}
            {reviewOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Leave a Review</h3>
                                <p className="text-sm text-slate-400">Share your experience for {reviewOrder.productName}</p>
                            </div>
                            <button onClick={() => setReviewOrder(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <StarSelector value={rating} onChange={setRating} size="lg" />
                                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-800 px-1">Write your review</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 min-h-[120px] resize-none"
                                    placeholder="What did you like or dislike?"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleReviewSubmit}
                                disabled={reviewSubmitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-60"
                            >
                                {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Existing Review Modal */}
            {editingReviewOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Edit Your Review</h3>
                                <p className="text-sm text-slate-400">{editingReviewOrder.productName}</p>
                            </div>
                            <button onClick={() => { setEditingReviewOrder(null); setReviewText(''); setRating(5); }} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <StarSelector value={rating} onChange={setRating} size="lg" />
                                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-800 px-1">Your review</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 min-h-[120px] resize-none"
                                    placeholder="What did you like or dislike?"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setEditingReviewOrder(null); setReviewText(''); setRating(5); }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditReviewSubmit}
                                    disabled={reviewSubmitting}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {reviewSubmitting ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountProfile;
