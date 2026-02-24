import React from 'react';
import { motion } from 'framer-motion';
import {
    FaCar, FaMobileAlt, FaHome, FaTv,
    FaTools, FaCouch, FaIndustry, FaBriefcase,
    FaFutbol, FaDog, FaTshirt, FaBoxOpen,
    FaGraduationCap, FaShoppingBasket, FaSeedling, FaGlobeAmericas
} from 'react-icons/fa';

export const categories = [
    { id: 1, name: "Vehicles", count: "81,299 ads", icon: FaCar, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: 2, name: "Mobiles", count: "67,538 ads", icon: FaMobileAlt, color: "text-blue-500", bg: "bg-blue-100" },
    { id: 3, name: "Property", count: "65,451 ads", icon: FaHome, color: "text-red-500", bg: "bg-red-100" },
    { id: 4, name: "Electronics", count: "58,212 ads", icon: FaTv, color: "text-gray-600", bg: "bg-gray-100" },
    { id: 5, name: "Services", count: "20,823 ads", icon: FaTools, color: "text-yellow-600", bg: "bg-yellow-100" },
    { id: 6, name: "Home & Garden", count: "19,066 ads", icon: FaCouch, color: "text-orange-500", bg: "bg-orange-100" },
    { id: 7, name: "Business & Industry", count: "15,316 ads", icon: FaIndustry, color: "text-slate-600", bg: "bg-slate-200" },
    { id: 8, name: "Jobs", count: "9,978 ads", icon: FaBriefcase, color: "text-sky-600", bg: "bg-sky-100" },
    { id: 9, name: "Hobby, Sport & Kids", count: "6,187 ads", icon: FaFutbol, color: "text-purple-600", bg: "bg-purple-100" },
    { id: 10, name: "Animals", count: "5,604 ads", icon: FaDog, color: "text-amber-700", bg: "bg-amber-100" },
    { id: 11, name: "Fashion & Beauty", count: "3,302 ads", icon: FaTshirt, color: "text-pink-600", bg: "bg-pink-100" },
    { id: 12, name: "Other", count: "1,848 ads", icon: FaBoxOpen, color: "text-indigo-600", bg: "bg-indigo-100" },
    { id: 13, name: "Education", count: "1,693 ads", icon: FaGraduationCap, color: "text-blue-800", bg: "bg-blue-200" },
    { id: 14, name: "Essentials", count: "700 ads", icon: FaShoppingBasket, color: "text-green-600", bg: "bg-green-100" },
    { id: 15, name: "Agriculture", count: "614 ads", icon: FaSeedling, color: "text-lime-600", bg: "bg-lime-100" },
    { id: 16, name: "Work Overseas", count: "198 ads", icon: FaGlobeAmericas, color: "text-cyan-600", bg: "bg-cyan-100" },
];

const CategoryGrid = () => {
    const handleCategoryClick = (categoryName) => {
        let elementId = null;
        if (categoryName === "Vehicles") {
            elementId = "vehicles-section";
        } else if (categoryName === "Mobiles") {
            elementId = "mobiles-section";
        }

        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div className="sticky top-20 z-40 py-4 bg-white overflow-hidden border-b border-gray-200 shadow-md">

            {/* Marquee Container */}
            <div className="relative w-full z-10">

                {/* Gradient Masks for fading effect at edges */}
                <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent z-20 pointer-events-none"></div>

                <motion.div
                    className="flex space-x-6 w-max"
                    animate={{ x: ["0%", "-50%"] }} // Move halfway (because we duplicate the list)
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 120 // Slower speed
                    }}
                >
                    {/* Render the list twice for seamless looping */}
                    {[...categories, ...categories].map((category, index) => (
                        <motion.div
                            key={`${category.id}-${index}`}
                            whileHover={{ scale: 1.1, y: -4 }}
                            onClick={() => handleCategoryClick(category.name)}
                            className="flex-shrink-0 flex items-center p-3 px-5 rounded-2xl border border-gray-100 bg-white shadow-sm w-auto min-w-[200px] hover:shadow-xl hover:border-red-100 transition-all cursor-pointer group"
                        >
                            <div className={`p-3 rounded-full ${category.bg} mr-4 transition-colors group-hover:bg-red-500`}>
                                <category.icon className={`w-6 h-6 ${category.color} group-hover:text-white transition-colors`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap group-hover:text-red-600 transition-colors">{category.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default CategoryGrid;
