import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inquiryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ComponentManagerPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

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
        response = await inquiryAPI.getInquiries();
      }
      
      if (response.data.success) {
        // Transform the data to match the component's expected format
        const transformedInquiries = response.data.inquiries.map(inquiry => ({
          id: inquiry.inquiryNumber,
          components: inquiry.parts?.length || 0,
          createdAt: new Date(inquiry.createdAt).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
          }),
          status: inquiry.status,
          preview: inquiry.parts && inquiry.parts.length > 0 
            ? `(${inquiry.parts[0].material || 'steel'}, ${inquiry.parts[0].thickness || '2mm'})`
            : '(No components)',
          _id: inquiry._id
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

  // Filter inquiries based on search term
  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="sm:flex sm:items-center mb-8">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900">Component Manager</h1>
              <p className="mt-2 text-gray-600">Manage materials, thickness, and component specifications for your inquiries</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              {/* Only show New Inquiry button for customers */}
              {user?.role === 'customer' && (
                <Link
                  to="/inquiry/new"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Inquiry
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search inquiries, part refs, or materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Your Inquiries Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Inquiries ({filteredInquiries.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Select an inquiry to manage its components</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}>
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900">{inquiry.id}</h4>
                      <p className="text-sm text-gray-600">{inquiry.components} components • Created {inquiry.createdAt}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">COMPONENTS PREVIEW</span>
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">
                            {inquiry.preview}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                    <Link
                      to={`/component-manager/${inquiry._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Manage Components
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No inquiries found</div>
              {/* Only show inquiry creation button for customers, not for admin/backoffice users */}
              {user?.role === 'customer' && (
                <Link
                  to="/inquiry/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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

export default ComponentManagerPage;
