import React from 'react';
import { motion } from 'framer-motion';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const AppDownloadCard = () => {
    return (
        <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-gradient-to-b from-orange-50 to-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col items-center">

            {/* Top Header Section */}
            <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex items-center shadow-md">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight">TRY YOUR LUCK</h3>
                    <p className="text-xs text-orange-100 font-medium">SCAN AND WIN!</p>
                </div>
            </div>

            {/* Promo Content Section */}
            <div className="flex-1 w-full p-6 flex flex-col justify-center items-center text-center space-y-6 relative">
                {/* Background decorative elements */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-orange-200/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-200/20 rounded-full blur-xl"></div>

                <div className="relative z-10 w-full">
                    <div className="text-gray-700 font-semibold mb-4 text-sm flex flex-col gap-3">
                        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm w-full mx-auto border border-gray-50 hover:shadow-md transition-shadow">
                            <div className="bg-orange-100 p-2 rounded-full mr-3">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <span className="text-gray-600">Free Shipping</span>
                        </div>
                        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm w-full mx-auto border border-gray-50 hover:shadow-md transition-shadow">
                            <div className="bg-red-100 p-2 rounded-full mr-3">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">Exclusive Vouchers</span>
                        </div>
                    </div>
                </div>

                {/* QR Code Placeholder */}
                <div className=" relative group cursor-pointer">
                    <div className="absolute inset-0 bg-orange-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-2 rounded-lg border-2 border-dashed border-orange-300">
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://hippy-market.fr/Car-Truck-Window-Sticker-5-quot-x4-quot/1113182"
                            alt="Scan to win"
                            className="w-20 h-20"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Scan QR to win!</p>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="w-full p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
                <button className="flex-1 flex items-center justify-center space-x-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                    <FaApple className="text-lg mb-0.5" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[7px] text-gray-300">Download on the</span>
                        <span className="text-[10px] font-bold">App Store</span>
                    </div>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                    <FaGooglePlay className="text-sm mb-0.5" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[7px] text-gray-300 uppercase">Get it on</span>
                        <span className="text-[10px] font-bold">Google Play</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AppDownloadCard;
