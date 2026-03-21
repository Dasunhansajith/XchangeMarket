import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BecomeSeller from './pages/BecomeSeller';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Products from './pages/Products';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import FloatingWishlistButton from './components/FloatingWishlistButton';


import { Toaster } from 'react-hot-toast';
import CategoryGrid from './components/CategoryGrid';
import AdSlider from './components/AdSlider';
import AppDownloadCard from './components/AppDownloadCard';


// ...existing code...
import VehicleCard from './components/VehicleCard';


// Removed unused demo image imports

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <CategoryGrid />

      {/* Main Hero Section with Banner and Side Widget */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <AdSlider />
          </div>
          <div className="w-full md:w-1/4 hidden md:block">
            <AppDownloadCard />
          </div>
        </div>
      </div>

      {/* Premium Call to Action Section */}
      <div className="container mx-auto px-4 py-4 mb-12 max-w-5xl">
        <div className="relative rounded-3xl p-8 md:p-14 text-center shadow-2xl overflow-hidden group bg-slate-900 border border-slate-800">

          {/* Animated Mesh Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0"></div>

          {/* Glowing Orbs */}
          <div className="absolute -top-32 -left-20 w-[24rem] h-[24rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[90px] opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000 ease-in-out z-0"></div>
          <div className="absolute top-0 -right-20 w-[24rem] h-[24rem] bg-rose-600 rounded-full mix-blend-screen filter blur-[90px] opacity-30 group-hover:opacity-50 group-hover:-translate-x-10 transition-all duration-1000 ease-in-out z-0"></div>
          <div className="absolute -bottom-32 left-1/4 w-[24rem] h-[24rem] bg-emerald-600 rounded-full mix-blend-screen filter blur-[90px] opacity-30 group-hover:opacity-50 group-hover:-translate-y-10 transition-all duration-1000 ease-in-out z-0"></div>

          {/* Inner Content Component */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-white mb-4 leading-tight drop-shadow-lg tracking-tight">
              Discover What You're Looking For
            </h2>
            <p className="text-indigo-100/80 text-base md:text-lg max-w-xl mx-auto mb-8 font-medium">
              Browse our extensive collection of user-friendly products across multiple categories. Verified sellers, great deals.
            </p>
            <Link
              to="/products"
              className="group/btn inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-indigo-50 font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_0_30px_-10px_rgba(255,255,255,0.4)] transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10 text-sm">Explore All Products</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
// ...existing code...

import { NotificationProvider } from './context/NotificationContext';


function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <LanguageProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/become-seller"
                  element={
                    <ProtectedRoute>
                      <BecomeSeller />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/seller-dashboard"
                  element={
                    <ProtectedRoute>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Footer />
              <FloatingWishlistButton />
              <Toaster position="top-center" reverseOrder={false} />
            </LanguageProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}




export default App
