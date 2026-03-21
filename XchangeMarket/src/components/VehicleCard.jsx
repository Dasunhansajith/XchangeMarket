import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import peoplesBankLogo from '../assets/peoplesbank.png';

export const CheckoutModal = ({ isOpen, onClose, product, priceRaw, contactNumber }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment/Review
    const [quantity, setQuantity] = useState(1);

    // Parse price: remove "Rs", commas, spaces
    const numericPrice = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

    const [shippingDetails, setShippingDetails] = useState({
        name: user?.fullName || user?.name || '',
        address: user?.address || '',
        zip: '',
        district: 'Other'
    });

    // Update shipping details when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setShippingDetails(prev => {
                // If fields are empty, autofill from user profile
                const newName = !prev.name.trim() ? (user.fullName || user.name || '') : prev.name;
                const newAddress = !prev.address.trim() ? (user.address || '') : prev.address;

                return {
                    ...prev,
                    name: newName,
                    address: newAddress
                };
            });
        }
    }, [isOpen, user]);

    const [deliveryFee, setDeliveryFee] = useState(450);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        if (shippingDetails.district === 'Colombo') {
            setDeliveryFee(200);
        } else {
            setDeliveryFee(450);
        }
    }, [shippingDetails.district]);

    const total = (numericPrice * quantity) + deliveryFee;

    const handleInputChange = (e) => {
        setShippingDetails({
            ...shippingDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleBuy = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
        } else {
            alert(`Order Placed Successfully! Total: Rs ${total.toLocaleString()}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Checkout</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Product Summary */}
                    <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 items-center">
                        <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{product.title}</h4>
                            <p className="text-sm text-gray-500">Rs {numericPrice.toLocaleString()}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors font-bold"
                            >
                                -
                            </button>
                            <span className="font-bold text-sm min-w-[20px] text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Shipping Form */}
                    <div className="space-y-4 mb-6">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Shipping Address
                        </h4>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={shippingDetails.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={shippingDetails.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="zip"
                                placeholder="Zip Code"
                                value={shippingDetails.zip}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all"
                            />
                            <select
                                name="district"
                                value={shippingDetails.district}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm transition-all bg-white cursor-pointer"
                            >
                                <option value="Other">Other District</option>
                                <option value="Colombo">Colombo</option>
                            </select>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Payment Method
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center p-3 border border-gray-100 rounded-lg bg-gray-50 opacity-50 cursor-not-allowed">
                                <input type="radio" disabled className="text-gray-400" />
                                <span className="ml-3 text-sm font-medium text-gray-500">Card Payment (Unavailable)</span>
                            </div>

                            <div
                                onClick={() => setPaymentMethod('online')}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'online'}
                                    onChange={() => setPaymentMethod('online')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">Online Transfer</span>
                            </div>

                            <div
                                onClick={() => setPaymentMethod('cod')}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">Cash On Delivery</span>
                            </div>
                        </div>

                        {paymentMethod === 'online' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 bg-white rounded-md p-1 shadow-sm flex items-center justify-center overflow-hidden">
                                        <img
                                            src={peoplesBankLogo}
                                            alt="Peoples Bank"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm">People's Bank</h5>
                                        <p className="text-xs text-blue-600 font-medium">Bank Transfer Details</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm bg-white p-3 rounded-lg border border-blue-100">
                                    <div className="flex justify-between border-b border-gray-50 pb-2 mb-2">
                                        <span className="text-gray-500">Account Name</span>
                                        <span className="font-bold text-gray-900 text-right">KD Hasanjith Ariyasena</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 text-xs uppercase tracking-wider">Account Number</span>
                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                                            <span className="font-mono font-bold text-blue-700 text-lg tracking-widest">052200100100784</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('052200100100784');
                                                    alert('Account number copied!');
                                                }}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                title="Copy"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-blue-500 mt-2 text-center font-medium">
                                    Please upload the transfer receipt or send it via WhatsApp after placing the order.
                                </p>
                                <button
                                    onClick={() => {
                                        const message = `Hi, I have placed an order for ${product.title}. Here is the payment slip.`;
                                        window.open(`https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                    Send Slip on WhatsApp
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>Rs {(numericPrice * quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Delivery Fee ({shippingDetails.district})</span>
                            <span>Rs {deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                            <span>Total</span>
                            <span>Rs {total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleBuy}
                        disabled={!shippingDetails.name || !shippingDetails.address}
                        className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-gray-200"
                    >
                        Place Order
                    </button>
                    {(!shippingDetails.name || !shippingDetails.address) && (
                        <p className="text-xs text-center text-red-500 mt-2">Please fill in all details to proceed.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const VehicleCard = ({
    image,
    images = [],
    title,
    mileage,
    seller,
    price = "Price Negotiable",
    location = "Colombo, Sri Lanka",
    specifications = {},
    description = [],
    contactNumber = "94766414622",
    offerPercentage = "0%",
    badgeText = "New Arrival"
}) => {
    // Combine single image prop into the array if no images array is provided
    const sliderImages = images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=2574&auto=format&fit=crop"];

    // Wishlist
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlistProduct = {
        id: title,
        title,
        name: title,
        price,
        image: sliderImages[0],
        seller,
        location,
        contactNumber,
    };
    const isWishlisted = isInWishlist(wishlistProduct);

    // State for the card's internal slider (preview)
    const [previewIndex, setPreviewIndex] = useState(0);

    // State for the details modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for Checkout Modal
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // State for the full-screen image gallery
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Auto-advance the card preview slider
    useEffect(() => {
        if (sliderImages.length <= 1) return;

        const interval = setInterval(() => {
            setPreviewIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [sliderImages.length]);

    // Prevent body scroll when any modal is open
    useEffect(() => {
        if (isModalOpen || isGalleryOpen || isCheckoutOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset gallery index when gallery is closed to avoid confusion
            if (!isGalleryOpen) setGalleryIndex(0);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, isGalleryOpen, isCheckoutOpen]);

    const handleWhatsAppClick = () => {
        const message = `Hi, I'm interested in the ${title} listed on Xchange.`;
        window.open(`https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const openGallery = (index) => {
        setGalleryIndex(index);
        setIsGalleryOpen(true);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setGalleryIndex((prev) => (prev + 1) % sliderImages.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setGalleryIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    };

    const isTechItem = !mileage || mileage === "N/A";

    return (
        <>
            {/* Main Card */}
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer transform hover:-translate-y-1 overflow-hidden"
            >
                {/* Preview Image Container */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                    {sliderImages.map((img, index) => (
                        <div key={index} className="absolute inset-0 w-full h-full">
                            <img
                                src={img}
                                alt={`${title} - ${index + 1}`}
                                className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === previewIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                        </div>
                    ))}

                    {/* Dots */}
                    {sliderImages.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {sliderImages.map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    layout
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === previewIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(wishlistProduct);
                        }}
                        className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                            isWishlisted
                                ? 'bg-rose-500 text-white shadow-rose-500/40'
                                : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isWishlisted ? '0' : '2'}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg z-10 uppercase tracking-widest">
                        {badgeText}
                    </div>

                    <div className="absolute bottom-3 right-3 z-10">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            {sliderImages.length} Photos
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center text-gray-500 text-xs font-medium mb-4">
                        <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {location}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                            {mileage && mileage !== "N/A" ? (
                                <>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Mileage</span>
                                    <span className="font-bold text-gray-800">{mileage}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Offer</span>
                                    <span className="font-bold text-green-600">{offerPercentage}</span>
                                </>
                            )}
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Seller</span>
                            <span className="font-bold text-gray-800 truncate w-full px-1">{seller}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Price</span>
                            <span className="text-xl font-extrabold text-gray-900 tracking-tight">{price}</span>
                        </div>
                        <button className="bg-gray-900 text-white p-2.5 rounded-full hover:bg-red-600 transition-all duration-300 shadow-md group-hover:scale-110">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Side - Images */}
                            <div className="w-full md:w-1/2 p-4 md:p-6 bg-gray-50">
                                <div
                                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 mb-4 shadow-sm cursor-zoom-in group"
                                    onClick={() => openGallery(0)}
                                >
                                    <img
                                        src={sliderImages[0]}
                                        alt={title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            View {sliderImages.length} Photos
                                        </span>
                                    </div>

                                    {sliderImages.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                            +{sliderImages.length - 1} photos
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{price}</h2>
                                    <p className="text-gray-500 flex items-center justify-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {location}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="w-full md:w-1/2 p-4 md:p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{title}</h2>

                                <div className="space-y-3 mb-6">
                                    {Object.entries(specifications).map(([key, value]) => (
                                        <div key={key} className="flex border-b border-gray-100 pb-2 last:border-0">
                                            <span className="text-gray-500 w-1/3 text-sm">{key}:</span>
                                            <span className="text-gray-900 font-medium w-2/3 text-sm">{value}</span>
                                        </div>
                                    ))}
                                    {/* Default specs if none provided */}
                                    {Object.keys(specifications).length === 0 && (
                                        <>
                                            <div className="flex border-b border-gray-100 pb-2">
                                                <span className="text-gray-500 w-1/3 text-sm">Mileage:</span>
                                                <span className="text-gray-900 font-medium w-2/3 text-sm">{mileage}</span>
                                            </div>
                                            <div className="flex border-b border-gray-100 pb-2">
                                                <span className="text-gray-500 w-1/3 text-sm">Seller:</span>
                                                <span className="text-gray-900 font-medium w-2/3 text-sm">{seller}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                                    <ul className="space-y-1 text-gray-600 text-sm">
                                        {description.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {isTechItem ? (
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false); // Close details
                                            setIsCheckoutOpen(true); // Open checkout
                                        }}
                                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        Buy Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleWhatsAppClick}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                        </svg>
                                        Contact via WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                product={{ title, image: sliderImages[0] }}
                priceRaw={price}
                contactNumber={contactNumber}
            />

            {/* Full Screen Image Gallery */}
            {isGalleryOpen && createPortal(
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={() => setIsGalleryOpen(false)}>
                    {/* Close Button */}
                    <button
                        onClick={() => setIsGalleryOpen(false)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 text-white"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Navigation Buttons */}
                    {sliderImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-50"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Main Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={sliderImages[galleryIndex]}
                            alt={`${title} - Full Screen ${galleryIndex + 1}`}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                        />

                        {/* Image Counter */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm">
                            {galleryIndex + 1} / {sliderImages.length}
                        </div>
                    </div>

                    {/* Thumbnails Strip */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                        {sliderImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setGalleryIndex(idx)}
                                className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${idx === galleryIndex ? 'border-blue-500 opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
                , document.body)}
        </>
    );
};

export default VehicleCard;
