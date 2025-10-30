import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inquiryAPI, quotationAPI } from '../../services/api';
import QuotationPreparationModal from '../../components/QuotationPreparationModal';
import { useAuth } from '../../contexts/AuthContext';

const InquiryDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  // Function to download Technical Specifications as Excel
  const handleDownloadExcel = () => {
    if (!inquiry) return;
    
    try {
      // Create CSV data (Excel-compatible) - ONLY Technical Specifications
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add inquiry header for reference
      csvContent += `INQUIRY: ${inquiry.inquiryNumber || inquiry.id}\n`;
      csvContent += `CREATED: ${inquiry.createdAt}\n`;
      csvContent += `CUSTOMER: ${inquiry.customer?.name || 'N/A'}\n\n`;
      
      // Add Technical Specifications Table Header
      csvContent += "TECHNICAL SPECIFICATIONS\n\n";
      csvContent += "Part Name,Material,Thickness,Grade,Quantity,Remarks\n";
      
      // Add parts data
      if (inquiry.specifications && inquiry.specifications.length > 0) {
        inquiry.specifications.forEach(part => {
          const partName = part.partRef || part.partName || part.fileName || 'N/A';
          const material = part.material || 'N/A';
          const thickness = part.thickness || 'N/A';
          const grade = part.grade || 'N/A';
          const quantity = part.quantity || 'N/A';
          const remarks = part.remarks || 'No remarks';
          
          csvContent += `"${partName}","${material}","${thickness}","${grade}","${quantity}","${remarks}"\n`;
        });
      } else {
        csvContent += "No technical specifications available\n";
      }
      
      csvContent += "\n";
      csvContent += `\nTotal Parts: ${inquiry.specifications?.length || 0}\n`;
      csvContent += `\nNote: Download individual files separately from the Uploaded Files section\n`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Technical_Specifications_${inquiry.inquiryNumber || inquiry.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Technical Specifications downloaded successfully!');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    }
  };

  useEffect(() => {
    if (user) {
      fetchInquiry();
    }
  }, [id, user]);

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING INQUIRY ===');
      console.log('Inquiry ID:', id);
      console.log('User object:', user);
      console.log('User role:', user?.role);
      console.log('User ID:', user?._id);
      
      // Check if user is loaded
      if (!user) {
        console.log('User not loaded yet, waiting...');
        setLoading(false);
        return;
      }
      
      // Check if ID is valid
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid inquiry ID:', id);
        toast.error('Invalid inquiry ID');
        setLoading(false);
        return;
      }
      
      // Check if user has a valid token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login to view inquiry details');
        window.location.href = '/login';
        setLoading(false);
        return;
      }
      
      // Use admin API if user is admin/backoffice, otherwise use regular API
      const isAdmin = user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin';
      console.log('Is admin:', isAdmin);
      console.log('User role check:', {
        role: user?.role,
        isAdmin: user?.role === 'admin',
        isBackoffice: user?.role === 'backoffice',
        isSubadmin: user?.role === 'subadmin'
      });
      
      // Temporary workaround: if user email is admin@gmail.com, treat as admin
      const isAdminByEmail = user?.email === 'admin@gmail.com';
      const finalIsAdmin = isAdmin || isAdminByEmail;
      console.log('Final admin check:', { isAdmin, isAdminByEmail, finalIsAdmin });
      
      let response;
      try {
        if (finalIsAdmin) {
          console.log('Using admin API...');
          response = await inquiryAPI.getInquiryAdmin(id);
        } else {
          console.log('Using regular API...');
          response = await inquiryAPI.getInquiry(id);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        console.error('API error response:', apiError.response?.data);
        console.error('API error status:', apiError.response?.status);
        console.error('API error headers:', apiError.response?.headers);
        
        // Check for specific error types
        if (apiError.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied. You do not have permission to view this inquiry.');
          return;
        } else if (apiError.response?.status === 404) {
          toast.error('Inquiry not found.');
          return;
        } else if (apiError.response?.status === 500) {
          toast.error('Server error. Please try again later.');
          return;
        } else if (apiError.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check if the backend server is running on port 5000.');
          return;
        } else {
          toast.error(`API Error: ${apiError.response?.data?.message || apiError.message}`);
          return;
        }
      }
      
      console.log('API Response:', response);
      
      if (response.data.success) {
        const inquiryData = response.data.inquiry;
        console.log('Inquiry data received:', inquiryData);
        
        // Transform the data to match the component's expected format
        setInquiry({
          id: inquiryData.inquiryNumber,
          inquiryId: inquiryData._id,
          status: inquiryData.status,
          createdAt: new Date(inquiryData.createdAt).toLocaleString(),
          customer: {
            name: `${inquiryData.customer.firstName} ${inquiryData.customer.lastName}`,
            company: inquiryData.customer.companyName || 'N/A'
          },
          deliveryAddress: inquiryData.deliveryAddress || {
            street: 'N/A',
            city: 'N/A',
            country: 'N/A'
          },
          specifications: inquiryData.parts || [],
          files: inquiryData.files || [],
          specialInstructions: inquiryData.specialInstructions || 'No special instructions',
          timeline: generateTimeline(inquiryData)
        });
      } else {
        console.log('API returned error:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch inquiry details');
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error stack:', error.stack);
      toast.error('Failed to fetch inquiry details');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (inquiryData) => {
    const timeline = [
      {
        event: 'Inquiry Created',
        date: new Date(inquiryData.createdAt).toLocaleString(),
        status: 'completed',
        color: 'green'
      }
    ];

    if (inquiryData.status === 'quoted' || inquiryData.status === 'order_created') {
      timeline.push({
        event: 'Under Review',
        description: 'Being processed by our team',
        status: 'completed',
        color: 'blue'
      });
      
      timeline.push({
        event: 'Quotation Ready',
        description: 'Price and delivery details available',
        status: 'completed',
        color: 'green'
      });
    }

    if (inquiryData.status === 'order_created') {
      timeline.push({
        event: 'Order Created',
        description: 'Order has been placed',
        status: 'completed',
        color: 'purple'
      });
    }

    return timeline;
  };

  const handleCreateQuotation = async (inquiryId, files) => {
    try {
      console.log('=== CREATING QUOTATION ===');
      console.log('Files:', files);
      console.log('Has files:', files && files.length > 0);
      console.log('Inquiry specifications:', inquiry?.specifications);
      console.log('Specifications length:', inquiry?.specifications?.length);
      
      // Calculate total amount from inquiry parts
      const totalAmount = inquiry?.specifications?.reduce((total, part) => {
        return total + (part.quantity * (part.unitPrice || 0));
      }, 0) || 0;

      // Use FormData if files are provided
      const formData = new FormData();
      formData.append('inquiryId', inquiry?.inquiryId || inquiryId);
      formData.append('totalAmount', totalAmount);
      formData.append('parts', JSON.stringify(inquiry?.specifications || []));
      formData.append('terms', 'Standard manufacturing terms apply. Payment required before production begins.');
      formData.append('notes', '');
      formData.append('validUntil', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      
      // Add file if provided
      if (files && files.length > 0) {
        console.log('Adding file to FormData:', files[0].name);
        formData.append('uploadedFile', files[0]); // Backend expects 'uploadedFile'
      }

      console.log('Creating quotation with FormData');
      console.log('Parts being sent:', inquiry?.specifications?.length, 'parts');
      
      // Call quotation API with FormData
      const response = await quotationAPI.createQuotation(formData);
      
      console.log('Quotation creation response:', response.data);
      
      if (response.data.success) {
        toast.success('Quotation created and sent successfully!');
        // Refresh inquiry data to show updated status
        await fetchInquiry();
      } else {
        throw new Error(response.data.message || 'Failed to create quotation');
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to create quotation');
      throw error;
    }
  };

  const handleUploadQuotation = async (inquiryId, files) => {
    try {
      if (!files || files.length === 0) {
        throw new Error('Please upload a quotation PDF');
      }

      console.log('=== UPLOADING QUOTATION PDF ===');
      console.log('Files to upload:', files);
      console.log('First file:', files[0]);
      console.log('File name:', files[0]?.name);
      console.log('File type:', files[0]?.type);
      console.log('File size:', files[0]?.size);
      console.log('Inquiry ID:', inquiry?.inquiryId || inquiryId);
      console.log('Inquiry specifications:', inquiry?.specifications);
      console.log('Specifications length:', inquiry?.specifications?.length);

      const formData = new FormData();
      formData.append('inquiryId', inquiry?.inquiryId || inquiryId);
      formData.append('quotationPdf', files[0]);
      
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
      
      // Include parts data
      const parts = inquiry?.specifications || [];
      formData.append('parts', JSON.stringify(parts));
      
      console.log('Parts being uploaded:', parts);
      console.log('Parts array length:', parts.length);
      
      // Calculate total amount
      const totalAmount = parts.reduce((total, part) => {
        return total + (part.quantity * (part.unitPrice || 0));
      }, 0) || 0;
      formData.append('totalAmount', totalAmount);
      
      console.log('Total amount:', totalAmount);
      
      // Customer info
      const customerInfo = {
        name: inquiry?.customer?.name || 'N/A',
        company: inquiry?.customer?.company || 'N/A',
        email: inquiry?.customer?.email || 'N/A',
        phone: inquiry?.customer?.phone || 'N/A'
      };
      formData.append('customerInfo', JSON.stringify(customerInfo));

      console.log('Uploading quotation PDF with parts data');
      
      // Call upload quotation API (FIXED: using quotationAPI instead of inquiryAPI)
      const response = await quotationAPI.uploadQuotation(formData);
      
      console.log('Upload quotation response:', response.data);
      
      if (response.data.success) {
        toast.success('Quotation uploaded and sent successfully!');
        // Refresh inquiry data
        await fetchInquiry();
      } else {
        throw new Error(response.data.message || 'Failed to upload quotation');
      }
    } catch (error) {
      console.error('Error uploading quotation:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload quotation');
      throw error;
    }
  };

  const handleFileDownload = async (file) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to download files');
        return;
      }

      // Use the correct API base URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiBaseUrl}/inquiry/${id}/files/${file.fileName || file.name}/download`;
      
      console.log('Download URL:', downloadUrl);
      console.log('File data:', file);
      console.log('Inquiry ID:', id);
      console.log('File name:', file.fileName || file.name);
      
      // First, test if the backend is accessible
      try {
        const healthResponse = await fetch(`${apiBaseUrl.replace('/api', '')}/api/health`);
        if (healthResponse.ok) {
          console.log('Backend is accessible');
        } else {
          console.log('Backend health check failed');
        }
      } catch (healthError) {
        console.log('Backend health check error:', healthError);
        toast.error('Backend server is not accessible. Please check if the server is running on port 5000.');
        return;
      }
      
      // Add authorization header by creating a fetch request first
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        throw new Error(`Download failed: ${response.status} ${errorText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error.message}`);
    }
  };

  const handleDownloadAllFiles = async () => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to download files');
        return;
      }

      // Check if there are files to download
      if (!inquiry.files || inquiry.files.length === 0) {
        toast.error('No files available to download');
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiBaseUrl}/inquiry/${id}/files/download-all`;
      
      console.log('Downloading all files as ZIP...');
      console.log('Download URL:', downloadUrl);
      console.log('Total files:', inquiry.files.length);

      toast.loading('Creating ZIP file...', { id: 'zip-download' });

      // Make the request
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ZIP download failed:', response.status, errorText);
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${inquiry.inquiryNumber || inquiry.id}_files.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${inquiry.files.length} files downloaded as ZIP`, { id: 'zip-download' });
    } catch (error) {
      console.error('ZIP download error:', error);
      toast.error(`Failed to download files: ${error.message}`, { id: 'zip-download' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
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
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Inquiry not found</h1>
            <Link 
              to='/dashboard'
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
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
            <Link
              to='/dashboard'
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Inquiry Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{inquiry.id}</h1>
                <p className="text-sm text-gray-500 mt-1">Created on {inquiry.createdAt}</p>
              </div>
              <div className="flex space-x-3">
                {/* Download Technical Specifications as Excel - Show for Admin, Back Office, and Sub Admin users */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <button 
                    onClick={handleDownloadExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                    title="Download Technical Specifications as Excel"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Data
                  </button>
                )}
                
                {/* Quoted Status Button - Only show if quotation has been sent */}
                {inquiry?.status === 'quoted' && (
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 flex items-center cursor-default">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Quoted
                  </button>
                )}
                
                {/* Only show Create Quotation for Back Office and Sub Admin users (excluding admin) */}
                {(user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <button 
                    onClick={() => {
                      console.log('Create Quotation button clicked');
                      console.log('Current showQuotationModal:', showQuotationModal);
                      setShowQuotationModal(true);
                      console.log('Setting showQuotationModal to true');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Create Quotation
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications - Full Width */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Specifications</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        PART REF
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        MATERIAL
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        THICKNESS
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        GRADE
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        REMARK
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        QUANTITY
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiry.specifications && inquiry.specifications.length > 0 ? (
                    inquiry.specifications.map((spec, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span 
                              title={spec.partRef || spec.fileName || 'N/A'}
                              className="cursor-help max-w-[120px] truncate"
                            >
                              {(() => {
                                const fileName = spec.partRef || spec.fileName || 'N/A';
                                console.log('Filename:', fileName, 'Length:', fileName.length);
                                if (fileName.length > 10) {
                                  const truncated = fileName.substring(0, 10) + '...';
                                  console.log('Truncated:', truncated);
                                  return truncated;
                                }
                                return fileName;
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{spec.material || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.thickness || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.grade || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.remarks || spec.remark || 'No remarks'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.quantity || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                        No technical specifications available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">

              {/* Uploaded Files */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                  {inquiry.files && inquiry.files.length > 0 && (
                    <button
                      onClick={handleDownloadAllFiles}
                      className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm"
                      title="Download all files as ZIP"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download All ({inquiry.files.length})
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {inquiry.files && inquiry.files.length > 0 ? (
                    inquiry.files.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs">
                              {file.fileType === '.zip' ? '📦' : 
                               file.fileType === '.xlsx' || file.fileType === '.xls' || file.fileType === '.xlsm' ? '📊' : 
                               file.fileType === '.pdf' ? '📄' : '📄'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p 
                            className="text-sm font-medium text-gray-900 truncate max-w-[200px]" 
                            title={file.originalName || file.name}
                          >
                            {(() => {
                              const fileName = file.originalName || file.name || 'N/A';
                              if (fileName.length > 30) {
                                return fileName.substring(0, 30) + '...';
                              }
                              return fileName;
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.fileType || file.type} • {(file.fileSize || file.size) ? `${Math.round((file.fileSize || file.size) / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title={`Download ${file.originalName || file.name}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">📄</div>
                      <p className="text-sm text-gray-500">No files uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  {inquiry.timeline.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          event.color === 'green' ? 'bg-green-500' : 
                          event.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        {event.description && (
                          <p className="text-xs text-gray-600">{event.description}</p>
                        )}
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Special Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{inquiry.specialInstructions}</p>
                </div>
              </div> */}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-900">{inquiry.customer.name}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm text-gray-900">{inquiry.customer.company}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-900">{inquiry.deliveryAddress.street}</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">{inquiry.deliveryAddress.city}</p>
                  <p className="text-sm text-gray-700 ml-8">{inquiry.deliveryAddress.country}</p>
                </div>
              </div>

              {/* Timeline */}
              
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Preparation Modal */}
      {console.log('Rendering modal check:', { showQuotationModal, inquiry: inquiry?.id })}
      {showQuotationModal && (
        <QuotationPreparationModal
          isOpen={showQuotationModal}
          onClose={() => setShowQuotationModal(false)}
          inquiryId={inquiry?.inquiryId}
          inquiryNumber={inquiry?.id}
          parts={inquiry?.specifications || []}
          customerInfo={{
            name: inquiry?.customer?.name || 'N/A',
            company: inquiry?.customer?.company || 'N/A',
            email: inquiry?.customer?.email || 'N/A'
          }}
          totalAmount={inquiry?.specifications?.reduce((total, part) => {
            return total + (part.quantity * (part.unitPrice || 0));
          }, 0) || 0}
          onCreateQuotation={handleCreateQuotation}
          onUploadQuotation={handleUploadQuotation}
        />
      )}
    </div>
  );
};

export default InquiryDetail;
