import React, { useState, useEffect, useMemo } from 'react';
import { productAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { FaSpinner, FaBoxOpen, FaSearch, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Mobiles', 'Vehicles', 'Electronics', 'Property', 'Home', 'Fashion'];

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

    // Extract dynamic categories from products in case they added custom ones (Optional enhancement)
    const availableCategories = useMemo(() => {
        const dynamicCats = new Set(products.map(p => p.category).filter(Boolean));
        const combinedCats = new Set([...CATEGORIES, ...dynamicCats]);
        return Array.from(combinedCats);
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
                    {/* Search Bar */}
                    <div className="relative w-full md:w-1/2 group">
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

                    {/* Category Tabs */}
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {availableCategories.slice(0, 6).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${selectedCategory === category
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
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
                                            title={product.name}
                                            seller={product.shopId ? `Shop #${product.shopId}` : "Trusted Seller"}
                                            price={`Rs ${safePrice.toLocaleString()}`}
                                            location="Sri Lanka"
                                            images={safeImages.length > 0 ? safeImages : []}
                                            badgeText={product.category || "New Arrival"}
                                            description={product.description ? product.description.toString().split('\n') : ["No description available."]}
                                            mileage={product.category === 'Vehicles' ? 'Used' : 'N/A'}
                                            offerPercentage={product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
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
