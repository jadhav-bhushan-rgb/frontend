import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quotationAPI, inquiryAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Redirect admin/backoffice users to their respective dashboards
  useEffect(() => {
    console.log('Dashboard - User data:', user);
    console.log('Dashboard - User role:', user?.role);
    console.log('Dashboard - User loading state:', loading);
    
    // Only redirect if user data is loaded and user is admin/backoffice
    if (user && (user.role === 'admin' || user.role === 'backoffice' || user.role === 'subadmin')) {
      console.log('Redirecting admin user to /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  // Initialize state variables first
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Role-based stats
  const getRoleBasedStats = () => {
    if (user?.role === 'admin' || user?.role === 'backoffice') {
      return {
        totalInquiries: 12,
        quotations: 8,
        activeOrders: 5,
        completed: 3
      };
    } else {
      return {
        totalInquiries: 0,
        quotations: 0,
        activeOrders: 0,
        completed: 0
      };
    }
  };

  const [stats, setStats] = useState(getRoleBasedStats());

  // Update stats when data changes
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice') {
      setStats({
        totalInquiries: inquiries.length,
        quotations: quotations.length,
        activeOrders: orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length,
        completed: orders.filter(order => order.status === 'delivered').length
      });
    }
  }, [inquiries, quotations, orders, user]);

  // Fetch quotations for customer
  const fetchQuotations = async () => {
    try {
      setQuotationsLoading(true);
      console.log('Fetching quotations...');
      const response = await quotationAPI.getQuotations();
      console.log('Quotations response:', response.data);
      if (response.data.success) {
        const quotations = response.data.quotations || [];
        setQuotations(quotations);
        console.log('Quotations set:', quotations.length);
        console.log('Quotations with PDF:', quotations.filter(q => q.quotationPdf).length);
        quotations.forEach((q, i) => {
          console.log(`Quotation ${i+1} (${q.quotationNumber}):`, {
            hasQuotationPdf: !!q.quotationPdf,
            quotationPdf: q.quotationPdf
          });
        });
      } else {
        console.error('Quotations API failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setQuotationsLoading(false);
    }
  };

  // Fetch inquiries for customer
  const fetchInquiries = async () => {
    try {
      setInquiriesLoading(true);
      console.log('Fetching inquiries...');
      const response = await inquiryAPI.getInquiries();
      console.log('Inquiries response:', response.data);
      if (response.data.success) {
        setInquiries(response.data.inquiries || []);
        console.log('Inquiries set:', response.data.inquiries?.length || 0);
      } else {
        console.error('Inquiries API failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Fetch orders for customer
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('Fetching orders...');
      const response = await orderAPI.getOrders();
      console.log('Orders response:', response.data);
      if (response.data.success) {
        setOrders(response.data.orders || []);
        console.log('Orders set:', response.data.orders?.length || 0);
      } else {
        console.error('Orders API failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch data when tabs are active
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice') {
      if (activeTab === 'quotations') {
        fetchQuotations();
      } else if (activeTab === 'inquiries') {
        fetchInquiries();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [activeTab, user]);

  // Fetch all data for overview tab
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice' && activeTab === 'overview') {
      fetchQuotations();
      fetchInquiries();
      fetchOrders();
    }
  }, [user, activeTab]);

  // Initial data fetch when component mounts
  useEffect(() => {
    console.log('Dashboard useEffect - User:', user);
    console.log('Dashboard useEffect - User role:', user?.role);
    console.log('Dashboard useEffect - Loading:', loading);
    
    if (user && user.role !== 'admin' && user.role !== 'backoffice' && user.role !== 'subadmin') {
      console.log('Fetching initial dashboard data for customer');
      fetchQuotations();
      fetchInquiries();
      fetchOrders();
    }
  }, [user]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'inquiry',
      title: 'New inquiry submitted',
      description: 'Sheet metal parts for automotive industry',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'quotation',
      title: 'Quotation prepared',
      description: 'Custom brackets and panels',
      time: '1 day ago',
      status: 'sent'
    },
    {
      id: 3,
      type: 'order',
      title: 'Order confirmed',
      description: 'Production started for order #KO-2024-001',
      time: '3 days ago',
      status: 'confirmed'
    }
  ]);

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      orderNumber: 'KO-2024-001',
      product: 'Sheet Metal Brackets',
      status: 'In Production',
      amount: 2500.00,
      date: '2025-01-15'
    },
    {
      id: 2,
      orderNumber: 'KO-2024-002',
      product: 'Laser Cut Panels',
      status: 'Shipped',
      amount: 1800.00,
      date: '2025-01-12'
    }
  ]);

  const workflowSteps = [
    {
      step: 1,
      title: 'Inquiry Generation',
      status: 'current',
      color: 'green'
    },
    {
      step: 2,
      title: 'Quotation Process',
      status: 'current',
      color: 'yellow'
    },
    {
      step: 3,
      title: 'Customer Response',
      status: 'current',
      color: 'blue'
    },
    {
      step: 4,
      title: 'Payment Process',
      status: 'pending',
      color: 'purple'
    },
    {
      step: 5,
      title: 'Order Confirmation',
      status: 'pending',
      color: 'dark-blue'
    },
    {
      step: 6,
      title: 'Order Dispatch',
      status: 'pending',
      color: 'grey'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'inquiries', name: 'Inquiries', icon: '📄' },
    { id: 'quotations', name: 'Quotations', icon: '🏷️' },
    { id: 'orders', name: 'Orders', icon: '📦' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Link 
            to="/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto ">
        <div className="px-4 py-2 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.firstName || user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 text-sm">
              {user?.role === 'admin' || user?.role === 'backoffice' 
                ? 'Manage inquiries, quotations, and orders from your back office dashboard.'
                : 'Here\'s what\'s happening with your manufacturing projects today.'
              }
            </p>
          </div>

          {/* Tabs Navigation - Only show for customer users */}
          {user && user.role === 'customer' && (
            <div className="mb-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Navigation</h3>
                <nav className="flex flex-wrap gap-7">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Tab Content - Only show for customer users */}
          {user && user.role === 'customer' && activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">📄</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Inquiries
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.totalInquiries}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">🏷️</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Quotations
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.quotations}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">📦</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Orders
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.activeOrders}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">✅</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Completed
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats.completed}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Only show for customer users */}
                    {user?.role === 'customer' && (
                      <Link
                        to="/inquiry/new"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-green-600 text-lg">📄</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Submit New Inquiry</h4>
                          <p className="text-sm text-gray-500">Submit a new manufacturing inquiry</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/inquiries"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-lg">📋</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">View All Inquiries</h4>
                        <p className="text-sm text-gray-500">Check status of your inquiries</p>
                      </div>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-purple-600 text-lg">🛒</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Track Orders</h4>
                        <p className="text-sm text-gray-500">Track your orders and deliveries</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Quotations</h3>
                  </div>
                  <div className="p-3 max-h-80 overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    {quotations.length > 0 ? (
                      <div className="space-y-3">
                        {quotations.slice(0, 3).map((quotation) => (
                          <div key={quotation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Quotation #{quotation.quotationNumber || quotation.id}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(quotation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                quotation.status === 'sent' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : quotation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Pending'}
                              </span>
                              {quotation.totalAmount && (
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{quotation.totalAmount.toLocaleString()}
                                </span>
                              )}
                              {quotation.status === 'sent' && (
                                <button
                                  onClick={() => navigate(`/payment/${quotation.id}`)}
                                  className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-orange-600 transition-colors"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {quotations.length > 3 && (
                          <div className="text-center">
                            <Link
                              to="/quotations"
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View All Quotations
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-2">🏷️</div>
                        <p className="text-sm text-gray-500">No quotations available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-3 max-h-80 overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activity.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : activity.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quotations Tab Content */}
          {user && user.role === 'customer' && activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Quotations</h3>
                  <p className="text-sm text-gray-600 mt-1">View and respond to quotations from our team</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {quotationsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading quotations...</span>
                    </div>
                  ) : quotations.length > 0 ? (
                    <div className="space-y-4">
                      {quotations.map((quotation) => (
                        <div key={quotation._id || quotation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                Quotation #{quotation.quotationNumber || quotation._id || quotation.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Inquiry: {quotation.inquiry?.inquiryNumber || quotation.inquiryId || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(quotation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                quotation.status === 'sent' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : quotation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : quotation.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Pending'}
                              </span>
                              {quotation.totalAmount && (
                                <span className="text-lg font-semibold text-gray-900">
                                  ₹{quotation.totalAmount.toLocaleString()}
                                </span>
                              )}
                              {quotation.quotationPdf && (
                                <button
                                  onClick={() => {
                                    console.log('Opening quotation PDF:', quotation.quotationPdf);
                                    const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/quotations/${quotation.quotationPdf}`;
                                    console.log('PDF URL:', pdfUrl);
                                    window.open(pdfUrl, '_blank');
                                  }}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                  title="View Quote PDF"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  Quote PDF
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {quotation.status === 'sent' && (
                            <div className="mt-4 flex space-x-3">
                              <button
                                onClick={() => navigate(`/payment/${quotation._id || quotation.id}`)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <span className="mr-2">💳</span>
                                Pay Now
                              </button>
                              <Link
                                to={`/quotation/${quotation._id || quotation.id}`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                View Details
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🏷️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
                      <p className="text-gray-600 mb-4">Your quotations will appear here once submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inquiries Tab Content */}
          {user && user.role === 'customer' && activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Inquiries</h3>
                  <p className="text-sm text-gray-600 mt-1">Track the status of your manufacturing inquiries</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {inquiriesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading inquiries...</span>
                    </div>
                  ) : inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                {inquiry.title || `Inquiry #${inquiry.inquiryNumber || inquiry.id}`}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {inquiry.description || 'No description available'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(inquiry.createdAt).toLocaleDateString()}
                              </p>
                              {inquiry.material && (
                                <p className="text-sm text-gray-500">
                                  Material: {inquiry.material} | Thickness: {inquiry.thickness} | Quantity: {inquiry.quantity}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                inquiry.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : inquiry.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : inquiry.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : inquiry.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : inquiry.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {inquiry.status?.charAt(0).toUpperCase() + inquiry.status?.slice(1) || 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-3">
                            <Link
                              to={`/inquiry/${inquiry._id || inquiry.id}`}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                      <p className="text-gray-600 mb-4">Your inquiries will appear here once submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab Content */}
          {user && user.role === 'customer' && activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your manufacturing orders and deliveries</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {ordersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading orders...</span>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                Order #{order.orderNumber || order.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {order.description || 'Manufacturing Order'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              {order.deliveryDate && (
                                <p className="text-sm text-gray-500">
                                  Expected Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                order.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'in_production'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'shipped'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                              </span>
                              {order.totalAmount && (
                                <span className="text-lg font-semibold text-gray-900">
                                  ₹{order.totalAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-3">
                            <Link
                              to={`/order/${order._id || order.id}`}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                            {order.status === 'shipped' && (
                              <Link
                                to={`/order/${order._id || order.id}/tracking`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                Track Order
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">Your orders will appear here once you accept a quotation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab Content */}
          {user && user.role === 'customer' && activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">View your manufacturing project analytics</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalInquiries}</div>
                      <div className="text-sm text-blue-800">Total Inquiries</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.quotations}</div>
                      <div className="text-sm text-yellow-800">Quotations</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.activeOrders}</div>
                      <div className="text-sm text-green-800">Active Orders</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                      <div className="text-sm text-purple-800">Completed</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📈</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600">Detailed charts and insights coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback content for non-customer users */}
          {user && user.role !== 'customer' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your {user.role} dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                You have been redirected to the appropriate dashboard for your role.
              </p>
              <Link 
                to="/admin/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;