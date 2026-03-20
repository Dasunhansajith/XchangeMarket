# Quick API Reference

## Base URL
```
http://localhost:8085/api
```

## Available API Modules

### authAPI
- `signup(userData)` - POST /auth/signup
- `login(credentials)` - POST /auth/login

### userAPI  
- `getCurrentProfile()` - GET /users/me
- `updateProfile(userData)` - PUT /users/me

### vehicleAPI
- `getAllVehicles(page, size, sort)` - GET /vehicles
- `getVehicleById(id)` - GET /vehicles/{id}
- `createVehicle(vehicleData)` - POST /vehicles
- `updateVehicle(id, vehicleData)` - PUT /vehicles/{id}
- `deleteVehicle(id)` - DELETE /vehicles/{id}

### categoryAPI
- `getAllCategories()` - GET /categories

### adAPI
- `getActiveAds()` - GET /ads/active

### sellerAPI
- `applySeller(applicationData)` - POST /sellers/apply
- `getAllApplications()` - GET /sellers/applications

### fraudAPI
- `reportFraud(fraudData)` - POST /fraud/reports
- `getFraudReports()` - GET /fraud/reports

### contactAPI
- `sendMessage(messageData)` - POST /contact

### miscAPI
- `getFeaturedVehicles()` - GET /stats/featured
- `getSearchSuggestions(query)` - GET /search/suggestions?q=query

### adminAPI
- `adminHello()` - GET /admin/hello

## Auth Helpers

```javascript
import { authHelpers } from '../services/api';

// Token Management
authHelpers.setToken(token)
authHelpers.getToken()
authHelpers.removeToken()

// User Info
authHelpers.setUserInfo(userInfo)
authHelpers.getUserInfo()
authHelpers.removeUserInfo()

// Status Check
authHelpers.isAuthenticated()

// Logout
authHelpers.logout()
```

## Custom Hooks

```
useVehicles()          - Vehicle management
useFraud()            - Fraud reporting
useSeller()           - Seller applications
useContact()          - Contact messages
useMisc()             - Featured & search
useAuth()             - Authentication (from context)
```

## Protected Routes

```jsx
<ProtectedRoute>        - Requires login
<AdminRoute>           - Requires admin role
<SellerRoute>          - Requires seller/admin role
```

## Example: Complete Flow

```jsx
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useApi';

function MyComponent() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { vehicles, fetchVehicles, loading: vehiclesLoading } = useVehicles();

  // Login
  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'pass' });
  };

  // Fetch data
  const handleFetch = async () => {
    await fetchVehicles(0, 10);
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome {user.name}</p>
          <button onClick={handleFetch} disabled={vehiclesLoading}>
            Load Vehicles
          </button>
          {vehicles.map(v => <div key={v.id}>{v.title}</div>)}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin} disabled={authLoading}>
          Login
        </button>
      )}
    </div>
  );
}
```

## Integration Steps

1. **Setup AuthProvider in App.jsx** ✓ (Already done)
2. **Use AuthContext for authentication** - Import `useAuth` in components
3. **Use Custom Hooks for API calls** - Import from `src/hooks/useApi.js`
4. **Protect routes with ProtectedRoute** ✓ (Already configured for /become-seller)
5. **Update existing components** - Replace mock data with API calls
6. **Add error handling** - Use error state from hooks/context
7. **Add loading states** - Use loading state from hooks/context
8. **Toast notifications** - Already integrated with react-hot-toast

## Configuration

Edit API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8085/api';
```

## Axios Interceptors

**Request Interceptor:** Automatically adds Authorization header with JWT token

**Response Interceptor:** Handles 401 errors by clearing token and redirecting to login

## Common Headers

All requests automatically include:
```
Content-Type: application/json
Authorization: Bearer <token> (if logged in)
```

## Environment Variables (Optional)

To use environment variables, create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8085/api
```

Then update `api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';
```
