import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { categories } from '../components/CategoryGrid';
import { FaStore, FaMoneyBillWave, FaCreditCard, FaUniversity, FaMapMarkerAlt, FaTags, FaLock } from 'react-icons/fa';
import bgImage from '../assets/Becoming_an_online_seller.jpg';

const locationData = {
    "Colombo": ["Colombo 1", "Colombo 2", "Dehiwala", "Mount Lavinia", "Moratuwa", "Kotte", "Battaramulla", "Nugegoda", "Maharagama", "Piliyandala"],
    "Gampaha": ["Gampaha", "Negombo", "Kelaniya", "Kiribathgoda", "Kadawatha", "Wattala", "Minuwangoda", "Ja-Ela"],
    "Kalutara": ["Kalutara", "Panadura", "Horana", "Matugama", "Beruwala", "Aluthgama"],
    "Kandy": ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Kundasale"],
    "Matale": ["Matale", "Dambulla", "Sigiriya"],
    "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele"],
    "Galle": ["Galle", "Hikkaduwa", "Karapitiya", "Ambalangoda", "Elpitiya", "Bentota"],
    "Matara": ["Matara", "Weligama", "Dikwella", "Akuressa"],
    "Hambantota": ["Hambantota", "Tangalle", "Tissamaharama", "Ambalantota"],
    "Jaffna": ["Jaffna", "Nallur", "Chavakachcheri", "Point Pedro"],
    "Kilinochchi": ["Kilinochchi"],
    "Mannar": ["Mannar"],
    "Vavuniya": ["Vavuniya"],
    "Mullaitivu": ["Mullaitivu"],
    "Batticaloa": ["Batticaloa", "Kattankudy", "Eravur"],
    "Ampara": ["Ampara", "Kalmunai", "Sainthamaruthu"],
    "Trincomalee": ["Trincomalee", "Kinniya", "Kantale"],
    "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Pannala", "Narammala"],
    "Puttalam": ["Puttalam", "Chilaw", "Wennappuwa", "Marawila"],
    "Anuradhapura": ["Anuradhapura", "Kekirawa", "Thambuttegama"],
    "Polonnaruwa": ["Polonnaruwa", "Kaduruwela", "Medirigiriya"],
    "Badulla": ["Badulla", "Bandarawela", "Haputale", "Ella", "Mahiyanganaya"],
    "Monaragala": ["Monaragala", "Wellawaya", "Bibile", "Kataragama"],
    "Ratnapura": ["Ratnapura", "Embilipitiya", "Balangoda", "Pelmadulla"],
    "Kegalle": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana"]
};

const BecomeSeller = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Mock user data - in a real app, this would come from auth context
    const [userData, setUserData] = useState({
        name: "Dasun", // Assuming user is logged in
        email: "dasun@example.com"
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        shopLogo: null,
        paymentMethods: {
            cod: false,
            onlineTransfer: false,
            cardPayment: false
        },
        categories: [],
        location: '', // Consider removing if fully replaced, but maybe keep for backend compatibility or remove it. Let's keep it clean.
        district: '',
        city: '',
        city: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0]
            });
        } else if (type === 'checkbox') {
            setFormData({
                ...formData,
                paymentMethods: {
                    ...formData.paymentMethods,
                    [name]: checked
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Seller Application Data:', formData);

        // Simulate API call
        setTimeout(() => {
            alert("Application Submitted Successfully! Welcome to XChange Seller Program.");
            navigate('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage}
                    alt="Background"
                    className="w-full h-full object-cover opacity-60 grayscale-[50%]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/70 backdrop-blur-[1px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-full shadow-xl shadow-red-600/20">
                        <FaStore className="w-10 h-10 text-red-600" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white font-sans drop-shadow-lg">
                    {t.becomeSellerTitle} <span className="text-red-600">X</span>CHANGE
                </h2>
                <p className="mt-2 text-center text-sm text-gray-200 font-sans px-4">
                    {t.becomeSellerSubtitle}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10"
            >
                <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Shop Name */}
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.shopNameLabel}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaStore className="text-gray-400" />
                                </div>
                                <input
                                    id="shopName"
                                    name="shopName"
                                    type="text"
                                    required
                                    placeholder={t.shopNamePlaceholder}
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Shop Logo */}
                        <div>
                            <label htmlFor="shopLogo" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.shopLogoLabel}
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
                                <div className="space-y-1 text-center">
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="shopLogo" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>{t.uploadFile}</span>
                                            <input id="shopLogo" name="shopLogo" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">{t.dragDrop}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {t.fileSizeLimit}
                                    </p>
                                    {formData.shopLogo && (
                                        <p className="text-xs text-green-600 font-semibold mt-2">
                                            {t.fileSelected} {formData.shopLogo.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Categories (Multi-Select Dropdown) */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                                {t.shopCategoriesLabel}
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <span className="block truncate">
                                    {formData.categories.length > 0
                                        ? formData.categories.join(', ')
                                        : t.selectCategoriesPlaceholder}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <FaTags className="text-gray-400" />
                                </span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="relative flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                const isSelected = formData.categories.includes(cat.name);
                                                setFormData(prev => {
                                                    const newCategories = isSelected
                                                        ? prev.categories.filter(c => c !== cat.name)
                                                        : [...prev.categories, cat.name];
                                                    return { ...prev, categories: newCategories };
                                                });
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 pointer-events-none"
                                                checked={formData.categories.includes(cat.name)}
                                                readOnly
                                            />
                                            <span className={`ml-3 block truncate ${formData.categories.includes(cat.name) ? 'font-medium text-indigo-600' : 'text-gray-900'}`}>
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* District Dropdown */}
                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-gray-700 font-sans">
                                    {t.districtLabel}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <select
                                        id="district"
                                        name="district"
                                        required
                                        value={formData.district}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                district: e.target.value,
                                                city: '' // Reset city when district changes
                                            });
                                        }}
                                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 bg-white"
                                    >
                                        <option value="">{t.selectDistrict}</option>
                                        {Object.keys(locationData).sort().map((district) => (
                                            <option key={district} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* City Dropdown */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 font-sans">
                                    {t.cityLabel}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <select
                                        id="city"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!formData.district}
                                        className={`appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 bg-white ${!formData.district ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">{t.selectCity}</option>
                                        {formData.district && locationData[formData.district].sort().map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>



                        {/* Payment Methods */}
                        <div>
                            <span className="block text-sm font-medium text-gray-700 font-sans mb-2">
                                {t.paymentMethodsLabel}
                            </span>
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <input
                                        id="cod"
                                        name="cod"
                                        type="checkbox"
                                        checked={formData.paymentMethods.cod}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FaMoneyBillWave className="text-green-600" /> {t.cod}
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="onlineTransfer"
                                        name="onlineTransfer"
                                        type="checkbox"
                                        checked={formData.paymentMethods.onlineTransfer}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="onlineTransfer" className="ml-3 block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FaUniversity className="text-blue-600" /> {t.onlineTransfer}
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="cardPayment"
                                        name="cardPayment"
                                        type="checkbox"
                                        checked={formData.paymentMethods.cardPayment}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="cardPayment" className="ml-3 block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FaCreditCard className="text-purple-600" /> {t.cardPayment}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.password}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 font-sans">
                                {t.confirmPassword}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-800 hover:from-indigo-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                {t.registerShopButton}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default BecomeSeller;
