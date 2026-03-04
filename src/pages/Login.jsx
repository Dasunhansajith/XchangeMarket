import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const { t } = useLanguage();
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [localError, setLocalError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setLocalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (!formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }

        const result = await login({
            email: formData.email,
            password: formData.password
        });

        if (result.success) {
            const user = result.data.user || result.data;
            const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ADMIN');

            if (isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } else {
            setLocalError(result.error || 'Login failed');
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
                    {t.signInAccount}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-200 font-sans">
                    {t.or}{' '}
                    <Link
                        to={`/signup${role ? `?role=${role}` : ''}`}
                        className="font-medium text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                        {t.createAccount}
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

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.password}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-sans">
                                    {t.rememberMe}
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-red-600 hover:text-red-500 font-sans">
                                    {t.forgotPassword}
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : t.signIn}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
