# Component Integration Examples

This guide shows how to update your existing components to use the real API endpoints instead of mock data.

## 1. Update CategoryGrid Component

### Before (Mock Data)
```jsx
const CategoryGrid = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Cars' },
    { id: 2, name: 'Bikes' },
    // ... hardcoded data
  ]);

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id}>{cat.name}</div>
      ))}
    </div>
  );
};
```

### After (Real API)
```jsx
import { useEffect } from 'react';
import { categoryAPI } from '../services/api';

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryAPI.getAllCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="text-center p-4">Loading categories...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id}>{cat.name}</div>
      ))}
    </div>
  );
};

export default CategoryGrid;
```

---

## 2. Update AdSlider Component with Featured Vehicles

### Before (Mock Data)
```jsx
const AdSlider = () => {
  const [ads, setAds] = useState([
    { id: 1, image: 'url', title: 'Ad 1' },
    // ... hardcoded
  ]);

  return (
    <div className="slider">
      {/* Render ads */}
    </div>
  );
};
```

### After (Real API)
```jsx
import { useEffect } from 'react';
import { miscAPI, adAPI } from '../services/api';

const AdSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        // Get active ads for the slider
        const adsData = await adAPI.getActiveAds();
        // Or use featured vehicles
        // const featured = await miscAPI.getFeaturedVehicles();
        setSlides(adsData);
      } catch (err) {
        console.error('Failed to load ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) return <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>;
  if (!slides.length) return <div className="h-96 bg-gray-100 rounded-lg"></div>;

  return (
    <div className="slider">
      {slides.map(slide => (
        <div key={slide.id} className="slide">
          <img src={slide.image} alt={slide.title} />
          <h3>{slide.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default AdSlider;
```

---

## 3. Create a Vehicles Listing Page

### New Component: VehiclesPage.jsx
```jsx
import { useEffect, useState } from 'react';
import { useVehicles } from '../hooks/useApi';
import VehicleCard from './VehicleCard';

const VehiclesPage = () => {
  const {
    vehicles,
    loading,
    error,
    pagination,
    fetchVehicles
  } = useVehicles();

  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchVehicles(page, pageSize, 'createdAt,desc');
  }, [page]);

  if (loading && vehicles.length === 0) {
    return <div className="text-center p-8">Loading vehicles...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Vehicles</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            id={vehicle.id}
            title={vehicle.title}
            price={vehicle.price}
            image={vehicle.imageUrl}
            mileage={vehicle.mileage}
            location={vehicle.location}
            seller={vehicle.sellerName}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page + 1} of {Math.ceil(pagination.total / pageSize)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={(page + 1) * pageSize >= pagination.total}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehiclesPage;
```

---

## 4. Update VehicleCard to Fetch Details

### Before
```jsx
const VehicleCard = ({ title, price, image }) => {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{price}</p>
    </div>
  );
};
```

### After (With API)
```jsx
import { useState } from 'react';
import { vehicleAPI } from '../services/api';

const VehicleCard = ({ id, title, price, image }) => {
  const [details, setDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleViewDetails = async () => {
    if (details) {
      setShowDetails(!showDetails);
      return;
    }

    try {
      setLoading(true);
      const data = await vehicleAPI.getVehicleById(id);
      setDetails(data);
      setShowDetails(true);
    } catch (err) {
      console.error('Failed to fetch vehicle details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p className="text-xl font-bold">{price}</p>
      
      <button
        onClick={handleViewDetails}
        disabled={loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : 'View Details'}
      </button>

      {showDetails && details && (
        <div className="mt-4 border-t pt-4">
          <p><strong>Condition:</strong> {details.condition}</p>
          <p><strong>Mileage:</strong> {details.mileage}</p>
          <p><strong>Fuel:</strong> {details.fuelType}</p>
          {/* More details */}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
```

---

## 5. Create a Seller Application Form

### BecomeSeller.jsx - Enhanced
```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeller } from '../hooks/useApi';

const BecomeSeller = () => {
  const { user, isAuthenticated } = useAuth();
  const { applySeller, loading } = useSeller();
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    registrationNumber: '',
    phoneNumber: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await applySeller({
      shopName: formData.shopName,
      description: formData.description,
      registrationNumber: formData.registrationNumber,
      phoneNumber: formData.phoneNumber
    });

    if (result.success) {
      setFormData({
        shopName: '',
        description: '',
        registrationNumber: '',
        phoneNumber: ''
      });
      // Redirect or show success message
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center p-8">Please login to apply as a seller</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Apply as Seller'}
        </button>
      </form>
    </div>
  );
};

export default BecomeSeller;
```

---

## 6. Update ContactUs Page

### ContactUs.jsx - With API
```jsx
import { useState } from 'react';
import { useContact } from '../hooks/useApi';

const ContactUs = () => {
  const { sendMessage, loading, error } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const result = await sendMessage(formData);

    if (result.success) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          Message sent successfully! We'll get back to you soon.
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
```

---

## 7. Create Fraud Detector Page

### FraudDetectorPage.jsx - New Implementation
```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFraud } from '../hooks/useApi';

const FraudDetectorPage = () => {
  const { isAuthenticated } = useAuth();
  const { reportFraud, loading } = useFraud();
  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    evidence: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const result = await reportFraud({
      vehicleId: formData.vehicleId,
      description: formData.description,
      evidence: formData.evidence
    });

    if (result.success) {
      setFormData({
        vehicleId: '',
        description: '',
        evidence: ''
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center p-8">Please login to report fraud</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Report Fraud</h1>
      <p className="text-gray-600 mb-6">
        Help us keep the marketplace safe by reporting suspicious listings
      </p>

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
          Fraud report submitted successfully. Thank you!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Vehicle ID</label>
          <input
            type="text"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            placeholder="Enter the vehicle ID"
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the fraud issue..."
            rows="4"
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Evidence</label>
          <textarea
            name="evidence"
            value={formData.evidence}
            onChange={handleChange}
            placeholder="Provide evidence (screenshots, links, etc.)..."
            rows="4"
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Submitting Report...' : 'Submit Fraud Report'}
        </button>
      </form>
    </div>
  );
};

export default FraudDetectorPage;
```

---

## 8. Example: User Profile/Dashboard Page

### ProfilePage.jsx - New Component
```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, loading, getCurrentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    telephone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        address: user.address || '',
        telephone: user.telephone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await updateUser(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {!isEditing ? (
        <div className="border rounded-lg p-6">
          <div className="mb-4">
            <label className="text-gray-600">Name</label>
            <p className="text-xl font-semibold">{user?.name}</p>
          </div>
          <div className="mb-4">
            <label className="text-gray-600">Email</label>
            <p className="text-xl">{user?.email}</p>
          </div>
          <div className="mb-4">
            <label className="text-gray-600">Address</label>
            <p className="text-xl">{user?.address}</p>
          </div>
          <div className="mb-4">
            <label className="text-gray-600">Telephone</label>
            <p className="text-xl">{user?.telephone}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4 border rounded-lg p-6">
          <div>
            <label className="block font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Telephone</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
```

---

## 9. Search Integration Example

### SearchBar.jsx - With Suggestions
```jsx
import { useState, useEffect } from 'react';
import { useMisc } from '../hooks/useApi';

const SearchBar = () => {
  const { suggestions, getSearchSuggestions } = useMisc();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      getSearchSuggestions(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSelect = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Navigate or trigger search
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search vehicles..."
        className="w-full px-4 py-2 border rounded-lg"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg">
          {suggestions.map((sugg, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(sugg)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {sugg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
```

---

## Summary

To integrate API calls into your components:

1. **Import the hook or API function**
2. **Use useState for local state** (if not using hooks)
3. **Use useEffect to fetch data** (on component mount or dependency change)
4. **Handle loading and error states**
5. **Display data in JSX**
6. **Handle form submissions** with API calls

**Forms:**
- Get form data from useState
- Call API function on submit
- Handle success/error responses
- Reset form on success

**Lists:**
- Fetch data in useEffect
- Display with .map()
- Handle pagination with state
- Show loading/error states

**Authentication:**
- Use useAuth hook for login/logout
- Use ProtectedRoute for protected pages
- Access user info from useAuth()
