import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { inquiryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ComponentManager from '../components/ComponentManager';

const ComponentManagerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInquiry();
    }
  }, [id]);

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      
      // Use different API based on user role
      let response;
      if (user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') {
        // Admin users can access any inquiry
        response = await inquiryAPI.getInquiryAdmin(id);
      } else {
        // Customer users can only access their own inquiries
        response = await inquiryAPI.getInquiry(id);
      }
      
      if (response.data.success) {
        setInquiry(response.data.inquiry);
      } else {
        toast.error(response.data.message || 'Failed to fetch inquiry');
        navigate('/component-manager');
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      toast.error('Failed to fetch inquiry');
      navigate('/component-manager');
    } finally {
      setLoading(false);
    }
  };

  const handleComponentsChange = () => {
    // Refresh inquiry data after components change
    fetchInquiry();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">Inquiry not found</div>
              <Link
                to="/component-manager"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Component Manager
              </Link>
            </div>
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
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Component Manager - {inquiry.inquiryNumber}
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage components for inquiry {inquiry.inquiryNumber}
                </p>
              </div>
              <Link
                to="/component-manager"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Inquiries
              </Link>
            </div>
          </div>

          {/* Inquiry Info */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Inquiry Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{inquiry.inquiryNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                      inquiry.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Component Manager */}
          <ComponentManager 
            inquiryId={inquiry._id} 
            onComponentsChange={handleComponentsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentManagerDetail;
