import { useState, useCallback, useRef } from 'react';

const SRI_LANKA_CITIES = [
  'All Cities',
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa',
  'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

/**
 * Custom hook managing all location-based product filtering state.
 * Persists the last selected location in localStorage.
 * Supports both city-based (manual) and GPS-based (auto-detect) filtering.
 *
 * @returns {{
 *   selectedCity: string,
 *   filterMode: 'all' | 'city',
 *   cities: string[],
 *   handleCitySelect: (city: string) => void,
 *   clearLocation: () => void,
 *   locationLabel: string,
 * }}
 */
export function useLocationFilter(debounceMs = 300) {
  // Restore persisted state
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('xm_userCity') || 'All Cities';
  });

  // Debounce timer ref
  const debounceRef = useRef(null);

  // Derived: what mode are we in?
  const filterMode = selectedCity !== 'All Cities' ? 'city' : 'all';

  // Human-readable label for the current filter state
  const locationLabel = selectedCity;

  /**
   * Select a city manually. Clears GPS coordinates.
   */
  const handleCitySelect = useCallback((city) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSelectedCity(city);
      localStorage.setItem('xm_userCity', city);
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Clear all location filters and return to "show all" state.
   */
  const clearLocation = useCallback(() => {
    setSelectedCity('All Cities');
    localStorage.removeItem('xm_userCity');
  }, []);

  return {
    selectedCity,
    filterMode,
    cities: SRI_LANKA_CITIES,
    locationLabel,
    handleCitySelect,
    clearLocation,
  };
}

export { SRI_LANKA_CITIES };
