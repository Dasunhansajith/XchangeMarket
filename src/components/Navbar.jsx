import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="font-bold text-sm uppercase tracking-wide text-gray-600 hover:text-red-600 transition duration-300 relative group">
                            {t.home}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/about" className="font-bold text-sm uppercase tracking-wide text-gray-600 hover:text-red-600 transition duration-300 relative group">
                            {t.about}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/contact" className="font-bold text-sm uppercase tracking-wide text-gray-600 hover:text-red-600 transition duration-300 relative group">
                            {t.contact}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN')) && (
                            <Link to="/admin/dashboard" className="font-bold text-sm uppercase tracking-wide text-red-600 hover:text-red-700 transition duration-300 relative group">
                                ADMIN PANEL
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        )}

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-bold text-gray-700">Hi, {user?.fullName || user?.name || 'User'}</span>
                                <button
                                    onClick={handleLogout}
                                    className="font-bold text-sm uppercase tracking-wide text-gray-600 hover:text-red-600 transition duration-300 relative group"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="font-bold text-gray-700 hover:text-red-600 transition duration-300">
                                {t.login}
                            </Link>
                        )}

                        <Link
                            to={isAuthenticated ? "/become-seller" : "/login?role=seller"}
                            className="px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-500/30 transform hover:scale-105 hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <span>{t.becomeSeller}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg transition-colors duration-300 text-xs"
                        >
                            {language === 'EN' ? 'SI' : 'EN'}
                        </button>

                        {location && (
                            <div className="hidden lg:flex items-center text-gray-500 text-sm font-semibold bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {location}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-bold bg-gray-100 p-2 rounded-md"
                        >
                            {language === 'EN' ? 'SI' : 'EN'}
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
                        to={isAuthenticated ? "/become-seller" : "/login?role=seller"}
                        className="w-full text-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                        onClick={() => setIsOpen(false)}
                    >
                        {t.becomeSeller}
                    </Link>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
