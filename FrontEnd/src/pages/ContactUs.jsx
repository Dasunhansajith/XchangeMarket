import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaWhatsapp
} from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';

const ContactUs = () => {
    const { t } = useLanguage();
    const form = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const sendEmail = (e) => {
        e.preventDefault();
        if (!form.current) return;

        setIsSubmitting(true);

        const SERVICE_ID = 'service_9elnm4f';
        const TEMPLATE_ID = 'template_rirm1wu';
        const PUBLIC_KEY = 'mTeFyM1rVUxCn2GBW';

        emailjs
            .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
                publicKey: PUBLIC_KEY
            })
            .then((result) => {
                console.log('SUCCESS!', result.status, result.text);
                toast.success('Message sent successfully!');
                e.target.reset();
            })
            .catch((error) => {
                console.log('FAILED...', error);
                toast.error(`Failed to send message: ${error.text || error.message || 'Unknown error'}`);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" reverseOrder={false} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        {t.contactTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">{t.contactSubtitle}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Contact Form */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                        <form ref={form} onSubmit={sendEmail} className="space-y-6">
                            <div>
                                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
                                    {t.yourName}
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="user_name"
                                        id="user_name"
                                        required
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 bg-gray-50 transition-colors duration-200"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">
                                    {t.yourEmail}
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="user_email"
                                        id="user_email"
                                        required
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 bg-gray-50 transition-colors duration-200"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="user_message" className="block text-sm font-medium text-gray-700">
                                    {t.yourMessage}
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="user_message"
                                        name="user_message"   // ✅ FIXED (was "message")
                                        rows={4}
                                        required
                                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 bg-gray-50 transition-colors duration-200"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-[1.02] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSubmitting ? 'Sending...' : t.sendMessage}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Contact Info & Social Media */}
                    <motion.div variants={itemVariants} className="flex flex-col justify-between space-y-8">
                        {/* Info Cards */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.contactInfo}</h3>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-red-100 rounded-full p-3 text-red-600">
                                    <FaMapMarkerAlt className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t.visitUs}</p>
                                    <p className="text-gray-500 mt-1">Malabe , Sri Lanka</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-red-100 rounded-full p-3 text-red-600">
                                    <FaPhone className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t.callUs}</p>
                                    <p className="text-gray-500 mt-1">+94 76 641 4622</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-red-100 rounded-full p-3 text-red-600">
                                    <FaEnvelope className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t.emailUs}</p>
                                    <p className="text-gray-500">info@xchange.lk</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex-shrink-0 bg-green-500 rounded-full p-3 text-white animate-pulse">
                                    <FaWhatsapp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t.quickReply}</p>
                                    <a
                                        href="https://wa.me/94766414622"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-700 font-extrabold hover:text-green-800 mt-1 inline-block transition duration-300 transform hover:scale-105 underline decoration-green-500 underline-offset-2"
                                    >
                                        {t.chatOnWhatsapp}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="bg-gradient-to-r from-blue-900 to-gray-900 rounded-2xl shadow-lg p-8 text-white">
                            <h3 className="text-2xl font-bold mb-6">{t.followUs}</h3>
                            <div className="flex justify-start space-x-8">
                                <a href="#" className="transform hover:scale-110 transition-transform duration-300 hover:text-red-400">
                                    <FaFacebook className="h-10 w-10" />
                                </a>
                                <a href="#" className="transform hover:scale-110 transition-transform duration-300 hover:text-red-400">
                                    <FaTwitter className="h-10 w-10" />
                                </a>
                                <a href="#" className="transform hover:scale-110 transition-transform duration-300 hover:text-red-400">
                                    <FaInstagram className="h-10 w-10" />
                                </a>
                                <a href="#" className="transform hover:scale-110 transition-transform duration-300 hover:text-red-400">
                                    <FaLinkedin className="h-10 w-10" />
                                </a>
                            </div>
                            <p className="mt-6 text-gray-300 text-sm">
                                Stay connected with us on social media for the latest updates, offers, and news.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactUs;
