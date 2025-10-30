import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { tokenUtils, roleUtils, apiErrorUtils, storageUtils } from '../utils/authUtils';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(storageUtils.getToken());

  useEffect(() => {
    if (token && tokenUtils.isValidToken(token)) {
      fetchUserProfile();
    } else {
      // Clear invalid token
      if (token) {
        console.log('Invalid token detected, clearing auth data');
        storageUtils.clearAuthData();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile with token:', token);
      
      // Validate token before making request
      if (!tokenUtils.isValidToken(token)) {
        throw new Error('Invalid token');
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('User profile fetched successfully:', response.data);
      
      // Normalize user data to handle both old and new formats
      const userData = {
        ...response.data,
        role: roleUtils.getUserRole(response.data),
        id: roleUtils.getUserId(response.data)
      };
      
      setUser(userData);
      console.log('User state updated:', userData);
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', error.response?.data);
      
      // Handle different types of errors
      if (apiErrorUtils.isAuthError(error)) {
        console.log('Authentication error, clearing token and user data');
        storageUtils.clearAuthData();
        setToken(null);
        setUser(null);
      } else if (error.response?.status === 404 && error.response?.data?.message === 'User not found') {
        console.log('User not found error, clearing token and user data');
        storageUtils.clearAuthData();
        setToken(null);
        setUser(null);
      } else {
        console.log('Non-auth error, keeping token but clearing user data');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for email:', email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      const { token: newToken, user: userData } = response.data;
      
      // Validate token before storing
      if (!tokenUtils.isValidToken(newToken)) {
        throw new Error('Invalid token received from server');
      }
      
      // Normalize user data
      const normalizedUserData = {
        ...userData,
        role: roleUtils.getUserRole(userData),
        id: roleUtils.getUserId(userData)
      };
      
      console.log('Setting token and user data:', { newToken, normalizedUserData });
      
      // Use storage utils for consistent token management
      if (storageUtils.setToken(newToken)) {
        setToken(newToken);
        setUser(normalizedUserData);
        console.log('Login successful, user set to:', normalizedUserData);
        return { success: true, user: normalizedUserData };
      } else {
        throw new Error('Failed to store token');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: apiErrorUtils.getErrorMessage(error)
      };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('AuthContext signup called with:', userData);
      console.log('Making API call to /api/auth/signup');
      
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      console.log('API response received:', response.data);
      
      const { token: newToken, user: newUser } = response.data;
      
      console.log('Signup successful, setting user data:', { newToken, newUser });
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      console.log('User set after signup:', newUser);
      return { success: true };
    } catch (error) {
      console.error('AuthContext signup error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    storageUtils.clearAuthData();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('=== AUTH CONTEXT: updateProfile called ===');
      console.log('Profile data to send:', profileData);
      
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile update response:', response.data);
      
      // Backend returns { success: true, message: ..., user: {...} }
      // So we need to extract the user object
      const updatedUser = response.data.user || response.data;
      console.log('Setting updated user:', updatedUser);
      
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
