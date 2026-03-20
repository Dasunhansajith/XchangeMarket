# API Integration Guide

This document explains how to use the integrated backend API in your frontend application.

## Setup

### 1. API Configuration
The API base URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8085/api';
```

Change this if your backend runs on a different URL.

### 2. Authentication
- Tokens are automatically stored in `localStorage` with key `authToken`
- User info is stored in `localStorage` with key `userInfo`
- Tokens are automatically added to all requests via axios interceptor
- Expired tokens trigger automatic logout and redirect to login page

## Authentication

### Using AuthContext
The `AuthContext` provides authentication state management across your app.

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,           // Current user object
    token,          // JWT token
    loading,        // Loading state
    error,          // Error message
    signup,         // Signup function
    login,          // Login function
    logout,         // Logout function
    isAuthenticated // Boolean indicating if user is logged in
  } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      // Login successful
    } else {
      console.error(result.error);
    }
  };

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
    </div>
  );
}
```

### Auth Helpers
Use `authHelpers` for token/user management:

```javascript
import { authHelpers } from '../services/api';

// Set token after successful auth
authHelpers.setToken(token);

// Get stored token
const token = authHelpers.getToken();

// Store user info
authHelpers.setUserInfo(userData);

// Get stored user info
const user = authHelpers.getUserInfo();

// Check if authenticated
if (authHelpers.isAuthenticated()) {
  // User is logged in
}

// Logout
authHelpers.logout();
```

## Protected Routes

Use `ProtectedRoute` to protect routes that require authentication:

```jsx
import { ProtectedRoute, AdminRoute, SellerRoute } from '../components/ProtectedRoute';

<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  
  {/* Protected routes (must be logged in) */}
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* Admin-only routes */}
  <Route 
    path="/admin" 
    element={
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    } 
  />
  
  {/* Seller-only routes */}
  <Route 
    path="/seller/dashboard" 
    element={
      <SellerRoute>
        <SellerDashboard />
      </SellerRoute>
    } 
  />
</Routes>
```

## API Usage Examples

### 1. Authentication API

#### Sign Up
```javascript
import { authAPI } from '../services/api';

const result = await authAPI.signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
```

#### Login
```javascript
const result = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
});
```

### 2. User API

#### Get Current User Profile
```javascript
import { userAPI } from '../services/api';

const profile = await userAPI.getCurrentProfile();
```

#### Update User Profile
```javascript
const updated = await userAPI.updateProfile({
  name: 'Jane Doe',
  address: 'New Address',
  telephone: '1234567890'
});
```

### 3. Vehicle API

#### Get All Vehicles (Paginated)
```javascript
import { vehicleAPI } from '../services/api';

const vehicles = await vehicleAPI.getAllVehicles(
  0,              // page
  10,             // size (items per page)
  'createdAt,desc' // sort
);
```

#### Get Single Vehicle
```javascript
const vehicle = await vehicleAPI.getVehicleById(vehicleId);
```

#### Create Vehicle (Protected)
```javascript
const newVehicle = await vehicleAPI.createVehicle({
  title: 'BMW 520d',
  description: 'Beautiful sedan',
  price: 5000000,
  category: 'Cars',
  condition: 'Used',
  mileage: 5000,
  // ... other fields
});
```

#### Update Vehicle (Protected)
```javascript
const updated = await vehicleAPI.updateVehicle(vehicleId, {
  title: 'Updated Title',
  price: 4500000
});
```

#### Delete Vehicle (Protected)
```javascript
await vehicleAPI.deleteVehicle(vehicleId);
```

### 4. Category API

#### Get All Categories
```javascript
import { categoryAPI } from '../services/api';

const categories = await categoryAPI.getAllCategories();
```

### 5. Ad API

#### Get Active Ads
```javascript
import { adAPI } from '../services/api';

const ads = await adAPI.getActiveAds();
```

### 6. Seller API

#### Apply as Seller (Protected)
```javascript
import { sellerAPI } from '../services/api';

const result = await sellerAPI.applySeller({
  shopName: 'My Shop',
  description: 'Shop description',
  registrationNumber: 'REG123'
});
```

#### Get All Applications (Admin Only)
```javascript
const applications = await sellerAPI.getAllApplications();
```

### 7. Fraud API

#### Report Fraud (Protected)
```javascript
import { fraudAPI } from '../services/api';

const report = await fraudAPI.reportFraud({
  vehicleId: vehicleId,
  description: 'Fraud description',
  evidence: 'Evidence details'
});
```

#### Get All Fraud Reports (Protected)
```javascript
const reports = await fraudAPI.getFraudReports();
```

### 8. Contact API

#### Send Contact Message
```javascript
import { contactAPI } from '../services/api';

const result = await contactAPI.sendMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry',
  message: 'I have a question...'
});
```

### 9. Misc API

#### Get Featured Vehicles
```javascript
import { miscAPI } from '../services/api';

const featured = await miscAPI.getFeaturedVehicles();
```

#### Get Search Suggestions
```javascript
const suggestions = await miscAPI.getSearchSuggestions('toyota');
```

### 10. Admin API

#### Admin Hello
```javascript
import { adminAPI } from '../services/api';

const result = await adminAPI.adminHello();
```

## Custom Hooks

Use custom hooks for common operations with built-in state management:

### Vehicle Hook
```javascript
import { useVehicles } from '../hooks/useApi';

function VehicleList() {
  const {
    vehicles,
    loading,
    error,
    pagination,
    fetchVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
  } = useVehicles();

  useEffect(() => {
    fetchVehicles(0, 10);
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {vehicles.map(vehicle => (
        <div key={vehicle.id}>{vehicle.title}</div>
      ))}
    </div>
  );
}
```

### Fraud Hook
```javascript
import { useFraud } from '../hooks/useApi';

function FraudReport() {
  const {
    reports,
    loading,
    error,
    reportFraud,
    getFraudReports
  } = useFraud();

  const handleReport = async () => {
    const result = await reportFraud({
      vehicleId: 'vehicle-id',
      description: 'Fraud details'
    });
  };

  return <div>...</div>;
}
```

### Seller Hook
```javascript
import { useSeller } from '../hooks/useApi';

function SellerApplication() {
  const {
    applications,
    loading,
    applySeller,
    getAllApplications
  } = useSeller();

  const handleApply = async () => {
    const result = await applySeller({
      shopName: 'My Shop'
    });
  };

  return <div>...</div>;
}
```

### Contact Hook
```javascript
import { useContact } from '../hooks/useApi';

function ContactForm() {
  const { loading, error, sendMessage } = useContact();

  const handleSubmit = async () => {
    const result = await sendMessage({
      name: 'John',
      email: 'john@example.com',
      message: 'Hello...'
    });
  };

  return <div>...</div>;
}
```

### Misc Hook
```javascript
import { useMisc } from '../hooks/useApi';

function Search() {
  const {
    featured,
    suggestions,
    loading,
    getFeaturedVehicles,
    getSearchSuggestions
  } = useMisc();

  const handleSearch = async (query) => {
    await getSearchSuggestions(query);
  };

  return <div>...</div>;
}
```

## Error Handling

All API calls return either:
- For standard API functions: Promise with response data
- For hooks: Built-in error state management

Example error handling:
```javascript
const { loading, error } = useVehicles();

if (error) {
  return <div className="bg-red-100 text-red-700 p-4">{error}</div>;
}
```

## Success Messages

Toast notifications are automatically shown for successful operations:
- Signup/Login success
- Profile updates
- Vehicle creation/updates/deletion
- Fraud reports
- And more...

To customize toast behavior, update the toast import in the relevant API service:
```javascript
import toast from 'react-hot-toast';
```

## Best Practices

1. **Always check loading state** before making UI decisions
2. **Use ProtectedRoute** for authenticated pages
3. **Add error boundaries** for better error handling
4. **Handle token expiration** gracefully (automatically redirects to login)
5. **Use useAuth hook** for authentication state in components
6. **Validate form data** before sending to API
7. **Use react-hot-toast** for user feedback
8. **Store sensitive data** securely (never expose tokens in localStorage, use httpOnly cookies if possible)

## Common Issues

### "Authorization header missing"
- Make sure `AuthProvider` wraps your app
- Check that token is properly stored in localStorage

### "401 Unauthorized"
- Token has expired or is invalid
- App will automatically redirect to login

### CORS issues
- Make sure backend allows requests from frontend URL
- Check that API base URL is correct

### API returns wrong data format
- Check backend response structure
- Adjust custom hooks if needed

---

For more information, check the individual API service files in `src/services/` and hooks in `src/hooks/`.
