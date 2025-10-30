import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, inquiryAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('=== PROFILE DATA DEBUG ===');
    console.log('User object:', user);
    
    if (user) {
      console.log('User firstName:', user.firstName);
      console.log('User lastName:', user.lastName);
      console.log('User email:', user.email);
      console.log('User phoneNumber:', user.phoneNumber);
      console.log('User phone:', user.phone);
      console.log('User companyName:', user.companyName);
      console.log('User address:', user.address);
      
      // Format address properly
      let formattedAddress = '';
      if (user.address) {
        if (typeof user.address === 'string') {
          formattedAddress = user.address;
        } else if (typeof user.address === 'object') {
          // Format address object into readable text
          const addr = user.address;
          const addressParts = [];
          if (addr.street) addressParts.push(addr.street);
          if (addr.city) addressParts.push(addr.city);
          if (addr.state) addressParts.push(addr.state);
          if (addr.zipCode) addressParts.push(addr.zipCode);
          if (addr.country) addressParts.push(addr.country);
          formattedAddress = addressParts.join(', ');
        }
      }

      const newFormData = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        company: user.companyName || '',
        address: formattedAddress
      };
      
      console.log('Setting formData to:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('⚠️ User object is null or undefined!');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== PROFILE UPDATE SUBMIT ===');
    console.log('Current formData:', formData);
    console.log('Current user:', user);
    
    setLoading(true);

    try {
      // Split name into firstName and lastName
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Parse address string back to object if needed
      let addressObj = user.address || {};
      if (typeof formData.address === 'string' && formData.address.trim()) {
        // If address is a simple string, try to preserve the object structure
        // For now, we'll update the street field with the full address
        addressObj = {
          street: formData.address,
          city: addressObj.city || '',
          state: addressObj.state || '',
          zipCode: addressObj.zipCode || '',
          country: addressObj.country || ''
        };
      }
      
      // Format data to match backend expectations
      const updateData = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phoneNumber: formData.phone, // Backend expects phoneNumber
        companyName: formData.company, // Backend expects companyName
        address: addressObj
      };
      
      console.log('Calling updateProfile with formatted data:', updateData);
      const result = await updateProfile(updateData);
      console.log('Update result:', result);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Real data for orders and inquiries
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Fetch customer orders
  const fetchOrders = async () => {
    if (!user?._id || user?.role !== 'customer') return;
    
    try {
      setOrdersLoading(true);
      const response = await orderAPI.getCustomerOrders(user._id);
      
      if (response.data.success) {
        const transformedOrders = response.data.orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' '),
          total: order.totalAmount,
          date: new Date(order.createdAt).toISOString().split('T')[0],
          items: order.parts ? order.parts.map(part => part.name || part.description || 'Part') : ['Custom Parts']
        }));
        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch customer inquiries
  const fetchInquiries = async () => {
    if (!user?._id || user?.role !== 'customer') return;
    
    try {
      setInquiriesLoading(true);
      const response = await inquiryAPI.getCustomerInquiries();
      
      if (response.data.success) {
        const transformedInquiries = response.data.inquiries.map(inquiry => ({
          id: inquiry._id,
          title: inquiry.title || `Inquiry ${inquiry.inquiryNumber}`,
          description: inquiry.description || inquiry.specialInstructions || 'Custom sheet metal parts inquiry',
          status: inquiry.status,
          date: new Date(inquiry.createdAt).toISOString().split('T')[0],
          quoteAmount: inquiry.quotation ? inquiry.quotation.totalAmount : null,
          files: inquiry.files ? inquiry.files.map(file => file.originalName || file.filename) : []
        }));
        setInquiries(transformedInquiries);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Fetch data when user changes or tab changes
  useEffect(() => {
    if (user?._id && user?.role === 'customer') {
      if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'inquiries') {
        fetchInquiries();
      }
    }
  }, [user, activeTab]);

  // Back Office Settings state (Admin only)
  const [backOfficeEmails, setBackOfficeEmails] = useState(['', '', '', '']);
  const [backOfficeMobileNumbers, setBackOfficeMobileNumbers] = useState(['', '']);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Fetch back office settings for admin
  const fetchBackOfficeSettings = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      setSettingsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { backOfficeEmails: emails, backOfficeMobileNumbers: numbers } = data.settings;
        setBackOfficeEmails(emails.length >= 4 ? emails : [...emails, ...Array(4 - emails.length).fill('')]);
        setBackOfficeMobileNumbers(numbers.length >= 2 ? numbers : [...numbers, ...Array(2 - numbers.length).fill('')]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Load settings when user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBackOfficeSettings();
    }
  }, [user]);

  const handleBackOfficeEmailChange = (index, value) => {
    const newEmails = [...backOfficeEmails];
    newEmails[index] = value;
    setBackOfficeEmails(newEmails);
  };

  const handleBackOfficeMobileChange = (index, value) => {
    const newNumbers = [...backOfficeMobileNumbers];
    newNumbers[index] = value;
    setBackOfficeMobileNumbers(newNumbers);
  };

  const addBackOfficeEmail = () => {
    setBackOfficeEmails([...backOfficeEmails, '']);
  };

  const removeBackOfficeEmail = (index) => {
    if (backOfficeEmails.length > 4) {
      setBackOfficeEmails(backOfficeEmails.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 4 email addresses are required');
    }
  };

  const addBackOfficeMobile = () => {
    setBackOfficeMobileNumbers([...backOfficeMobileNumbers, '']);
  };

  const removeBackOfficeMobile = (index) => {
    if (backOfficeMobileNumbers.length > 2) {
      setBackOfficeMobileNumbers(backOfficeMobileNumbers.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 mobile numbers are required');
    }
  };

  const handleBackOfficeSettingsSave = async (e) => {
    e.preventDefault();
    
    const validEmails = backOfficeEmails.filter(email => email.trim() !== '');
    const validNumbers = backOfficeMobileNumbers.filter(num => num.trim() !== '');
    
    if (validEmails.length < 4) {
      toast.error('Please enter at least 4 email addresses');
      return;
    }
    
    if (validNumbers.length < 2) {
      toast.error('Please enter at least 2 mobile numbers');
      return;
    }
    
    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        toast.error(`Invalid email: ${email}`);
        return;
      }
    }
    
    // Validate mobile numbers
    for (const num of validNumbers) {
      if (num.length < 10) {
        toast.error(`Invalid mobile number: ${num}`);
        return;
      }
    }
    
    try {
      setSettingsSaving(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          backOfficeEmails: validEmails,
          backOfficeMobileNumbers: validNumbers
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Back Office settings updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Role-based tabs - admin users don't need Order History and Inquiries
  const getTabs = () => {
    if (user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') {
      return [
        { id: 'profile', name: 'Profile Information' }
      ];
    } else {
      return [
        { id: 'profile', name: 'Profile Information' },
        { id: 'orders', name: 'Order History' },
        { id: 'inquiries', name: 'Inquiries' }
      ];
    }
  };

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto ">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Profile
            </h1>
            <p className="text-gray-600">
              Manage your account and view your activity
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                {/* Admin Role Indicator */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">A</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-900">
                          {user?.role === 'admin' ? 'Administrator Account' : 
                           user?.role === 'backoffice' ? 'Back Office Account' : 
                           'Sub-Admin Account'}
                        </h3>
                        <p className="text-sm text-blue-700">
                          You have administrative access to manage inquiries, quotations, and orders.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>

                {/* Back Office Contact Settings - Admin Only */}
                {user?.role === 'admin' && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Back Office Contact Settings</h2>
                    
                    {settingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading settings...</span>
                      </div>
                    ) : (
                      <form onSubmit={handleBackOfficeSettingsSave}>
                        {/* Email Addresses */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Back Office Email IDs</h3>
                              <p className="text-sm text-gray-600">Minimum 4 email addresses required</p>
                            </div>
                            <button
                              type="button"
                              onClick={addBackOfficeEmail}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              + Add Email
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {backOfficeEmails.map((email, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                                </div>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => handleBackOfficeEmailChange(index, e.target.value)}
                                  placeholder={`Email ${index + 1}`}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  required={index < 4}
                                />
                                {backOfficeEmails.length > 4 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBackOfficeEmail(index)}
                                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Numbers */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Back Office Mobile Numbers</h3>
                              <p className="text-sm text-gray-600">Minimum 2 mobile numbers required</p>
                            </div>
                            <button
                              type="button"
                              onClick={addBackOfficeMobile}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              + Add Number
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {backOfficeMobileNumbers.map((mobile, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 text-sm font-medium">{index + 1}</span>
                                </div>
                                <input
                                  type="tel"
                                  value={mobile}
                                  onChange={(e) => handleBackOfficeMobileChange(index, e.target.value)}
                                  placeholder={`Mobile Number ${index + 1}`}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  required={index < 2}
                                />
                                {backOfficeMobileNumbers.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBackOfficeMobile(index)}
                                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={fetchBackOfficeSettings}
                            disabled={settingsSaving}
                            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            disabled={settingsSaving}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {settingsSaving ? 'Saving...' : 'Save Back Office Settings'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-2">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.items.join(', ')}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Ordered on {order.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'In Production' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'Dispatched'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <p className="text-lg font-semibold text-gray-900 mt-2">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No orders found.</p>
                    <p className="text-sm text-gray-400 mt-2">Your orders will appear here once you place them.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Inquiries</h2>
                {inquiriesLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-2">Loading inquiries...</p>
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-6">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{inquiry.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{inquiry.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Submitted on {inquiry.date}</span>
                              {inquiry.quoteAmount && (
                                <span className="font-medium text-gray-900">
                                  Quote: ${inquiry.quoteAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                              inquiry.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : inquiry.status === 'quoted'
                                ? 'bg-blue-100 text-blue-800'
                                : inquiry.status === 'in_production'
                                ? 'bg-purple-100 text-purple-800'
                                : inquiry.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {inquiry.status === 'in_production' ? 'In Production' : 
                               inquiry.status === 'completed' ? 'Completed' :
                               inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Files Section */}
                        {inquiry.files && inquiry.files.length > 0 && (
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Attached Files:</span>
                                <div className="flex space-x-2">
                                  {inquiry.files.map((file, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                      📎 {file}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  View Details
                                </button>
                                {inquiry.status === 'quoted' && (
                                  <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                                    Accept Quote
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No inquiries found.</p>
                    <p className="text-sm text-gray-400 mt-2">Your inquiries will appear here once you submit them.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
