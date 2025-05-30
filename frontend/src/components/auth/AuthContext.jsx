import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://local-connector-1.onrender.com/api';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cityscope-token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set up axios interceptor for auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);
  // Response interceptor for handling auth errors
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('cityscope-token');
      toast.error('Session expired. Please login again.');
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Fetch current user data to populate user state
          const response = await userService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token exists but is invalid, clear it
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('cityscope-token');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          // Token is invalid, clear authentication state
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('cityscope-token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        
        localStorage.setItem('cityscope-token', userToken);
        
        return { success: true, data: userData };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
      
      // Handle validation errors specifically
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        const errorMessage = validationErrors.map(err => err.msg).join(', ');
        const errorDetails = {
          message: errorMessage,
          errors: validationErrors,
          type: 'validation'
        };
        throw errorDetails;
      }
      
      // Handle other types of errors
      const message = error.response?.data?.message || 'Login failed';
      throw { message, type: 'general' };
    } finally {
      setLoading(false);
    }
  };
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user: newUser, token: userToken } = response.data.data;
        
        setUser(newUser);
        setToken(userToken);
        setIsAuthenticated(true);
        
        localStorage.setItem('cityscope-token', userToken);
        toast.success(`Welcome to CityScope, ${newUser.username}!`);
        
        return { success: true, data: newUser };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
      // Handle validation errors specifically
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors;
        const errorMessage = validationErrors.map(err => err.msg).join(', ');
        const errorDetails = {
          message: errorMessage,
          errors: validationErrors,
          type: 'validation'
        };
        throw errorDetails;
      }
      
      // Handle other types of errors
      const message = error.response?.data?.message || 'Registration failed';
      throw { message, type: 'general' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cityscope-token');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
