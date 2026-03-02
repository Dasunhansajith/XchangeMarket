import { useState, useCallback } from 'react';
import { vehicleAPI, fraudAPI, sellerAPI, contactAPI, miscAPI } from '../services/api';
import toast from 'react-hot-toast';

// ============ Vehicle Hooks ============
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });

  const fetchVehicles = useCallback(
    async (page = 0, size = 10, sort = 'createdAt,desc') => {
      try {
        setLoading(true);
        setError(null);
        const response = await vehicleAPI.getAllVehicles(page, size, sort);
        setVehicles(response.data.content || response.data);
        setPagination({
          page: response.data.page ?? page,
          size: response.data.size ?? size,
          total: response.data.totalElements ?? 0,
        });
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch vehicles';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getVehicleById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.getVehicleById(id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vehicle';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (vehicleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.createVehicle(vehicleData);
      toast.success('Vehicle created successfully!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create vehicle';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id, vehicleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.updateVehicle(id, vehicleData);
      toast.success('Vehicle updated successfully!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update vehicle';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await vehicleAPI.deleteVehicle(id);
      toast.success('Vehicle deleted successfully!');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete vehicle';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicles,
    loading,
    error,
    pagination,
    fetchVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};

// ============ Fraud Hooks ============
export const useFraud = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportFraud = useCallback(async (fraudData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fraudAPI.reportFraud(fraudData);
      toast.success('Fraud report submitted successfully!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to report fraud';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFraudReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fraudAPI.getFraudReports();
      setReports(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch fraud reports';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    reportFraud,
    getFraudReports,
  };
};

// ============ Seller Hooks ============
export const useSeller = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applySeller = useCallback(async (applicationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sellerAPI.applySeller(applicationData);
      toast.success('Seller application submitted successfully!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to apply as seller';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sellerAPI.getAllApplications();
      setApplications(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch applications';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applications,
    loading,
    error,
    applySeller,
    getAllApplications,
  };
};

// ============ Contact Hooks ============
export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (messageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactAPI.sendMessage(messageData);
      toast.success('Message sent successfully!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendMessage,
  };
};

// ============ Misc Hooks ============
export const useMisc = () => {
  const [featured, setFeatured] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFeaturedVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await miscAPI.getFeaturedVehicles();
      setFeatured(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch featured vehicles';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSearchSuggestions = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      const response = await miscAPI.getSearchSuggestions(query);
      setSuggestions(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch suggestions';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    featured,
    suggestions,
    loading,
    error,
    getFeaturedVehicles,
    getSearchSuggestions,
  };
};
