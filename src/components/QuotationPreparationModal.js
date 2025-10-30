import React, { useState } from 'react';
import { XMarkIcon, DocumentIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QuotationPreparationModal = ({ 
  isOpen, 
  onClose, 
  inquiryId,
  inquiryNumber,
  parts = [],
  customerInfo, 
  totalAmount,
  onCreateQuotation,
  onUploadQuotation 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['pdf'].includes(extension);
    });
    
    if (validFiles.length !== files.length) {
      toast.error('Only PDF files are allowed');
    }
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} PDF file(s) uploaded successfully`);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['pdf'].includes(extension);
    });
    
    if (validFiles.length !== files.length) {
      toast.error('Only PDF files are allowed');
    }
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} PDF file(s) uploaded successfully`);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateQuotation = async () => {
    setLoading(true);
    try {
      await onCreateQuotation(inquiryId, uploadedFiles);
      toast.success('Quotation created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadQuotation = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload a quotation PDF first');
      return;
    }
    
    setLoading(true);
    try {
      await onUploadQuotation(inquiryId, uploadedFiles);
      toast.success('Quotation uploaded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to upload quotation');
    } finally {
      setLoading(false);
    }
  };

  console.log('QuotationPreparationModal rendering:', { isOpen, inquiryId, customerInfo, totalAmount });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" style={{ minHeight: '600px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Quotation for {inquiryId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" style={{ minHeight: '400px' }}>
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><span className="font-medium">Inquiry:</span> {inquiryNumber}</p>
              <p><span className="font-medium">Name:</span> {customerInfo.name}</p>
              <p><span className="font-medium">Company:</span> {customerInfo.company}</p>
              <p><span className="font-medium">Email:</span> {customerInfo.email}</p>
            </div>
          </div>

          {/* Parts Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Parts & Specifications</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-60">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thickness</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parts && parts.length > 0 ? (
                      parts.map((part, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{part.partRef || part.partName || part.fileName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{part.material || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{part.thickness || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{part.grade || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{part.quantity || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                          No parts data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total {parts?.length || 0} part(s)</p>
          </div>

          {/* PDF Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Quotation PDF (Optional)</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your quotation PDF here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  browse files
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Only PDF files are allowed</p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
            <span className="text-lg font-medium text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">${totalAmount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadQuotation}
            disabled={loading || uploadedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Quotation'}
          </button>
          <button
            onClick={handleCreateQuotation}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreparationModal;
