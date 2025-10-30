import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inquiryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InquiryList = ({ showQuotations = false }) => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Refetch inquiries when filters change (but not for search term)
  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, sortBy]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      // Use different API based on user role
      let response;
      if (user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') {
        // Admin users get all inquiries
        response = await inquiryAPI.getAllInquiries();
      } else {
        // Customer users get their own inquiries
        response = await inquiryAPI.getInquiries({
          status: statusFilter,
          search: searchTerm,
          sortBy: sortBy === 'newest' ? 'createdAt' : 'inquiryNumber',
          sortOrder: sortBy === 'newest' ? 'desc' : 'asc'
        });
      }
      
      if (response.data.success) {
        // Transform the data to match the component's expected format
        const transformedInquiries = response.data.inquiries.map(inquiry => ({
          id: inquiry.inquiryNumber,
          shortId: inquiry.inquiryNumber.replace('INQ', '').slice(-4),
          status: inquiry.status,
          company: inquiry.customer?.companyName || 'N/A',
          contact: `${inquiry.customer?.firstName || ''} ${inquiry.customer?.lastName || ''}`.trim() || 'N/A',
          files: inquiry.files?.length || 0,
          parts: inquiry.parts?.length || 0,
          createdAt: new Date(inquiry.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          views: 0,
          _id: inquiry._id, // Keep the MongoDB ID for API calls
          // Add quotation information
          quotation: inquiry.quotation ? {
            id: inquiry.quotation._id,
            quotationNumber: inquiry.quotation.quotationNumber,
            status: inquiry.quotation.status,
            totalAmount: inquiry.quotation.totalAmount,
            validUntil: inquiry.quotation.validUntil
          } : null
        }));
        
        setInquiries(transformedInquiries);
      } else {
        toast.error(response.data.message || 'Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto ">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredInquiries = inquiries
    .filter(inquiry => {
      const matchesSearch = inquiry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inquiry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inquiry.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto ">
        <div className="px-4  sm:px-0">
          {/* Header */}
          <div className="sm:flex sm:items-center mb-8">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
              <p className="mt-2 text-gray-600">Manage and track your sheet metal part inquiries</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              {/* Only show New Inquiry button for customers */}
              {user?.role === 'customer' && (
                <Link
                  to="/inquiry/new"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Inquiry
                </Link>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search Bar - Fixed Width */}
              <div className="w-full lg:w-80">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Filters - Better Styling */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white block w-full sm:w-40 px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="approved">Approved</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white block w-full sm:w-40 px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="status">By Status</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry List */}
          <div 
            className="space-y-4 max-h-96 overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}
          >
            {filteredInquiries.map((inquiry) => (
              <Link 
                key={inquiry.id} 
                to={`/inquiry/${inquiry._id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow hover:border-blue-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Status Badge */}
                    {/* <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-green-100 border-2 border-green-200 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-green-800 font-bold text-sm">{inquiry.shortId}</span>
                      </div>
                    </div> */}
                    
                    {/* Inquiry Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{inquiry.id}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inquiry.status === 'quoted' 
                            ? 'bg-green-100 text-green-800' 
                            : inquiry.status === 'approved' || inquiry.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inquiry.status === 'quoted' ? (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {inquiry.company} • {inquiry.contact}
                      </p>
                      
                      <p className="text-sm text-gray-700">
                        Files: {inquiry.files} uploaded <span className="font-semibold">Parts: {inquiry.parts} specifications</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Side Info */}
                  <div className="flex flex-col items-end text-right">
                    <p className="text-sm text-gray-500 mb-1">Created {inquiry.createdAt}</p>
                    
                    {/* Quotation Status and Actions */}
                    {inquiry.quotation && (
                      <div className="mt-2 mb-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            inquiry.quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            inquiry.quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            inquiry.quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.quotation.status === 'sent' ? 'Quotation Ready' :
                             inquiry.quotation.status === 'accepted' ? 'Accepted' :
                             inquiry.quotation.status === 'rejected' ? 'Rejected' :
                             inquiry.quotation.status}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${inquiry.quotation.totalAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        
                        {inquiry.quotation.status === 'sent' && (
                          <div className="flex space-x-2">
                            <Link
                              to={`/quotation/${inquiry.quotation.id}/response`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              ✓ Accept Quotation
                            </Link>
                            <Link
                              to={`/quotation/${inquiry.quotation.id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                          </div>
                        )}
                        
                        {inquiry.quotation.status === 'accepted' && (
                          <div className="flex space-x-2">
                            <Link
                              to={`/quotation/${inquiry.quotation.id}/payment`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              💳 Make Payment
                            </Link>
                            <Link
                              to={`/quotation/${inquiry.quotation.id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                          </div>
                        )}
                        
                        {inquiry.quotation.status === 'rejected' && (
                          <div className="text-sm text-gray-500">
                            Quotation rejected
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">{inquiry.views}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No inquiries found</div>
              {/* Only show inquiry creation button for customers, not for admin/backoffice users */}
              {user?.role === 'customer' && (
                <Link
                  to="/inquiry/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Create your first inquiry
                </Link>
              )}
              {/* Show different message for admin users */}
              {user?.role !== 'customer' && (
                <div className="text-gray-500 text-sm">
                  No inquiries found. Inquiries will appear here once customers submit them.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryList;
