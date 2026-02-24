import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import digexaLogo from '../assets/digexa_logo.svg';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        {/* XCHANGE Logo */}
                        <Link to="/" className="text-3xl font-extrabold tracking-tighter block group">
                            <span className="text-red-600">X</span>
                            <span className="text-white group-hover:text-gray-300 transition-colors">CHANGE</span>
                        </Link>

                        <p className="text-sm text-gray-400">
                            {t.footerDesc}
                        </p>

                        {/* Digexa Logo (Powered By) */}
                        <div className="pt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Powered By</p>
                            <a href="https://digexa.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                                <img src={digexaLogo} alt="Digexa" className="h-10 w-auto" />
                            </a>
                        </div>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <FaFacebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <FaTwitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <FaInstagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                <FaLinkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">{t.company}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="hover:text-red-500 transition-colors duration-300">{t.about}</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-red-500 transition-colors duration-300">{t.contact}</Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.careers}</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.blog}</a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">{t.helpSupport}</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.faq}</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.termsConditions}</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.privacyPolicy}</a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-red-500 transition-colors duration-300">{t.cookiePolicy}</a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">{t.newsletter}</h3>
                        <p className="text-sm text-gray-400 mb-4">{t.subscribeText}</p>
                        <form className="flex flex-col space-y-2">
                            <input
                                type="email"
                                placeholder={t.enterEmail}
                                className="bg-gray-800 border-none text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2"
                            >
                                <span>{t.subscribe}</span>
                                <FaPaperPlane className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Digexa. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
