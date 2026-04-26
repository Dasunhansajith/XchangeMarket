import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaPlus, FaTrash, FaCalendarAlt, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { promotionService } from '../services/promotion_service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPromotions = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage',
        value: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        scope: 'all'
    });

    useEffect(() => {
        if (user) {
            loadPromotions();
        }
    }, [user]);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const myPromos = await promotionService.getAdminPromotions();
            setPromotions(myPromos);
        } catch (error) {
            toast.error("Failed to load admin promotions");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await promotionService.createPromotion({
                ...formData,
                createdBy: 'ADMIN' // Set to ADMIN instead of default SELLER
            });
            
            toast.success('Site-wide Promotion created successfully!');
            setIsAdding(false);
            setFormData({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', scope: 'all' });
            loadPromotions();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this site-wide promotion?')) {
            try {
                await promotionService.deletePromotion(id);
                toast.success('Promotion deleted');
                loadPromotions();
            } catch (error) {
                toast.error("Failed to delete promotion");
            }
        }
    };

    const getStatusBadge = (promo) => {
        if (promo.isExpired) {
            return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaClock /> Expired</span>;
        }
        if (promo.usageLimit && promo.currentUsage >= promo.usageLimit) {
            return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaExclamationTriangle /> Limit Reached</span>;
        }
        return <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaCheckCircle /> Active</span>;
    };

    return (
        <div className="space-y-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FaTag className="text-red-500" />
                        Site-wide Promotions
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage global discounts and site-wide offers.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    {isAdding ? 'Cancel' : <><FaPlus /> Create Site-wide Promotion</>}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 p-6 rounded-2xl border border-gray-200"
                    >
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Promotion Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g. Summer Mega Sale"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                                <select 
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (Rs)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Value</label>
                                <input 
                                    type="number" required min="1"
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                                        formData.type === 'percentage' && formData.value > 100 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder={formData.type === 'percentage' ? '20' : '500'}
                                    value={formData.value}
                                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                                />
                                {formData.type === 'percentage' && formData.value > 100 && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">Cannot exceed 100%</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <input 
                                    type="datetime-local" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                <input 
                                    type="datetime-local" required
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                                        formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                />
                                {formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate) && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">Must be after start date</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Usage Limit (Optional)</label>
                                <input 
                                    type="number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g. 100 uses total"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                />
                            </div>

                            <div className="col-span-full flex justify-end gap-3 mt-4">
                                <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all">
                                    Save Promotion
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl h-48 animate-pulse">
                            <div className="flex justify-between mb-4">
                                <div className="h-6 w-32 bg-gray-100 rounded-lg"></div>
                                <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                            </div>
                            <div className="h-10 w-24 bg-gray-50 rounded-lg mb-4"></div>
                            <div className="flex gap-4">
                                <div className="h-10 flex-1 bg-gray-50 rounded-xl"></div>
                                <div className="h-10 flex-1 bg-gray-50 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {promotions.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-24 text-center bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100"
                        >
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <FaTag className="text-4xl text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">No site-wide campaigns active</h3>
                            <p className="text-gray-400 mt-2 font-medium">Create global discounts to boost platform sales.</p>
                        </motion.div>
                    ) : (
                        promotions.map((promo) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={promo.id}
                                className={`group relative bg-white border p-6 rounded-[32px] transition-all duration-500 hover:shadow-2xl hover:shadow-gray-100/50 ${
                                    promo.isExpired ? 'border-gray-100 opacity-75' : 
                                    (promo.usageLimit && promo.currentUsage >= promo.usageLimit) ? 'border-red-100' : 'border-gray-100 hover:border-red-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-gray-900 text-lg tracking-tight">{promo.name}</h3>
                                            {getStatusBadge(promo)}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-red-600 tracking-tighter">
                                                {promo.discountType === 'PERCENTAGE' ? `${promo.value}%` : `Rs ${promo.value}`}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OFF</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(promo.id)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 rounded-2xl hover:bg-red-50 transition-all duration-300"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <FaCalendarAlt className="text-red-400" />
                                            <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Usage Limit</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <FaChartPie className="text-red-400" />
                                            <span>{promo.currentUsage || 0} / {promo.usageLimit || '∞'} Used</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: promo.usageLimit ? `${(promo.currentUsage / promo.usageLimit) * 100}%` : '0%' }}
                                            className={`h-full ${promo.isExpired ? 'bg-gray-300' : 'bg-red-500'}`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-300 ml-4 whitespace-nowrap tracking-tighter uppercase">ID: {promo.id.substring(0, 8)}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;
