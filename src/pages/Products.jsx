import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { productAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { FaSpinner, FaBoxOpen, FaSearch, FaFilter, FaMapMarkerAlt, FaChevronDown, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { categories } from '../components/CategoryGrid';
import { locationData } from '../data/locations';

const CATEGORIES = ['All', 'Mobiles', 'Vehicles', 'Electronics', 'Property', 'Fashion'];

// Memoized card component to prevent unnecessary re-renders
const ProductCardMemo = memo(({ product, index }) => {
    let safePrice = 0;
    if (product.price) {
        safePrice = typeof product.price === 'number'
            ? product.price
            : parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
    }

    let safeImages = [];
    if (product.images) {
        if (Array.isArray(product.images)) {
            safeImages = product.images;
        } else if (typeof product.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                safeImages = Array.isArray(parsed) ? parsed : [product.images];
            } catch (e) {
                safeImages = product.images.trim().startsWith('[') || product.images.trim().startsWith('{') ? [] : [product.images];
            }
        }
    }

    // Compose display location: "City, District" format
    const displayLocation = [product.city, product.district]
        .filter(Boolean)
        .join(', ') || 'Sri Lanka';

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
                seller={product.shopName || "Trusted Seller"}
                price={`Rs ${safePrice.toLocaleString()}`}
                location={displayLocation}
                images={safeImages.length > 0 ? safeImages : []}
                badgeText={product.category || "New Arrival"}
                description={product.description ? product.description.toString().split('\n') : ["No description available."]}
                offerPercentage={product.stockQuantity > 0 ? 'Available' : 'Unavailable'}
                stockQuantity={product.stockQuantity}
                averageRating={product.averageRating || 0}
                contactNumber={product.contactNumber || product.sellerPhone || "94766414622"}
            />
        </motion.div>
    );
});

ProductCardMemo.displayName = 'ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 20;

    // Search & Category filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Location state
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Use ref to track the latest fetch request and prevent race conditions
    const fetchIdRef = useRef(0);

    // --- API Fetch Logic ---
    const fetchProducts = useCallback(async (page = 0, isLoadMore = false) => {
        const currentFetchId = ++fetchIdRef.current;
        try {
            setLoading(true);
            let response;

            if (selectedDistrict || selectedCity) {
                const params = {
                    page: page,
                    size: PAGE_SIZE
                };
                if (selectedDistrict) params.district = selectedDistrict;
                if (selectedCity) params.city = selectedCity;
                
                response = await productAPI.getProductsByLocation(params);
            } else {
                response = await productAPI.getAllProducts(page, PAGE_SIZE);
            }

            if (currentFetchId !== fetchIdRef.current) return;

            const productsData = response?.data?.content || response?.data;
            const dataArray = Array.isArray(productsData) ? productsData : [];
            
            if (isLoadMore) {
                setProducts(prev => [...prev, ...dataArray]);
            } else {
                setProducts(dataArray);
            }
            
            setCurrentPage(page + 1);
            setHasMore(dataArray.length === PAGE_SIZE);
        } catch (error) {
            if (currentFetchId !== fetchIdRef.current) return;
            console.error('Error fetching products:', error);
            if (!isLoadMore) toast.error('Failed to load products. Please try again.');
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    }, [selectedDistrict, selectedCity]);

    // Initial fetch when filters change
    useEffect(() => {
        fetchProducts(0, false);
    }, [fetchProducts]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchProducts(currentPage, true);
        }
    };

    // --- Filter logic (client-side search + category on top of API results) ---
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch =
                product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchQuery, selectedCategory]);

    // Extract dynamic categories from products
    const availableCategories = useMemo(() => {
        const dynamicCats = new Set(products.map(p => p.category).filter(Boolean));
        const combinedCats = new Set([...CATEGORIES, ...dynamicCats]);
        const sortedCats = Array.from(combinedCats).sort((a, b) => a.localeCompare(b));
        return ['All', ...sortedCats.filter(c => c !== 'All')];
    }, [products]);

    // --- Empty state message ---
    const emptyStateMessage = useMemo(() => {
        if (searchQuery) {
            return {
                title: 'No matches found',
                sub: `We couldn't find any products matching "${searchQuery}"${selectedCategory !== 'All' ? ` in the ${selectedCategory} category` : ''}. Try adjusting your search.`,
            };
        }
        if (selectedDistrict) {
            const locationName = selectedCity || selectedDistrict;
            return {
                title: `No products found in ${locationName}`,
                sub: `There are currently no listings in ${locationName}. Try a different location or browse all products.`,
            };
        }
        return {
            title: 'No products available',
            sub: 'There are no products listed yet. Check back soon!',
        };
    }, [searchQuery, selectedDistrict, selectedCity, selectedCategory]);

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Explore All <span className="text-red-600">Products</span>
                    </h1>
                    <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
                    <p className="mt-4 text-lg text-gray-600 font-medium">Discover top-quality items across all categories from our trusted sellers.</p>
                </div>

                {/* Filter & Search Section */}
                <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 relative z-50">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2 relative z-50">

                        {/* 1. Search Bar */}
                        <div className="relative w-full md:w-1/5 group flex-shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400 group-focus-within:text-red-500 transition-colors text-sm" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block pl-10 p-3 transition-all duration-300 shadow-sm focus:bg-white"
                            />
                        </div>

                        {/* 2. District & City Dropdowns */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-1/3 flex-shrink-0 relative z-[60]">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setSelectedCity(''); // Reset city when district changes
                                }}
                                className={`w-full sm:w-1/2 p-3 text-sm rounded-xl border transition-all duration-300 shadow-sm focus:bg-white outline-none font-medium cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat pr-10 ${selectedDistrict ? 'border-red-300 bg-red-50 text-red-900' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-red-500 focus:border-red-500'}`}
                            >
                                <option value="">District (All)</option>
                                {Object.keys(locationData).sort().map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!selectedDistrict}
                                className={`w-full sm:w-1/2 p-3 text-sm rounded-xl border transition-all duration-300 shadow-sm focus:bg-white outline-none font-medium cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat pr-10 ${!selectedDistrict ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70' : selectedCity ? 'border-red-300 bg-red-50 text-red-900' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-red-500 focus:border-red-500'}`}
                            >
                                <option value="">City (All)</option>
                                {selectedDistrict && locationData[selectedDistrict].sort().map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Category Tabs */}
                        <div className="w-full md:flex-1 relative overflow-hidden flex-shrink border-l border-gray-100 pl-4">
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
                </div>

                {/* Product Grid / States */}
                {loading && products.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-5xl text-red-600 mb-4" />
                        <p className="text-gray-500 font-medium animate-pulse">
                            {selectedDistrict
                                ? `Loading products in ${selectedCity || selectedDistrict}...`
                                : 'Loading products...'}
                        </p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-80 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
                    >
                        <FaMapMarkerAlt className={`text-7xl mb-4 ${selectedDistrict ? 'text-red-200' : 'text-gray-200'}`} />
                        <h3 className="text-2xl font-bold text-gray-800">{emptyStateMessage.title}</h3>
                        <p className="text-gray-500 mt-2 max-w-md">{emptyStateMessage.sub}</p>
                        <div className="flex gap-3 mt-6">
                            {(selectedDistrict !== '' || searchQuery !== '' || selectedCategory !== 'All') && (
                                <button
                                    onClick={() => {
                                        setSelectedDistrict('');
                                        setSelectedCity('');
                                        setSearchQuery('');
                                        setSelectedCategory('All');
                                    }}
                                    className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredProducts.map((product, index) => (
                                    <ProductCardMemo key={product.id || index} product={product} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>
                        {hasMore && filteredProducts.length > 0 && (
                            <div className="flex justify-center mt-12">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More <FaChevronDown />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;
