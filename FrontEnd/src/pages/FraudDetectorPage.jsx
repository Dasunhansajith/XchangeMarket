import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import UploadCard from '../components/FraudDetector/UploadCard';
import ResultsCard from '../components/FraudDetector/ResultsCard';

const FraudDetectorPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelected = (selectedFile) => {
        setFile(selectedFile);
        setResults(null); // Clear previous results
        setError(null);
    };

    const handleRunCheck = async () => {
        if (!file) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Updated endpoint to separate Fraud concerns
            const response = await axios.post('http://localhost:8080/api/fraud/image-check', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(response.data);
        } catch (err) {
            console.error("Fraud Check Error:", err);
            // Mock Fallback for Demo if Backend is not running/available
            // Remove this in production and show real error
            setTimeout(() => {
                const mockResult = {
                    riskScore: Math.floor(Math.random() * 100),
                    riskLevel: Math.random() > 0.5 ? "HIGH" : "MEDIUM",
                    recommendation: "Review Manually",
                    internal: {
                        matchesCount: Math.floor(Math.random() * 3),
                        matches: Array.from({ length: Math.floor(Math.random() * 2) }).map((_, i) => ({
                            listingId: `L-${Math.floor(Math.random() * 1000)}`,
                            sellerId: "S-552",
                            similarity: 0.9,
                            thumbnailUrl: URL.createObjectURL(file) // just re-using file for demo
                        }))
                    },
                    web: {
                        entities: [{ name: "Branded Watch", score: 0.95 }, { name: "Luxury Goods", score: 0.8 }],
                        pages: [{ pageUrl: "https://example.com/suspicious-listing" }]
                    },
                    notes: ["Web entity match found", "Potential internal duplicate"]
                };
                setResults(mockResult);
                setError("Note: Using Mock Data (Backend Unreachable)");
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setResults(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mb-12 space-y-4">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-full shadow-lg border border-gray-100">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Image Fraud Detector</h1>
                <p className="text-lg text-gray-600">
                    Upload a product image to reverse-search across the web and detect potentially fraudulent listings.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                {/* Left Column: Upload */}
                <div className="h-full flex flex-col gap-6">
                    <div className="flex-1 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-2 border border-gray-100">
                        <UploadCard onFileSelected={handleFileSelected} />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleRunCheck}
                            disabled={!file || loading}
                            className={`
                                flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200
                                ${!file || loading
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-800 hover:-translate-y-1 hover:shadow-xl active:translate-y-0'}
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                "Run Fraud Check"
                            )}
                        </button>

                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Clear
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Results */}
                <div className="h-full">
                    <ResultsCard
                        results={results}
                        isLoading={loading}
                        onClear={handleClear}
                    />
                </div>
            </div>
        </div>
    );
};

export default FraudDetectorPage;
