import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quotationAPI, inquiryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const QuotationResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await quotationAPI.getQuotation(id);
      
      console.log('=== QUOTATION RESPONSE DEBUG ===');
      console.log('Full response:', response.data);
      console.log('Quotation object:', response.data.quotation);
      console.log('Items array:', response.data.quotation?.items);
      console.log('Items length:', response.data.quotation?.items?.length);
      
      if (response.data.success) {
        let quotationData = response.data.quotation;
        
        // If quotation has no items but has an inquiry ID, fetch inquiry parts as fallback
        if ((!quotationData.items || quotationData.items.length === 0) && quotationData.inquiryId) {
          console.log('Quotation has no items, fetching inquiry parts as fallback...');
          console.log('Inquiry ID:', quotationData.inquiryId);
          try {
            const inquiryResponse = await inquiryAPI.getInquiryAdmin(quotationData.inquiryId);
            console.log('Inquiry response:', inquiryResponse.data);
            
            if (inquiryResponse.data.success && inquiryResponse.data.inquiry?.parts) {
              console.log('Found inquiry parts:', inquiryResponse.data.inquiry.parts);
              const parts = inquiryResponse.data.inquiry.parts;
              const totalAmount = quotationData.totalAmount || 0;
              const totalQuantity = parts.reduce((sum, part) => sum + (part.quantity || 0), 0);
              
              // Calculate prices proportionally based on quantity
              quotationData.items = parts.map(part => {
                const quantity = part.quantity || 0;
                // Calculate proportional price based on quantity
                const itemTotalPrice = totalQuantity > 0 ? (totalAmount * quantity) / totalQuantity : totalAmount / parts.length;
                const unitPrice = quantity > 0 ? itemTotalPrice / quantity : itemTotalPrice;
                
                return {
                  partRef: part.partRef || part.partName || 'N/A',
                  material: part.material || 'N/A',
                  thickness: part.thickness || 'N/A',
                  quantity: quantity,
                  unitPrice: unitPrice,
                  totalPrice: itemTotalPrice,
                  remark: part.remarks || ''
                };
              });
              console.log('Mapped items from inquiry with calculated prices:', quotationData.items);
              toast.success('Parts data loaded from inquiry');
            }
          } catch (inquiryError) {
            console.error('Failed to fetch inquiry parts:', inquiryError);
            // Try regular inquiry endpoint as fallback
            try {
              const inquiryResponseRegular = await inquiryAPI.getInquiry(quotationData.inquiryId);
              if (inquiryResponseRegular.data.success && inquiryResponseRegular.data.inquiry?.parts) {
                console.log('Found inquiry parts (regular endpoint):', inquiryResponseRegular.data.inquiry.parts);
                const parts = inquiryResponseRegular.data.inquiry.parts;
                const totalAmount = quotationData.totalAmount || 0;
                const totalQuantity = parts.reduce((sum, part) => sum + (part.quantity || 0), 0);
                
                quotationData.items = parts.map(part => {
                  const quantity = part.quantity || 0;
                  const itemTotalPrice = totalQuantity > 0 ? (totalAmount * quantity) / totalQuantity : totalAmount / parts.length;
                  const unitPrice = quantity > 0 ? itemTotalPrice / quantity : itemTotalPrice;
                  
                  return {
                    partRef: part.partRef || part.partName || 'N/A',
                    material: part.material || 'N/A',
                    thickness: part.thickness || 'N/A',
                    quantity: quantity,
                    unitPrice: unitPrice,
                    totalPrice: itemTotalPrice,
                    remark: part.remarks || ''
                  };
                });
                toast.success('Parts data loaded from inquiry');
              }
            } catch (secondError) {
              console.error('Failed to fetch inquiry parts (second attempt):', secondError);
              // Continue without inquiry parts
            }
          }
        }
        
        setQuotation(quotationData);
      } else {
        toast.error(response.data.message || 'Failed to fetch quotation');
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e) => {
    // Prevent event bubbling and default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent multiple clicks
    if (acceptLoading || rejectLoading) {
      console.log('Already processing, ignoring click');
      return;
    }
    
    console.log('=== ACCEPTING QUOTATION ===');
    setAcceptLoading(true);
    
    try {
      const response = await quotationAPI.respondToQuotation(id, {
        response: 'accepted',
        notes: 'Quotation accepted by customer'
      });
      
      console.log('Accept response:', response.data);
      
      if (response.data.success) {
        toast.success('Quotation accepted successfully! Redirecting to payment...');
        // Navigate to payment page
        setTimeout(() => {
          navigate(`/quotation/${id}/payment`);
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to accept quotation');
        setAcceptLoading(false);
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      toast.error('Failed to accept quotation');
      setAcceptLoading(false);
    }
  };

  const handleReject = async (e) => {
    // Prevent event bubbling and default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent multiple clicks
    if (acceptLoading || rejectLoading) {
      console.log('Already processing, ignoring click');
      return;
    }
    
    // Confirm rejection
    const confirmReject = window.confirm('Are you sure you want to reject this quotation?');
    if (!confirmReject) {
      return;
    }
    
    console.log('=== REJECTING QUOTATION ===');
    setRejectLoading(true);
    
    try {
      const response = await quotationAPI.respondToQuotation(id, {
        response: 'rejected',
        notes: 'Quotation rejected by customer'
      });
      
      console.log('Reject response:', response.data);
      
      if (response.data.success) {
        toast.success('Quotation rejected');
        setQuotation({ ...quotation, status: 'rejected' });
      } else {
        toast.error(response.data.message || 'Failed to reject quotation');
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      toast.error('Failed to reject quotation');
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
            <Link to="/inquiries" className="text-blue-600 hover:text-blue-800">
              Back to Inquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              // Check user role to determine where to go back
              const isAdmin = user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin';
              if (isAdmin) {
                navigate('/dashboard');
              } else {
                navigate('/inquiries');
              }
            }}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin' ? 'Dashboard' : 'Inquiries'}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation Response</h1>
          {/* <p className="text-lg text-gray-600">Review and respond to your quotation</p> */}
        </div>

        {/* Quotation Details Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation #{quotation.quotationNumber}</h2>
              <p className="text-lg text-gray-700">Inquiry #{quotation.inquiry?.inquiryNumber || 'N/A'}</p>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-600 font-medium mb-1">Valid Until</p>
              <p className="text-xl font-bold text-gray-900">
                {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Quotation PDF Section */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Quotation Details</h3>
          </div>
          
          {/* PDF Viewer/Download Section */}
          <div className="px-6 py-8">
            {quotation.quotationPdf ? (
              <div className="space-y-6">
                {/* PDF Icon and Info */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                      <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Quotation Document</h4>
                    <p className="text-sm text-gray-600 mb-4">View or download your detailed quotation PDF</p>
                  </div>
                </div>

                {/* PDF Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/quotations/${quotation.quotationPdf}`;
                      window.open(pdfUrl, '_blank');
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Quotation PDF
                  </button>
                  
                  <a
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/quotations/${quotation.quotationPdf}`}
                    download
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow hover:shadow-lg transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>

                {/* PDF Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h5 className="text-sm font-semibold text-blue-900 mb-1">About Your Quotation</h5>
                      <p className="text-sm text-blue-800">
                        This PDF contains detailed information about parts, pricing, specifications, and terms & conditions. Please review carefully before accepting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No PDF Available</h4>
                <p className="text-sm text-gray-600">The quotation PDF is being prepared. Please check back later or contact support.</p>
              </div>
            )}
          </div>

          {/* Total Amount Section */}
          <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Amount:</span>
              <span className="text-3xl font-bold text-blue-600">
                ₹{quotation.totalAmount?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Terms & Conditions</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed text-sm">{quotation.terms || 'Standard manufacturing terms apply. Payment required before production begins.'}</p>
          </div>
        </div>

        {/* Additional Notes */}
        {quotation.notes && (
          <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
            </div>
            <div className="px-6 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed text-sm">{quotation.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {quotation.status === 'sent' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to proceed?</h3>
              <p className="text-gray-600 text-sm">Choose your response to this quotation</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleAccept}
                disabled={acceptLoading || rejectLoading}
                className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200"
              >
                {acceptLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Quotation & Create Order
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReject}
                disabled={acceptLoading || rejectLoading}
                className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white text-base font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200"
              >
                {rejectLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {quotation.status === 'accepted' && (
          <div className="text-center mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-green-800 font-bold text-xl mb-2">Quotation Accepted!</p>
              <p className="text-green-600 text-lg">
                Your order has been confirmed. You will receive further updates via email.
              </p>
            </div>
          </div>
        )}

        {quotation.status === 'rejected' && (
          <div className="text-center mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-red-800 font-bold text-xl mb-2">Quotation Rejected</p>
              <p className="text-red-600 text-lg">
                This quotation has been rejected. You can create a new inquiry if needed.
              </p>
            </div>
          </div>
        )}

        {/* Secure Transaction Message */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-blue-800 font-semibold text-lg">
                <strong>Secure Transaction.</strong> Your response will be securely processed and an order will be created upon acceptance.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default QuotationResponse;
