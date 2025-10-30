// Authentication utility functions

// Token validation and management
export const tokenUtils = {
  // Decode JWT token (browser-compatible)
  decodeToken: (token) => {
    if (!token) return null;
    
    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode the payload (middle part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  },

  // Check if token is valid and not expired
  isValidToken: (token) => {
    if (!token) return false;
    
    try {
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) return false;
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get token payload
  getTokenPayload: (token) => {
    return tokenUtils.decodeToken(token);
  },

  // Check if token is about to expire (within 1 hour)
  isTokenExpiringSoon: (token) => {
    if (!token) return true;
    
    try {
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Return true if token expires within 1 hour
      return timeUntilExpiry < 3600;
    } catch (error) {
      console.error('Token expiry check error:', error);
      return true;
    }
  }
};

// User role utilities
export const roleUtils = {
  // Check if user is admin
  isAdmin: (user) => {
    return user?.role === 'admin' || user?.type === 'admin';
  },

  // Check if user is backoffice
  isBackOffice: (user) => {
    return user?.role === 'backoffice' || user?.type === 'backoffice';
  },

  // Check if user is customer
  isCustomer: (user) => {
    return user?.role === 'customer' || user?.type === 'customer';
  },

  // Check if user is subadmin
  isSubAdmin: (user) => {
    return user?.role === 'subadmin' || user?.type === 'subadmin';
  },

  // Get user role (handles both old and new token formats)
  getUserRole: (user) => {
    return user?.role || user?.type || 'customer';
  },

  // Get user ID (handles both old and new token formats)
  getUserId: (user) => {
    return user?.id || user?.userId;
  }
};

// API error handling
export const apiErrorUtils = {
  // Check if error is authentication related
  isAuthError: (error) => {
    return error?.response?.status === 401 || error?.response?.status === 403;
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error?.response && error?.message?.includes('Network Error');
  },

  // Get user-friendly error message
  getErrorMessage: (error) => {
    if (apiErrorUtils.isNetworkError(error)) {
      return 'Network error. Please check your connection.';
    }
    
    // For auth errors, use the server's message or a generic one
    if (apiErrorUtils.isAuthError(error)) {
      return error?.response?.data?.message || 'Authentication failed. Please check your credentials.';
    }
    
    return error?.response?.data?.message || error?.message || 'An unexpected error occurred';
  }
};

// Local storage utilities
export const storageUtils = {
  // Set token with validation
  setToken: (token) => {
    if (tokenUtils.isValidToken(token)) {
      localStorage.setItem('token', token);
      return true;
    }
    return false;
  },

  // Get token with validation
  getToken: () => {
    const token = localStorage.getItem('token');
    if (tokenUtils.isValidToken(token)) {
      return token;
    }
    
    // Clear invalid token
    localStorage.removeItem('token');
    return null;
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
