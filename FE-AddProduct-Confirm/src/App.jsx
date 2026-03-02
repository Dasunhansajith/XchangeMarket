import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BecomeSeller from './pages/BecomeSeller';
import SellerDashboard from './pages/SellerDashboard';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { LanguageProvider } from './context/LanguageContext';


import CategoryGrid from './components/CategoryGrid';
import AdSlider from './components/AdSlider';
import AppDownloadCard from './components/AppDownloadCard';


// ...existing code...
import VehicleCard from './components/VehicleCard';


import vehicle1 from './assets/VEHICLE1.jpeg';
import vehicle2 from './assets/VEHICLE2.jpeg';
import vehicle3 from './assets/VEHICLE3.jpeg';

import bmw1 from './assets/bmw1.jpeg';
import bmw2 from './assets/bmw2.jpeg';
import bmw3 from './assets/bmw3.jpeg';

import appleWatch1 from './assets/Apple-Watch-SE-3.jpg';
import appleWatch2 from './assets/Apple-Watch-SE-3-1.jpg';

import iphone1 from './assets/iphone1.webp';
import iphone2 from './assets/iphone2.webp';
import iphone3 from './assets/iphone3.webp';

const Home = () => (
  <div className="min-h-screen bg-gray-50 pb-12">
    <CategoryGrid />

    {/* Main Hero Section with Banner and Side Widget */}
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Banner Slider - Takes up more space */}
        <div className="w-full md:w-3/4">
          <AdSlider />
        </div>

        {/* Side Widget - Takes up less space, hidden on small mobile if needed, or stacked */}
        <div className="w-full md:w-1/4 hidden md:block">
          <AppDownloadCard />
        </div>
      </div>
    </div>

    {/* Featured Vehicles Section */}
    <div id="vehicles-section" className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Vehicles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VehicleCard
          title="Land Rover Defender HSE X Dynamic P300 2024"
          mileage="1400KM"
          seller="Dasun's Cars"
          price="Rs 65,000,000"
          location="Colombo, Sri Lanka"
          images={[vehicle1, vehicle2, vehicle3]}
          contactNumber="94766414622"
          specifications={{
            "Brand": "Land Rover",
            "Model": "Defender",
            "Trim / Edition": "HSE X Dynamic P300",
            "Year of Manufacture": "2024",
            "Condition": "Brand New",
            "Transmission": "Automatic",
            "Body type": "SUV / 4x4",
            "Fuel type": "Petrol",
            "Engine capacity": "2,000 cc",
            "Mileage": "1,400 km"
          }}
          description={[
            "Land Rover Defender 110 P300",
            "EASTNOR DARK EDITION",
            "X-Dynamic HSE Fully Loaded",
            "Manufactured 2023 December",
            "Straight Petrol",
            "CARPATHIAN Matt Black (Wrapped)"
          ]}
        />

        {/* New BMW Vehicle Card */}
        <VehicleCard
          title="BMW 520d M Sport 2024"
          mileage="5000KM"
          seller="Dasun Cars"
          price="Rs 35,000,000"
          location="Colombo, Sri Lanka"
          images={[bmw1, bmw2, bmw3]}
          contactNumber="94766414622"
          specifications={{
            "Brand": "BMW",
            "Model": "5 Series",
            "Trim / Edition": "520d M Sport",
            "Year of Manufacture": "2024",
            "Condition": "Used",
            "Transmission": "Automatic",
            "Body type": "Sedan",
            "Fuel type": "Diesel",
            "Engine capacity": "2,000 cc",
            "Mileage": "5,000 km"
          }}
          description={[
            "M Sport Package",
            "Leather Seats",
            "Sunroof",
            "360 Camera",
            "Harman Kardon Sound System",
            "Head-Up Display"
          ]}
        />
      </div>
    </div>

    {/* Tech Items Section */}
    <div id="mobiles-section" className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mobiles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Apple Watch Card */}
        <VehicleCard
          title="Apple Watch SE 3 40MM Midnight Aluminum GPS – Midnight Sport Band"
          mileage="N/A"
          seller="Apple Store"
          price="Rs 99,428.57"
          location="Colombo, Sri Lanka"
          images={[appleWatch1, appleWatch2]}
          contactNumber="94766414622"
          offerPercentage="5%"
          badgeText="Brand New"
          specifications={{
            "Brand": "Apple",
            "Model": "Watch SE 3 (40MM)",
            "Processor": "Apple S10",
            "Display": "1.57 inches",
            "OS": "watchOS 26",
            "Case Material": "Midnight Aluminum",
            "Connectivity": "GPS",
            "Bond": "Midnight Sport Band"
          }}
          description={[
            "Midnight Aluminum Case",
            "Midnight Sport Band",
            "GPS Connectivity",
            "1 Year Warranty",
            "Brand New Sealed Pack"
          ]}
        />




        {/* iPhone 17 Pro Card */}
        <VehicleCard
          title="iPhone 17 Pro Max 512GB – Silver"
          mileage="N/A"
          seller="Apple Store"
          price="Rs 585,000.00"
          location="Colombo, Sri Lanka"
          images={[iphone1, iphone2, iphone3]}
          contactNumber="94766414622"
          offerPercentage="0%"
          badgeText="Brand New"
          specifications={{
            "Brand": "Apple",
            "Model": "iPhone 17 Pro Max",
            "Chip": "A19 Pro",
            "Storage": "512GB",
            "Color": "Silver",
            "Camera": "48MP Fusion Triple System",
            "Display": "Unibody Enclosure",
            "Battery": "Up to 33 hrs playback"
          }}
          description={[
            "A19 Pro chip: Highest iPhone performance ever",
            "48MP Fusion Camera System with 8x Optical Zoom",
            "Heat-forged aluminum unibody enclosure",
            "ProRes RAW & Apple Log 2 Video Recording",
            "Up to 50% charge in 20 mins",
            "1 Year Apple Care Warranty"
          ]}
        />
      </div>
    </div>
  </div>


);
// ...existing code...

function App() {
  return (
    <Router>
      <LanguageProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />

        </Routes>
        <Footer />
      </LanguageProvider>
    </Router>
  );
}

export default App
