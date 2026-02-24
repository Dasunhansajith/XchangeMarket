import React, { useState } from 'react';

const FilterBar = () => {
    const [selectedCity, setSelectedCity] = useState('');

    // Mock data for shops based on city
    const shopsByCity = {
        colombo: ["Dasun's Cars", "Colombo Motors", "Indra Traders", "United Motors"],
        kandy: ["Kandy Cars", "Hill Country Auto", "Singhagiri Motors"],
        galle: ["Ruhunu Motors", "Galle Car Sale", "Southern Auto"],
        kurunegala: ["Wayamba Trading", "Kurunegala Motors"]
    };

    const cities = [
        { value: 'colombo', label: 'Colombo' },
        { value: 'kandy', label: 'Kandy' },
        { value: 'galle', label: 'Galle' },
        { value: 'kurunegala', label: 'Kurunegala' }
    ];

    const priceRanges = [
        { value: '0-5', label: 'Below 5 Million' },
        { value: '5-10', label: '5 - 10 Million' },
        { value: '10-20', label: '10 - 20 Million' },
        { value: '20-50', label: '20 - 50 Million' },
        { value: '50-100', label: '50 - 100 Million' },
        { value: '100+', label: 'Above 100 Million' }
    ];

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* City Filter */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">City</label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {cities.map((city) => (
                                <option key={city.value} value={city.value}>{city.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Price Range</label>
                    <div className="relative">
                        <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer">
                            <option value="">Any Price</option>
                            {priceRanges.map((range) => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Shop/Seller Filter - Dependent on City */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Seller / Shop</label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                            disabled={!selectedCity}
                        >
                            <option value="">{selectedCity ? "Select Shop" : "Select City First"}</option>
                            {selectedCity && shopsByCity[selectedCity]?.map((shop, index) => (
                                <option key={index} value={shop}>{shop}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="w-full md:w-1/4 flex items-end">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Find Vehicles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
