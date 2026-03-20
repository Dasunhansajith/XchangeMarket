import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);

    // Dummy notifications data
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Your order for BMW 520d is confirmed.", time: "10 mins ago", unread: true },
        { id: 2, text: "New message from seller Dasun Cars.", time: "1 hour ago", unread: true },
        { id: 3, text: "Price dropped for Apple Watch SE 3!", time: "2 days ago", unread: false }
    ]);

    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                // Using OpenStreetMap Nominatim for reverse geocoding (free, no key required for simple usage)
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
                        setLocation(city);
                    })
                    .catch(error => console.error("Error fetching location:", error));
            }, (error) => {
                console.error("Error getting location:", error);
                setLocation("Loc: N/A");
            });
        } else {
            setLocation("Loc: N/A");
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center group cursor-pointer">
                        <Link to="/" className="text-4xl font-black tracking-tighter flex items-center gap-1">
                            <span className="text-red-600 group-hover:scale-110 transition-transform duration-300">X</span>
                            <span className="text-blue-900 transition-colors">CHANGE</span>
                        </Link>
                    </div>

                    {/* Search Bar - Modern & Minimal */}
                    <div className="hidden md:flex flex-1 items-center justify-center px-12">
                        <div className="w-full max-w-lg relative group">
                            <input
                                type="text"
                                placeholder={t.search}
                                className="w-full px-6 py-3 pl-12 pr-4 rounded-full border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-300 shadow-sm group-hover:shadow-md"
                            />
                            <div className="absolute left-4 top-3.5 text-gray-400 group-hover:text-red-500 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
                        {/* Links section */}
                        <div className="flex items-center space-x-6 xl:space-x-8">
                            <Link to="/" className="font-bold text-[13px] xl:text-sm uppercase tracking-wider text-gray-700 hover:text-red-600 transition duration-300 relative group py-2">
                                {t.home}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link to="/products" className="font-bold text-[13px] xl:text-sm uppercase tracking-wider text-gray-700 hover:text-red-600 transition duration-300 relative group py-2">
                                {t.products || 'Products'}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link to="/about" className="font-bold text-[13px] xl:text-sm uppercase tracking-wider text-gray-700 hover:text-red-600 transition duration-300 relative group py-2">
                                {t.about}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                            <Link to="/contact" className="font-bold text-[13px] xl:text-sm uppercase tracking-wider text-gray-700 hover:text-red-600 transition duration-300 relative group py-2">
                                {t.contact}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>

                            {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN')) && (
                                <Link to="/admin/dashboard" className="font-bold text-[13px] xl:text-sm uppercase tracking-wider text-red-600 hover:text-red-700 transition duration-300 relative group py-2">
                                    ADMIN PANEL
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>

                        {/* Actions section */}
                        <div className="flex items-center space-x-5 xl:space-x-6">
                            {/* Notification Icon */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors relative group rounded-full hover:bg-gray-100"
                                >
                                    <svg className="w-6 h-6 group-hover:animate-swing origin-top" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {notifications.filter(n => n.unread).length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                                    {notifications.filter(n => n.unread).length} New
                                                </span>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto">
                                                {notifications.length > 0 ? notifications.map(notif => (
                                                    <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/20' : ''}`} onClick={() => {
                                                        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                                                    }}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-red-500' : 'bg-transparent'}`}></div>
                                                            <div>
                                                                <p className={`text-sm leading-snug ${notif.unread ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{notif.text}</p>
                                                                <p className="text-xs text-gray-400 mt-1.5">{notif.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                                                )}
                                            </div>
                                            <div className="p-3 text-center border-t border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-sm font-semibold text-blue-600">
                                                View All Notifications
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account</span>
                                        <span className="text-[13px] font-bold text-gray-800 leading-tight max-w-[120px] truncate">{user?.fullName || user?.name || 'User'}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="font-bold text-[11px] uppercase tracking-widest text-gray-500 hover:text-red-600 transition duration-300 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                                    >
                                        LOGOUT
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="font-bold text-sm uppercase tracking-wider text-gray-700 hover:text-red-600 transition duration-300">
                                    {t.login}
                                </Link>
                            )}

                            <Link
                                to={isAuthenticated ? (user?.hasShop ? "/seller-dashboard" : "/become-seller") : "/login?role=seller"}
                                className="px-6 py-2.5 rounded-full font-bold text-[12px] uppercase tracking-widest text-white bg-black hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                            >
                                <span>{isAuthenticated && user?.hasShop ? "DASHBOARD" : t.becomeSeller}</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>

                            <button
                                onClick={toggleLanguage}
                                className="bg-gray-50 border border-gray-100 text-gray-800 hover:bg-gray-100 font-black py-2 px-3 rounded-lg transition-colors duration-300 text-[11px] uppercase tracking-widest shadow-sm"
                            >
                                {language === 'EN' ? 'සිං' : 'EN'}
                            </button>

                            {/* Location Icon & Dropdown */}
                            <div className="relative hidden md:flex items-center">
                                <button
                                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors relative group rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    title="View Location"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce origin-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {location && location !== "Loc: N/A" && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </button>

                                {isLocationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <h3 className="font-bold text-gray-900 text-sm">Your Location</h3>
                                            </div>
                                            <div className="p-6 text-center">
                                                {location && location !== "Loc: N/A" ? (
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Detected Area</p>
                                                        <p className="text-lg font-black text-blue-900 uppercase tracking-wider">{location}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Location not available. Please allow browser location access.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center space-x-3">
                        {/* Mobile Location Icon */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLocationOpen(!isLocationOpen)}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                                title="View Location"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {location && location !== "Loc: N/A" && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </button>
                            {isLocationOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
                                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <h3 className="font-bold text-gray-900 text-sm">Your Location</h3>
                                        </div>
                                        <div className="p-6 text-center">
                                            {location && location !== "Loc: N/A" ? (
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Detected Area</p>
                                                    <p className="text-lg font-black text-blue-900 uppercase tracking-wider">{location}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Location not available.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Notification Icon */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {notifications.filter(n => n.unread).length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="text-[11px] uppercase tracking-widest font-black bg-gray-50 border border-gray-100 p-2 rounded-lg"
                        >
                            {language === 'EN' ? 'සිං' : 'EN'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-red-600 focus:outline-none transition-transform active:scale-95"
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden bg-white/95 backdrop-blur-xl absolute w-full left-0 border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out origin-top ${isOpen ? 'opacity-100 scale-y-100 max-h-screen py-4' : 'opacity-0 scale-y-0 max-h-0 overflow-hidden'}`}>
                <div className="px-6 space-y-4 flex flex-col">
                    <Link to="/" className="text-lg font-bold text-gray-800 hover:text-red-600 transition-colors" onClick={() => setIsOpen(false)}>
                        {t.home}
                    </Link>
                    <Link to="/products" className="text-lg font-bold text-gray-800 hover:text-red-600 transition-colors" onClick={() => setIsOpen(false)}>
                        {t.products || 'Products'}
                    </Link>
                    <Link to="/about" className="text-lg font-bold text-gray-800 hover:text-red-600 transition-colors" onClick={() => setIsOpen(false)}>
                        {t.about}
                    </Link>
                    <Link to="/contact" className="text-lg font-bold text-gray-800 hover:text-red-600 transition-colors" onClick={() => setIsOpen(false)}>
                        {t.contact}
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN')) && (
                        <Link to="/admin/dashboard" className="text-lg font-bold text-red-600 hover:text-red-700 transition-colors" onClick={() => setIsOpen(false)}>
                            ADMIN PANEL
                        </Link>
                    )}
                    <hr className="border-gray-100" />
                    {isAuthenticated ? (
                        <>
                            <div className="text-lg font-bold text-gray-700">Hi, {user?.fullName || user?.name || 'User'}</div>
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="text-left text-lg font-bold text-gray-800 hover:text-red-600 transition-colors"
                            >
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="text-lg font-bold text-gray-800 hover:text-red-600 transition-colors" onClick={() => setIsOpen(false)}>
                            {t.login}
                        </Link>
                    )}
                    <Link
                        to={isAuthenticated ? (user?.hasShop ? "/seller-dashboard" : "/become-seller") : "/login?role=seller"}
                        className="w-full text-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                        onClick={() => setIsOpen(false)}
                    >
                        {isAuthenticated && user?.hasShop ? "DASHBOARD" : t.becomeSeller}
                    </Link>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
