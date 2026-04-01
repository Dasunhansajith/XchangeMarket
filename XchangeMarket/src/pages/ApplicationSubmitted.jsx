import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

const ApplicationSubmitted = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                    className="flex justify-center mb-8"
                >
                    <div className="bg-green-100 p-6 rounded-full">
                        <FaCheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                </motion.div>

                {/* Main Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                        Application Submitted!
                    </h1>
                    <p className="text-center text-gray-600 mb-3 font-medium">
                        Your seller application has been successfully submitted.
                    </p>
                </motion.div>

                {/* Waiting for Approval */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8"
                >
                    <div className="flex items-start gap-3">
                        <FaClock className="text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-blue-900 font-semibold mb-1">Waiting for Approval</p>
                            <p className="text-blue-800 text-sm">
                                Our admin team will review your application and notify you soon. You can check your account for updates.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="border-t pt-6 mt-6"
                >
                    <p className="text-center text-gray-600 text-sm mb-2">
                        Redirecting to homepage in...
                    </p>
                    <div className="flex justify-center mb-4">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="text-4xl font-bold text-red-600"
                        >
                            {countdown}
                        </motion.div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-2 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-medium"
                    >
                        Go to Homepage Now
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ApplicationSubmitted;
