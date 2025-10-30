import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InquiryList from './inquiry/InquiryList';
import OrderManagement from './order/OrderManagement';
import BackOfficeMaterialManagement from './BackOfficeMaterialManagement';
import QuotationForm from '../components/QuotationForm';
import SubAdminManagement from '../components/SubAdminManagement';
import { inquiryAPI, quotationAPI, orderAPI, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BackOfficeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inquiries');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    inquiries: 0,
    quotations: 0,
    orders: 0,
    completed: 0
  });
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async (forceRefresh = false) => {
    try {
      // Check if we need to refresh data (cache for 30 seconds)
      const now = Date.now();
      const shouldRefresh = forceRefresh || !lastFetchTime || (now - lastFetchTime) > 30000;
      
      if (!shouldRefresh) {
        return; // Use cached data
      }

      setLoading(true);
      setStatsLoading(true);
      
      // Fetch dashboard stats first (fast)
      const statsPromise = adminAPI.getDashboardStats();
      
      // Fetch all data in parallel for better performance
      const [statsResponse, inquiryResponse, quotationResponse, orderResponse] = await Promise.allSettled([
        statsPromise,
        inquiryAPI.getAllInquiries(),
        quotationAPI.getAllQuotations(),
        user && ['admin', 'backoffice'].includes(user.role) ? adminAPI.getAllOrders() : Promise.resolve({ data: { success: false } })
      ]);

      // Handle dashboard stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        setDashboardStats(statsResponse.value.data.stats);
      }
      setStatsLoading(false);

      // Handle inquiries
      if (inquiryResponse.status === 'fulfilled' && inquiryResponse.value.data.success) {
        const transformedInquiries = inquiryResponse.value.data.inquiries.map(inquiry => ({
          id: inquiry.inquiryNumber,
          customer: `${inquiry.customer?.firstName || ''} ${inquiry.customer?.lastName || ''}`.trim() || 'N/A',
          company: inquiry.customer?.companyName || 'N/A',
          files: inquiry.files?.length || 0,
          parts: inquiry.parts?.length || 0,
          status: inquiry.status,
          date: new Date(inquiry.createdAt).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          }),
          _id: inquiry._id,
          // Keep full inquiry data for quotation creation
          inquiryNumber: inquiry.inquiryNumber,
          parts: inquiry.parts || [],
          customerData: inquiry.customer
        }));
        setPendingInquiries(transformedInquiries);
      }

      // Handle quotations
      if (quotationResponse.status === 'fulfilled' && quotationResponse.value.data.success) {
        console.log('=== QUOTATIONS DATA ===');
        console.log('Raw quotations:', quotationResponse.value.data.quotations);
        
        const transformedQuotations = quotationResponse.value.data.quotations.map(quotation => {
          console.log(`Quotation ${quotation.quotationNumber}:`, {
            hasQuotationPdf: !!quotation.quotationPdf,
            quotationPdf: quotation.quotationPdf
          });
          
          return {
            id: quotation.quotationNumber,
            inquiryId: quotation.inquiry?.inquiryNumber || 'N/A',
            customer: `${quotation.inquiry?.customer?.firstName || ''} ${quotation.inquiry?.customer?.lastName || ''}`.trim() || 'N/A',
            company: quotation.inquiry?.customer?.companyName || 'N/A',
            amount: quotation.totalAmount,
            status: quotation.status,
            date: new Date(quotation.createdAt).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            }),
            _id: quotation._id,
            quotationPdf: quotation.quotationPdf // Original field (no test data)
          };
        });
        
        console.log('Transformed quotations:', transformedQuotations);
        console.log('Quotations with PDF:', transformedQuotations.filter(q => q.quotationPdf).length);
        setQuotations(transformedQuotations);
      }

      // Handle orders
      if (orderResponse.status === 'fulfilled' && orderResponse.value.data.success) {
        const transformedOrders = orderResponse.value.data.orders.map(order => ({
          id: order.orderNumber,
          orderId: order.orderNumber,
          customer: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A',
          items: order.parts?.length || 0,
          status: order.status,
          amount: order.totalAmount,
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          }),
          _id: order._id
        }));
        setOrders(transformedOrders);
      } else if (orderResponse.status === 'rejected') {
        const orderError = orderResponse.reason;
        console.error('Error fetching orders:', orderError);
        
        if (orderError.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (orderError.response?.status === 403) {
          toast.error('Access denied. You do not have permission to view orders.');
        } else if (orderError.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(`Failed to fetch orders: ${orderError.response?.data?.message || orderError.message}`);
        }
        
        setOrders([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setLastFetchTime(Date.now());
    }
  };

  const handleCreateQuotation = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowQuotationForm(true);
  };

  const handleQuotationSuccess = (quotation) => {
    toast.success(`Quotation ${quotation.quotationNumber} created successfully!`);
    // Refresh the inquiries list with force refresh
    fetchData(true);
  };

  const handleCloseQuotationForm = () => {
    setShowQuotationForm(false);
    setSelectedInquiry(null);
  };

  const handleSendQuotation = async (quotationId) => {
    try {
      const response = await quotationAPI.sendQuotation(quotationId);
      
      if (response.data.success) {
        toast.success('Quotation sent to customer successfully!');
        // Refresh the quotations list with force refresh
        fetchData(true);
      } else {
        toast.error(response.data.message || 'Failed to send quotation');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error('Failed to send quotation');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-600">Loading user data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Back Office Dashboard</h1>
              <p className="mt-1 text-gray-600 text-sm">Manage inquiries, quotations, and orders</p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📄</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.inquiries}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">🏷️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quotations</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.quotations}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.orders}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-12 rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.completed}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Dashboard Navigation</h3>
              <nav className="flex flex-wrap gap-8">
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === 'inquiries'
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">📄</span>
                  <span>Inquiries</span>
                </button>
                <button
                  onClick={() => setActiveTab('quotations')}
                  className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === 'quotations'
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">🏷️</span>
                  <span>Quotations</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">📦</span>
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('material')}
                  className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === 'material'
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  <span>Material & Thickness Data</span>
                </button>
                <button
                  onClick={() => setActiveTab('subadmins')}
                  className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === 'subadmins'
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">👥</span>
                  <span>Sub-Admins</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'inquiries' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Inquiries</h3>
                <p className="text-sm text-gray-600 mt-1">Review and create quotations for customer inquiries</p>
              </div>
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        INQUIRY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CUSTOMER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TECHNICAL SPECIFICATIONS
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FILES
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {pendingInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inquiry.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inquiry.customer}</div>
                          <div className="text-sm text-gray-500">{inquiry.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {inquiry.parts && inquiry.parts.length > 0 ? (
                              <div className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                <div className="font-medium">{inquiry.parts[0].material}</div>
                                <div className="text-gray-500">{inquiry.parts[0].thickness} • Qty: {inquiry.parts[0].quantity}</div>
                                {inquiry.parts[0].remarks && (
                                  <div className="text-gray-400 truncate">{inquiry.parts[0].remarks}</div>
                                )}
                                {inquiry.parts.length > 1 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    +{inquiry.parts.length - 1} more parts
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">No specifications</div>
                            )}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {inquiry.files} files
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'quoted' ? 'bg-green-100 text-green-800' :
                            inquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            inquiry.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inquiry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/inquiry/${inquiry._id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Link>
                            {inquiry.status === 'pending' && (
                              <button
                                onClick={() => handleCreateQuotation(inquiry)}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Quote
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quotations</h3>
                <p className="text-sm text-gray-600 mt-1">Manage customer quotations and pricing</p>
              </div>
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inquiry ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quotation.inquiryId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-sm font-medium text-gray-900">{quotation.customer}</div>
                          <div className="text-sm text-gray-500">{quotation.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${quotation.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            quotation.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                            quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quotation.date}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/quotation/${quotation._id}`}
                                className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-sm font-medium"
                              >
                                View
                              </Link>
                              {quotation.status === 'draft' && (
                                <button 
                                  onClick={() => handleSendQuotation(quotation._id)}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md text-sm font-medium"
                                >
                                  Send
                                </button>
                              )}
                              {quotation.quotationPdf && (
                                <button
                                  onClick={() => {
                                    console.log('Opening quotation PDF:', quotation.quotationPdf);
                                    const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/quotations/${quotation.quotationPdf}`;
                                    console.log('PDF URL:', pdfUrl);
                                    window.open(pdfUrl, '_blank');
                                  }}
                                  className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium inline-flex items-center"
                                  title="View Quote PDF"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  Quote PDF
                                </button>
                              )}
                            </div>
                          </td>
                      </tr>
                    ))}
                    {quotations.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No quotations found
                        </td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Manage production orders and tracking</p>
              </div>
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'in_production' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'ready_for_dispatch' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'dispatched' ? 'bg-indigo-100 text-indigo-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                            to={`/order/${order._id}`}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                      </td>
                    </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <BackOfficeMaterialManagement />
          )}

          {activeTab === 'subadmins' && (
            <SubAdminManagement />
          )}
        </div>
      </div>

      {/* Quotation Form Modal */}
      {showQuotationForm && selectedInquiry && (
        <QuotationForm
          inquiry={selectedInquiry}
          onClose={handleCloseQuotationForm}
          onSuccess={handleQuotationSuccess}
        />
      )}
    </div>
  );
};

export default BackOfficeDashboard;
