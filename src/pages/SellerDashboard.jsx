import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaPlus, FaChartLine, FaEdit, FaTrash, FaUpload, FaStore, FaMoneyBillWave, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        stockQuantity: '',
        description: '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit total images to 5
        if (formData.images.length + files.length > 5) {
            toast.error("You can only upload up to 5 images");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, base64String]
                }));
                setImagePreviews(prev => [...prev, base64String]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const fetchMyProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productAPI.getMyProducts();
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyProducts();
    }, [fetchMyProducts]);

    const handleAddProductClick = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            stockQuantity: product.stockQuantity.toString(),
            description: product.description,
            images: product.images || [],
        });
        setImagePreviews(product.images || []);
        setActiveTab('add');
    };

    const confirmSubmit = async () => {
        try {
            setLoading(true);
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                status: 'Active'
            };

            if (editingProduct) {
                await productAPI.updateProduct(editingProduct.id, productData);
                toast.success('Product updated successfully!');
            } else {
                await productAPI.createProduct(productData);
                toast.success('Product published successfully!');
            }

            setFormData({ name: '', price: '', category: '', stockQuantity: '', description: '', images: [] });
            setImagePreviews([]);
            setEditingProduct(null);
            setShowConfirmModal(false);
            setActiveTab('manage');
            fetchMyProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            setLoading(true);
            await productAPI.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success('Product deleted successfully!');
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    const renderDashboardOverview = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Store Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <FaBox className="text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Products</p>
                        <h3 className="text-2xl font-bold text-gray-800">{products.length}</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <FaMoneyBillWave className="text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">Rs 1.2M</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <FaChartLine className="text-xl" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Store Views</p>
                        <h3 className="text-2xl font-bold text-gray-800">2,435</h3>
                    </div>
                </motion.div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <p className="text-gray-500 text-sm">You haven't had any recent sales. Add more products to increase visibility!</p>
            </div>
        </div>
    );

    const renderManageProducts = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
                <button onClick={() => setActiveTab('add')} className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition">
                    <FaPlus /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 font-semibold text-gray-700">Product Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{product.name}</div>
                                    <div className="text-sm text-gray-500">Shop: {product.shopId || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">Rs {product.price?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-600">{product.stockQuantity}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {product.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <FaBox className="text-4xl mb-3 opacity-20" />
                                        <p>No products found. Start by adding a new product.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex items-center justify-center text-red-600">
                                        <FaSpinner className="animate-spin text-2xl mr-2" />
                                        <span>Loading products...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAddProduct = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleAddProductClick} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. iPhone 15 Pro Max"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"
                        >
                            <option value="">Select Category</option>
                            <option value="Mobiles">Mobiles</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Property">Property</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="e.g. 150000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                            type="number"
                            required
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                            placeholder="e.g. 10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        rows="4"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product features, condition, and warranty..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 5)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <AnimatePresence>
                            {imagePreviews.map((preview, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {imagePreviews.length < 5 && (
                            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer">
                                <FaPlus className="text-gray-400 text-xl mb-1" />
                                <span className="text-xs text-gray-500 font-medium">Add Image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => { setActiveTab('manage'); setEditingProduct(null); }} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-500/30 flex items-center gap-2">
                        {loading && <FaSpinner className="animate-spin" />}
                        {editingProduct ? 'Update Product' : 'Publish Product'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderConfirmModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100"
            >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">Confirm Product Details</h3>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Product Name:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Category:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.category}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Price:</span>
                            <span className="text-gray-800 font-semibold text-right">Rs {parseFloat(formData.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 font-medium">Stock:</span>
                            <span className="text-gray-800 font-semibold text-right">{formData.stockQuantity}</span>
                        </div>
                        <div className="pt-2">
                            <span className="text-gray-500 font-medium block mb-2">Images:</span>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {imagePreviews.map((preview, idx) => (
                                    <img key={idx} src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                ))}
                                {imagePreviews.length === 0 && <span className="text-gray-400 text-sm">No images uploaded</span>}
                            </div>
                        </div>
                        <div className="pt-2">
                            <span className="text-gray-500 font-medium block mb-2">Description:</span>
                            <p className="text-gray-800 text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm max-h-32 overflow-y-auto whitespace-pre-wrap">{formData.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-center font-medium">Are you sure you want to {editingProduct ? 'update' : 'publish'} this product?</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        Review
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={confirmSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-500/30 font-medium flex items-center gap-2"
                    >
                        {loading && <FaSpinner className="animate-spin" />}
                        {editingProduct ? 'Update Now' : 'Confirm & Publish'}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {showConfirmModal && renderConfirmModal()}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2 sticky top-24">
                            <div className="mb-6 px-4 py-2">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FaStore className="text-red-600" /> My Store
                                </h3>
                            </div>

                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaChartLine /> Dashboard
                            </button>

                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'manage' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaBox /> Manage Products
                            </button>

                            <button
                                onClick={() => setActiveTab('add')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'add' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <FaPlus /> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'dashboard' && renderDashboardOverview()}
                            {activeTab === 'manage' && renderManageProducts()}
                            {activeTab === 'add' && renderAddProduct()}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
