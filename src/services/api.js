import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 300000, // 5 minutes timeout for file uploads and inquiry creation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      token: token ? `Present (${token.substring(0, 20)}...)` : 'Missing',
      fullToken: token
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error Response Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Inquiry API
export const inquiryAPI = {
  // Get all inquiries for the current user
  getInquiries: (params = {}) => api.get('/inquiry', { params }),
  
  // Get customer inquiries (for customer profile)
  getCustomerInquiries: () => api.get('/inquiry/customer'),
  
  // Get single inquiry by ID
  getInquiry: (id) => api.get(`/inquiry/${id}`),
  
  // Get single inquiry by ID (Admin - can access any inquiry)
  getInquiryAdmin: (id) => api.get(`/inquiry/admin/${id}`),
  
  // Get all inquiries (Admin - can see all inquiries)
  getAllInquiries: (params = {}) => api.get('/inquiry/admin/all', { params }),
  
  // Create new inquiry
  createInquiry: (inquiryData) => {
    const formData = new FormData();
    
    // Add inquiry details
    formData.append('title', inquiryData.title || '');
    formData.append('description', inquiryData.description || '');
    formData.append('material', inquiryData.material || '');
    formData.append('thickness', inquiryData.thickness || '');
    formData.append('grade', inquiryData.grade || '');
    formData.append('quantity', inquiryData.quantity || '');
    formData.append('remarks', inquiryData.remarks || '');
    
    // Add required fields for backend validation
    // Convert file metadata to parts array
    const parts = inquiryData.fileMetadata ? inquiryData.fileMetadata.map(file => ({
      partRef: file.partRef || file.name,
      material: file.material || 'Zintec',
      thickness: file.thickness || '1.5',
      grade: file.grade || '',
      quantity: file.quantity || 1,
      remarks: file.remarks || ''
    })) : [];
    
    formData.append('parts', JSON.stringify(parts));
    
    // Add default delivery address
    const deliveryAddress = {
      street: 'Default Street',
      city: 'Default City',
      state: 'Default State',
      country: 'India',
      postalCode: '123456'
    };
    formData.append('deliveryAddress', JSON.stringify(deliveryAddress));
    
    // Add special instructions
    formData.append('specialInstructions', inquiryData.remarks || '');
    
    // Add files
    if (inquiryData.files && inquiryData.files.length > 0) {
      inquiryData.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    return api.post('/inquiry', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update inquiry
  updateInquiry: (id, data) => api.put(`/inquiry/${id}`, data),
  
  // Update inquiry (admin)
  updateInquiryAdmin: (id, data) => api.put(`/inquiry/admin/${id}`, data),
  
  // Upload files to inquiry
  uploadFiles: (id, formData) => api.post(`/inquiry/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Download Excel template
  downloadExcelTemplate: () => api.get('/inquiry/excel-template', {
    responseType: 'blob'
  }),
  
  // Delete inquiry
  deleteInquiry: (id) => api.delete(`/inquiry/${id}`),
  
  // Get inquiry status
  getInquiryStatus: (id) => api.get(`/inquiry/${id}/status`),
};

// Quotation API
export const quotationAPI = {
  // Get all quotations for the current user
  getQuotations: (params = {}) => api.get('/quotation/customer', { params }),
  
  // Get single quotation by ID
  getQuotation: (id) => api.get(`/quotation/id/${id}`),
  
  // Get all quotations (Admin - can see all quotations)
  getAllQuotations: (params = {}) => api.get('/quotation', { params }),
  
  // Create quotation (Admin)
  createQuotation: (quotationData) => api.post('/quotation/create', quotationData),
  
  // Upload quotation PDF (Admin)
  uploadQuotation: (formData) => api.post('/quotation/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Update quotation (Admin)
  updateQuotation: (id, data) => api.put(`/quotation/${id}`, data),
  
  // Update quotation pricing (Admin)
  updateQuotationPricing: (id, items) => api.put(`/quotation/${id}/pricing`, { items }),
  
  // Send quotation to customer (Admin)
  sendQuotation: (id) => api.post(`/quotation/${id}/send`),
  
  // Customer response to quotation
  respondToQuotation: (id, response) => api.post(`/quotation/${id}/response`, response),
  
  // Accept quotation (alias for respondToQuotation with 'accepted')
  acceptQuotation: (id, data) => api.post(`/quotation/${id}/response`, {
    response: 'accepted',
    ...data
  }),
  
  // Get quotation PDF
  getQuotationPDF: (id) => api.get(`/quotation/${id}/pdf`, {
    responseType: 'blob',
  }),
};

// Order API
export const orderAPI = {
  // Get all orders for current user
  getOrders: (params = {}) => api.get('/orders/customer', { params }),
  
  // Get customer orders
  getCustomerOrders: (customerId) => api.get(`/orders/customer/${customerId}`),
  
  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Create order from quotation
  createOrder: (quotationId, orderData) => api.post('/orders', {
    quotationId,
    ...orderData,
  }),
  
  // Update order
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  
  // Cancel order
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  
  // Get order tracking
  getOrderTracking: (id) => api.get(`/orders/${id}/tracking`),
  
  // Get order PDF
  getOrderPDF: (id) => api.get(`/orders/${id}/pdf`, {
    responseType: 'blob',
  }),
};

// Payment API
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: (orderId, amount) => api.post('/payments/create-intent', {
    orderId,
    amount,
  }),
  
  // Confirm payment
  confirmPayment: (paymentId, paymentData) => api.post('/payments/confirm', {
    paymentId,
    ...paymentData,
  }),
  
  // Get payment status
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
  
  // Get payment history
  getPaymentHistory: (params = {}) => api.get('/payments/history', { params }),
  
  // Razorpay Payment Methods
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
  refundPayment: (data) => api.post('/payment/refund', data)
};

// Admin API
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Get all inquiries (admin view)
  getAllInquiries: (params = {}) => api.get('/admin/inquiries', { params }),
  
  // Update inquiry status
  updateInquiryStatus: (id, status, data = {}) => api.put(`/admin/inquiries/${id}/status`, {
    status,
    ...data,
  }),
  
  // Get all quotations (admin view)
  getAllQuotations: (params = {}) => api.get('/admin/quotations', { params }),
  
  // Create quotation
  createQuotation: (inquiryId, quotationData) => api.post('/admin/quotations', {
    inquiryId,
    ...quotationData,
  }),
  
  // Update quotation
  updateQuotation: (id, data) => api.put(`/admin/quotations/${id}`, data),
  
  // Send quotation
  sendQuotation: (id) => api.post(`/admin/quotations/${id}/send`),
  
  // Get all orders (admin view)
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }),
  
  // Update order status
  updateOrderStatus: (id, status, data = {}) => api.put(`/admin/orders/${id}/status`, {
    status,
    ...data,
  }),
  
  // Update delivery details
  updateDeliveryDetails: (id, deliveryData) => api.put(`/orders/${id}/delivery-time`, deliveryData),
  
  // Update dispatch details
  updateDispatchDetails: (id, dispatchData) => api.put(`/orders/${id}/dispatch`, dispatchData),
  
  // Get material management data
  getMaterialData: (params = {}) => api.get('/admin/material-data', { params }),
  
  // Update material data
  updateMaterialData: (id, data) => api.put(`/admin/material-data/${id}`, data),
  
  // Bulk update material data
  bulkUpdateMaterialData: (data) => api.put('/admin/material-data/bulk', data),
  
  // Upload material files
  uploadMaterialFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/admin/material-data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Test Email service
  testEmail: (data) => api.post('/admin/test-email', data),
  
  // Test SMS service
  testSMS: (data) => api.post('/admin/test-sms', data),
};

// Notification API
export const notificationAPI = {
  // Get notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  
  // Mark notification as read
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.patch('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// File API
export const fileAPI = {
  // Upload file
  uploadFile: (file, type = 'inquiry') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Download file
  downloadFile: (fileId) => api.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  }),
  
  // Delete file
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  
  // Get file info
  getFileInfo: (fileId) => api.get(`/files/${fileId}`),
};

// PDF Processing API
export const pdfAPI = {
  // Extract data from PDF
  extractPdfData: (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    return api.post('/inquiry/extract-pdf-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Extract data from ZIP file
  extractZipData: (file) => {
    const formData = new FormData();
    formData.append('zip', file);
    
    return api.post('/inquiry/extract-zip-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
    return { success: false, error: message };
  } else if (error.request) {
    // Request was made but no response received
    return { success: false, error: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
};

export const handleApiSuccess = (response) => {
  return {
    success: true,
    data: response.data,
    message: response.data?.message || 'Operation completed successfully',
  };
};


export default api;
