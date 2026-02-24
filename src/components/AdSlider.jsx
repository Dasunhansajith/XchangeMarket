import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ads = [
    {
        id: 1,
        title: "MUST BUY",
        subtitle: "Shop Our Top Selling Products",
        description: "Get the best deals on electronics, supplements, and accessories.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80",
        color: "from-blue-900 via-blue-700 to-transparent",
        cta: "Shop Now"
    },
    {
        id: 2,
        title: "VELENTINE ESSENTIALS",
        subtitle: "UP TO 65% OFF",
        description: "Everything you need for the season, from kitchen appliances to daily essentials.",
        image: "https://images.unsplash.com/photo-1580442451755-d6063467dde5?auto=format&fit=crop&w=1920&q=80",
        color: "from-red-900 via-red-700 to-transparent",
        cta: "Shop Now"
    },
    {
        id: 3,
        title: "LOWEST PRICES",
        subtitle: "EVERY DAY",
        description: "Budget finds for everyone. Gadgets, fashion, and more at unbeatable prices.",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80",
        color: "from-purple-900 via-purple-700 to-transparent",
        cta: "Shop Now"
    }
];

const AdSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    };

    return (
        <div className="relative w-full h-[300px] md:h-full min-h-[400px] overflow-hidden rounded-xl shadow-lg group">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image with Ken Burns Effect */}
                    <motion.img
                        src={ads[currentIndex].image}
                        alt={ads[currentIndex].title}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 6, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient Overlay based on ad color */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${ads[currentIndex].color}`}></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 text-white max-w-4xl items-start">
                        <motion.h2
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-5xl md:text-7xl font-black mb-2 drop-shadow-lg leading-tight uppercase tracking-tight"
                        >
                            {ads[currentIndex].title}
                        </motion.h2>
                        <motion.h3
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 drop-shadow-md uppercase"
                        >
                            {ads[currentIndex].subtitle}
                        </motion.h3>
                        <motion.p
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-lg md:text-xl mb-8 text-gray-100 max-w-lg font-medium"
                        >
                            {ads[currentIndex].description}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <button
                                className="px-10 py-3 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                            >
                                {ads[currentIndex].cta}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {ads.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentIndex ? 'bg-yellow-400 w-10 h-3' : 'bg-white/50 w-3 h-3 hover:bg-white'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrow Buttons - Visible on hover */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 text-white rounded-full hover:bg-yellow-400 hover:text-black transition-all z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
};
export default AdSlider;
