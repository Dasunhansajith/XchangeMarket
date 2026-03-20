import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const { t } = useLanguage();
    const { signup, loading, error } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Detect role from URL query param, default to 'buyer'
    const roleParam = searchParams.get('role');
    const targetRole = roleParam === 'seller' ? 'seller' : 'buyer';

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        nicNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setLocalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        // Validation
        if (!formData.name || !formData.address || !formData.phone || !formData.email || !formData.nicNumber || !formData.password) {
            setLocalError("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError("Passwords do not match!");
            return;
        }

        if (formData.password.length < 6) {
            setLocalError("Password must be at least 6 characters long");
            return;
        }

        const result = await signup({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            nicNumber: formData.nicNumber,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            roles: [targetRole]
        });

        if (result.success) {
            navigate('/');
        } else {
            setLocalError(result.error || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-blue-900/80 backdrop-blur-sm"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-sans drop-shadow-lg">
                    {t.createYourAccount}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-200 font-sans">
                    {t.alreadyHaveAccount}{' '}
                    <Link to="/login" className="font-medium text-red-400 hover:text-red-300 transition-colors duration-200">
                        {t.signIn}
                    </Link>
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {(localError || error) && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {localError || error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.fullName}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.address}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Telephone Number */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.telephone}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.email}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* NIC Number */}
                        <div>
                            <label htmlFor="nicNumber" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.nicNumber}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="nicNumber"
                                    name="nicNumber"
                                    type="text"
                                    required
                                    value={formData.nicNumber}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>




                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.password}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.confirmPassword}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing up...' : t.signUp}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
