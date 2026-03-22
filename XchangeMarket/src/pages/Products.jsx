import React, { useState, useEffect, useMemo } from 'react';
import { productAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { FaSpinner, FaBoxOpen, FaSearch, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../components/CategoryGrid';

const CATEGORIES = ['All', 'Mobiles', 'Vehicles', 'Electronics', 'Property', 'Fashion'];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                const response = await productAPI.getAllProducts();
                // Handle potential pagination format (content array) or direct array
                const productsData = response.data.content || response.data;
                const dataArray = Array.isArray(productsData) ? productsData : [];
                setProducts(dataArray);
            } catch (error) {
                console.error('Error fetching all products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    // Filter logic
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchQuery, selectedCategory]);

    // Extract dynamic categories from products and ensure all are represented
    const availableCategories = useMemo(() => {
        const dynamicCats = new Set(products.map(p => p.category).filter(Boolean));
        const combinedCats = new Set([...CATEGORIES, ...dynamicCats]);
        const sortedCats = Array.from(combinedCats).sort((a, b) => a.localeCompare(b));
        // Always keep 'All' at the beginning
        return ['All', ...sortedCats.filter(c => c !== 'All')];
    }, [products]);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Sub-section */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Explore All <span className="text-red-600">Products</span>
                    </h1>
                    <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
                    <p className="mt-4 text-lg text-gray-600 font-medium">Discover top-quality items across all categories from our trusted sellers.</p>
                </div>

                {/* Filter & Search Section */}
                <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Search Bar - More compact */}
                    <div className="relative w-full md:w-1/3 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for products, brands, or features..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block pl-12 p-4 transition-all duration-300 shadow-sm focus:bg-white"
                        />
                    </div>

                    {/* Category Tabs Container - Wider to fill space */}
                    <div className="w-full md:w-2/3 relative overflow-hidden">
                        {/* Gradient Masks for fading effect at edges */}
                        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                        <div className="overflow-x-auto pb-4 pt-1 px-4 flex items-center gap-3 scroll-smooth custom-scrollbar">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory('All')}
                                className={`relative flex-shrink-0 flex items-center p-3 px-6 rounded-2xl border transition-all duration-300 group ${selectedCategory === 'All'
                                    ? 'border-red-500 bg-white shadow-lg ring-1 ring-red-500/20'
                                    : 'border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-red-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-full mr-3 transition-colors ${selectedCategory === 'All' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                                    <FaBoxOpen className="w-4 h-4" />
                                </div>
                                <span className={`font-bold text-sm whitespace-nowrap ${selectedCategory === 'All' ? 'text-red-600' : 'text-gray-700 group-hover:text-red-600'}`}>
                                    All Products
                                </span>
                            </motion.button>

                            {availableCategories.filter(cat => cat !== 'All').map((category) => {
                                // Find icon and color data from CategoryGrid
                                const categoryData = categories.find(c => c.name === category);
                                const Icon = categoryData?.icon || FaFilter;
                                const colorClass = categoryData?.color || 'text-gray-400';
                                const bgClass = categoryData?.bg || 'bg-gray-100';

                                return (
                                    <motion.button
                                        key={category}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`relative flex-shrink-0 flex items-center p-3 px-6 rounded-2xl border transition-all duration-300 group ${selectedCategory === category
                                            ? 'border-red-500 bg-white shadow-lg ring-1 ring-red-500/20'
                                            : 'border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-red-200'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full mr-3 transition-colors ${selectedCategory === category
                                            ? 'bg-red-500 text-white shadow-sm'
                                            : `${bgClass} ${colorClass} group-hover:bg-red-50 group-hover:text-red-500`
                                            }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className={`font-bold text-sm whitespace-nowrap ${selectedCategory === category ? 'text-red-600' : 'text-gray-700 group-hover:text-red-600'}`}>
                                            {category}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-5xl text-red-600 mb-4" />
                        <p className="text-gray-500 font-medium animate-pulse">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-80 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
                    >
                        <FaSearch className="text-7xl mb-4 text-gray-200" />
                        <h3 className="text-2xl font-bold text-gray-800">No matches found</h3>
                        <p className="text-gray-500 mt-2 max-w-md">We couldn't find any products matching "{searchQuery}" in the {selectedCategory} category. Try adjusting your search or filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-6 px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => {
                                // Safe price handling
                                let safePrice = 0;
                                if (product.price) {
                                    safePrice = typeof product.price === 'number'
                                        ? product.price
                                        : parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
                                }

                                // Safe images handling
                                let safeImages = [];
                                if (product.images) {
                                    if (Array.isArray(product.images)) {
                                        safeImages = product.images;
                                    } else if (typeof product.images === 'string') {
                                        try {
                                            const parsed = JSON.parse(product.images);
                                            safeImages = Array.isArray(parsed) ? parsed : [product.images];
                                        } catch (e) {
                                            if (product.images.trim().startsWith('[') || product.images.trim().startsWith('{')) {
                                                safeImages = [];
                                            } else {
                                                safeImages = [product.images];
                                            }
                                        }
                                    }
                                }

                                return (
                                    <motion.div
                                        key={product.id || index}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <VehicleCard
                                            id={product.id}
                                            title={product.name}
                                            seller={product.shopId ? `Shop #${product.shopId}` : "Trusted Seller"}
                                            price={`Rs ${safePrice.toLocaleString()}`}
                                            location="Sri Lanka"
                                            images={safeImages.length > 0 ? safeImages : []}
                                            badgeText={product.category || "New Arrival"}
                                            description={product.description ? product.description.toString().split('\n') : ["No description available."]}
                                            offerPercentage={product.stockQuantity > 0 ? 'Available' : 'Unavailable'}
                                            stockQuantity={product.stockQuantity}
                                            contactNumber={product.contactNumber || product.sellerPhone || "94766414622"}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
