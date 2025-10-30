import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { quotationAPI, pdfAPI } from '../services/api';
import toast from 'react-hot-toast';

const QuotationForm = ({ inquiry, inquiries = [], onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [formData, setFormData] = useState({
    terms: 'Standard manufacturing terms apply. Payment required before production begins.',
    notes: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });
  
  // New state for bulk pricing
  const [isBulkPricing, setIsBulkPricing] = useState(false);
  const [bulkPricingFile, setBulkPricingFile] = useState(null);
  const [bulkPricingData, setBulkPricingData] = useState(null);
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false);
  const [materialPricing, setMaterialPricing] = useState({});
  
  // New state for upload quotation mode
  const [isUploadQuotation, setIsUploadQuotation] = useState(false);
  
  const [uploadedQuotationFile, setUploadedQuotationFile] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pdfProcessed, setPdfProcessed] = useState(false);
  
  // Determine if this is for multiple inquiries
  const isMultipleInquiries = inquiries && inquiries.length > 1;
  const currentInquiry = inquiry || (inquiries && inquiries[0]);

  // Helper function to safely extract customer data
  const getCustomerData = () => {
    if (!inquiry || !inquiry.customerData) {
      return {
        firstName: 'N/A',
        lastName: '',
        companyName: 'N/A',
        email: 'N/A'
      };
    }
    
    // Handle both object and string cases
    if (typeof inquiry.customerData === 'object') {
      return {
        firstName: inquiry.customerData.firstName || 'N/A',
        lastName: inquiry.customerData.lastName || '',
        companyName: inquiry.customerData.companyName || 'N/A',
        email: inquiry.customerData.email || 'N/A'
      };
    }
    
    return {
      firstName: 'N/A',
      lastName: '',
      companyName: 'N/A',
      email: 'N/A'
    };
  };

  useEffect(() => {
    console.log('QuotationForm useEffect - inquiry:', inquiry);
    
    // Reset upload quotation mode when component mounts or inquiry changes
    setIsUploadQuotation(false);
    setPdfProcessed(false);
    setTotalAmount(0);
    
    if (inquiry) {
      // Initialize parts with inquiry data and add pricing fields
      // Ensure parts is an array before mapping
      const inquiryParts = Array.isArray(inquiry.parts) ? inquiry.parts : [];
      console.log('QuotationForm useEffect - inquiryParts:', inquiryParts);
      
      if (inquiryParts.length > 0) {
        const initialParts = inquiryParts.map(part => ({
          ...part,
          unitPrice: 0,
          totalPrice: 0,
          grade: part.grade || '',
          remarks: part.remarks || ''
        }));
        console.log('QuotationForm useEffect - setting parts from inquiry:', initialParts);
        setParts(initialParts);
      } else {
        // If no parts exist, create a default part
        const defaultPart = {
          partRef: 'Sample Part',
          material: 'Zintec',
          thickness: '1.5',
          grade: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          remarks: ''
        };
        console.log('QuotationForm useEffect - setting default part:', defaultPart);
        setParts([defaultPart]);
      }
    }
  }, [inquiry]);

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...parts];
    updatedParts[index] = {
      ...updatedParts[index],
      [field]: value
    };

    // Calculate total price when unit price or quantity changes
    if (field === 'unitPrice' || field === 'quantity') {
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : updatedParts[index].unitPrice;
      const quantity = field === 'quantity' ? parseInt(value) || 0 : updatedParts[index].quantity;
      updatedParts[index].totalPrice = unitPrice * quantity;
    }

    setParts(updatedParts);
  };

  const addPart = () => {
    setParts([...parts, {
      partRef: '',
      material: 'Zintec',
      thickness: '1.5',
      grade: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      remarks: ''
    }]);
  };

  // Handle bulk pricing file upload
  const handleBulkPricingFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBulkPricingFile(file);
      
      // Parse Excel/CSV file to extract pricing data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // This is a simplified parser - you might want to use a library like xlsx
          const text = e.target.result;
          const lines = text.split('\n');
          const pricingData = [];
          
          // Skip header row and parse data
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length >= 3) {
              pricingData.push({
                partRef: row[0]?.trim(),
                material: row[1]?.trim(),
                unitPrice: parseFloat(row[2]) || 0
              });
            }
          }
          
          setBulkPricingData(pricingData);
          toast.success('Bulk pricing file loaded successfully');
        } catch (error) {
          console.error('Error parsing file:', error);
          toast.error('Error parsing pricing file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Apply bulk pricing to all inquiries
  const applyBulkPricing = () => {
    if (!bulkPricingData || bulkPricingData.length === 0) {
      toast.error('No pricing data available');
      return;
    }

    // Apply pricing to current parts
    const updatedParts = parts.map(part => {
      const pricingMatch = bulkPricingData.find(pricing => 
        pricing.partRef === part.partRef && pricing.material === part.material
      );
      
      if (pricingMatch) {
        return {
          ...part,
          unitPrice: pricingMatch.unitPrice,
          totalPrice: pricingMatch.unitPrice * part.quantity
        };
      }
      return part;
    });
    
    setParts(updatedParts);
    toast.success('Bulk pricing applied successfully');
  };

  // Apply material-wise pricing
  const applyMaterialPricing = () => {
    // Validation: Check if any prices are entered
    const hasAnyPrices = Object.values(materialPricing).some(price => price && price > 0);
    
    if (!hasAnyPrices) {
      toast.error('Please enter at least one material price before applying');
      return;
    }
    
    // Validation: Check if all materials have prices
    const materialsWithoutPrices = [];
    parts.forEach(part => {
      if (!materialPricing[part.material] || materialPricing[part.material] <= 0) {
        if (!materialsWithoutPrices.includes(part.material)) {
          materialsWithoutPrices.push(part.material);
        }
      }
    });
    
    if (materialsWithoutPrices.length > 0) {
      toast.error(`Please enter prices for: ${materialsWithoutPrices.join(', ')}`);
      return;
    }
    
    const updatedParts = parts.map(part => {
      const materialPrice = materialPricing[part.material];
      if (materialPrice && materialPrice > 0) {
        return {
          ...part,
          unitPrice: materialPrice,
          totalPrice: materialPrice * part.quantity
        };
      }
      return part;
    });
    
    setParts(updatedParts);
    setShowBulkPricingModal(false);
    toast.success('Material-wise pricing applied successfully');
  };

  // Get unique materials from parts
  const getUniqueMaterials = () => {
    const materials = [...new Set(parts.map(part => part.material))];
    return materials.filter(material => material && material.trim() !== '');
  };

  // Calculate total price automatically when switching to upload quotation mode
  const calculateUploadQuotationTotal = () => {
    // Simple calculation - just set to 0, user will enter manually
    setTotalAmount(0);
    return 0;
  };

  // Handle upload quotation file
  const handleUploadQuotationFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - only allow PDF files
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF files are allowed. Please upload a PDF file.');
        event.target.value = ''; // Clear the file input
        return;
      }
      
      setUploadedQuotationFile(file);
      setPdfProcessed(false); // Reset processed flag
      
      try {
        // Show loading state
        toast.loading('Processing PDF and extracting pricing information...', { duration: 0 });
        
        // Call the PDF processing API
        const response = await pdfAPI.extractPdfData(file);
        
        if (response.data.success) {
          const { parts: extractedParts, totalAmount: extractedTotal } = response.data;
          
          // Update parts with extracted data
          if (extractedParts && extractedParts.length > 0) {
            const processedParts = extractedParts.map(part => ({
              partRef: part.partRef || `${part.material} ${part.thickness}`,
              material: part.material || 'Zintec',
              thickness: part.thickness || '1.5',
              grade: part.grade || '',
              quantity: part.quantity || 1,
              unitPrice: part.unitPrice || 0,
              totalPrice: part.totalPrice || 0,
              remarks: part.remarks || ''
            }));
            
            setParts(processedParts);
            toast.dismiss(); // Clear loading toast
            toast.success(`PDF processed successfully! Found ${processedParts.length} parts with pricing information.`);
          }
          
          // Don't set total amount automatically - let admin enter manually
          setTotalAmount(0);
          setPdfProcessed(false);
          toast.success(`PDF uploaded: ${file.name}. ${extractedParts.length > 0 ? `Found ${extractedParts.length} parts. ` : ''}Please enter the total amount manually.`);
        } else {
          toast.dismiss(); // Clear loading toast
          toast.error('Failed to process PDF. Please enter the total amount manually.');
        }
      } catch (error) {
        console.error('PDF processing error:', error);
        toast.dismiss(); // Clear loading toast
        toast.error('Failed to process PDF. Please enter the total amount manually.');
      }
    }
  };

  const removePart = (index) => {
    if (parts.length > 1) {
      setParts(parts.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    if (isUploadQuotation) {
      // In upload mode, only return total amount if PDF is processed
      return pdfProcessed ? totalAmount : 0;
    }
    return parts.reduce((total, part) => total + (part.totalPrice || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isUploadQuotation) {
      if (parts.length === 0) {
        toast.error('Please add at least one part');
        return;
      }

      if (parts.some(part => !part.unitPrice || part.unitPrice <= 0)) {
        toast.error('Please enter valid unit prices for all parts');
        return;
      }
    } else {
      if (!uploadedQuotationFile) {
        toast.error('Please upload a quotation PDF');
        return;
      }
      if (totalAmount <= 0) {
        toast.error('Please enter a valid total amount');
        return;
      }
    }

    try {
      setLoading(true);
      
      // If uploading quotation with PDF, use multipart/form-data
      if (isUploadQuotation && uploadedQuotationFile) {
        const uploadFormData = new FormData(); // Renamed to avoid variable clash
        uploadFormData.append('quotationPdf', uploadedQuotationFile);
        uploadFormData.append('inquiryId', inquiry._id);
        uploadFormData.append('totalAmount', totalAmount);
        uploadFormData.append('customerInfo', JSON.stringify({
          name: getCustomerData().firstName + ' ' + getCustomerData().lastName,
          company: getCustomerData().companyName,
          email: getCustomerData().email,
          phone: inquiry.customerData?.phoneNumber || 'N/A'
        }));
        uploadFormData.append('terms', formData.terms); // Use state variable formData
        uploadFormData.append('notes', formData.notes); // Use state variable formData
        uploadFormData.append('validUntil', formData.validUntil); // Use state variable formData

        const response = await quotationAPI.uploadQuotation(uploadFormData);
        
        if (response.data.success) {
          toast.success('Quotation uploaded successfully!');
          onSuccess && onSuccess(response.data.quotation);
          onClose();
        } else {
          toast.error(response.data.message || 'Failed to upload quotation');
        }
      } else {
        // Regular quotation creation
        const quotationData = {
          inquiryId: inquiry._id,
          parts: parts.map(part => ({
            partRef: part.partRef,
            material: part.material,
            thickness: part.thickness,
            grade: part.grade || '',
            quantity: part.quantity,
            unitPrice: part.unitPrice,
            totalPrice: part.totalPrice,
            remarks: part.remarks
          })),
          totalAmount: calculateTotal(),
          terms: formData.terms,
          notes: formData.notes,
          validUntil: formData.validUntil
        };

        const response = await quotationAPI.createQuotation(quotationData);
        
        if (response.data.success) {
          toast.success('Quotation created successfully!');
          onSuccess && onSuccess(response.data.quotation);
          onClose();
        } else {
          toast.error(response.data.message || 'Failed to create quotation');
        }
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message;
        if (errorMessage?.includes('already exists')) {
          toast.error('A quotation already exists for this inquiry. You can view or update it from the quotations list.');
        } else {
          toast.error(errorMessage || 'Failed to create quotation');
        }
      } else {
        toast.error('Failed to create quotation');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentInquiry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isMultipleInquiries 
              ? `Create Quotation for ${inquiries.length} Inquiries` 
              : `Create Quotation for ${currentInquiry.inquiryNumber}`
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          {/* Customer Info */}
          <div className="mb-1 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-1">Customer Informationd</h3>
            {(() => {
              const customer = getCustomerData();
              return (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Company:</strong> {customer.companyName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {customer.email}
                  </p>
                </>
              );
            })()}
          </div>

          {/* Bulk Pricing Section - Only for Multiple Inquiries */}
          {isMultipleInquiries && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Bulk Pricing Options</h3>
              <p className="text-sm text-gray-600 mb-4">
                You have {inquiries.length} inquiries selected. You can either set prices individually or upload a pricing file to apply to all inquiries.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsBulkPricing(!isBulkPricing)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isBulkPricing 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-blue-600 border border-blue-600'
                    }`}
                  >
                    {isBulkPricing ? 'Use Individual Pricing' : 'Upload Bulk Pricing File'}
                  </button>
                </div>

                {isBulkPricing && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Pricing File (CSV/Excel)
                      </label>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleBulkPricingFile}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        File should contain: Part Ref, Material, Unit Price (comma-separated)
                      </p>
                    </div>

                    {bulkPricingData && bulkPricingData.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Loaded Pricing Data:</h4>
                        <div className="max-h-32 overflow-y-auto">
                          {bulkPricingData.slice(0, 5).map((item, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {item.partRef} - {item.material} - ${item.unitPrice}
                            </div>
                          ))}
                          {bulkPricingData.length > 5 && (
                            <div className="text-xs text-gray-500">... and {bulkPricingData.length - 5} more items</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={applyBulkPricing}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Apply Bulk Pricing
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF Upload Section - Show when Upload Quotation is clicked */}
          {isUploadQuotation && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Quotation PDF</h3>
                <button
                  type="button"
                  onClick={() => setIsUploadQuotation(false)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Switch to Manual Entry
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUploadQuotationFile}
                  className="hidden"
                  id="quotation-file-upload"
                />
                <label
                  htmlFor="quotation-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadedQuotationFile ? uploadedQuotationFile.name : 'Click to upload quotation PDF or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">Only PDF files are allowed</p>
                </label>
              </div>
              {uploadedQuotationFile && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ File selected: {uploadedQuotationFile.name}
                  </p>
                </div>
              )}
              
              {/* Extracted Parts Information */}
              {/* {uploadedQuotationFile && parts.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    ✓ Extracted Parts from PDF ({parts.length} parts found)
                  </h4>
                  <div className="text-xs text-green-700 space-y-1">
                    {parts.slice(0, 3).map((part, index) => (
                      <div key={index}>
                        {part.material} {part.thickness} - Qty: {part.quantity} - ${part.unitPrice.toFixed(2)} each
                        {part.unitPrice === 0 && (
                          <span className="text-orange-600 ml-2">(No pricing found)</span>
                        )}
                      </div>
                    ))}
                    {parts.length > 3 && (
                      <div className="text-green-600">... and {parts.length - 3} more parts</div>
                    )}
                  </div>
                </div>
              )} */}

              {/* Manual Total Amount Input - Only show when PDF is uploaded */}
              {uploadedQuotationFile && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setTotalAmount(value);
                      if (value > 0) {
                        setPdfProcessed(true);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter total amount from PDF (e.g., 150.00)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the total amount from your quotation PDF manually
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Parts Section - Only show when NOT in upload quotation mode */}
          {!isUploadQuotation && (
            <div className="mb-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Parts & Pricing</h3>
                <div className="flex items-center space-x-2">
                  {/* <button
                    type="button"
                    onClick={() => {
                      const basePricing = getBasePricing();
                      const updatedParts = parts.map(part => {
                        const materialPrice = basePricing[part.material] || 20.00;
                        return {
                          ...part,
                          unitPrice: materialPrice,
                          totalPrice: materialPrice * part.quantity
                        };
                      });
                      setParts(updatedParts);
                      toast.success('Base pricing applied to all parts');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Price
                  </button> */}
                  <button
                    type="button"
                    onClick={() => setShowBulkPricingModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Bulk Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Switching to upload quotation mode - calculate total automatically
                      calculateUploadQuotationTotal();
                      setIsUploadQuotation(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Quotation
                  </button>
                </div>
              </div>

            {!isUploadQuotation && (
              <div className="space-y-2">
                {parts.map((part, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">Part {index + 1}</h4>
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part Ref
                      </label>
                      <input
                        type="text"
                        value={part.partRef}
                        onChange={(e) => handlePartChange(index, 'partRef', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <select
                        value={part.material}
                        onChange={(e) => handlePartChange(index, 'material', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="Zintec">Zintec</option>
                        <option value="Mild Steel">Mild Steel</option>
                        <option value="Stainless Steel">Stainless Steel</option>
                        <option value="Aluminium">Aluminium</option>
                        <option value="Copper">Copper</option>
                        <option value="Brass">Brass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thickness
                      </label>
                      <select
                        value={part.thickness}
                        onChange={(e) => handlePartChange(index, 'thickness', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="0.5">0.5mm</option>
                        <option value="1.0">1.0mm</option>
                        <option value="1.5">1.5mm</option>
                        <option value="2.0">2.0mm</option>
                        <option value="2.5">2.5mm</option>
                        <option value="3.0">3.0mm</option>
                        <option value="4.0">4.0mm</option>
                        <option value="5.0">5.0mm</option>
                        <option value="6.0">6.0mm</option>
                        <option value="8.0">8.0mm</option>
                        <option value="10.0">10.0mm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <input
                        type="text"
                        value={part.grade}
                        onChange={(e) => handlePartChange(index, 'grade', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="e.g., A36, 304, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) => handlePartChange(index, 'unitPrice', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Price ($)
                      </label>
                      <input
                        type="number"
                        value={part.totalPrice}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      value={part.remarks}
                      onChange={(e) => handlePartChange(index, 'remarks', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Additional notes for this part"
                    />
                  </div>
                </div>
                ))}
              </div>
            )}


            {/* Total Amount - Show only when PDF is processed or manual pricing is done */}
            {(isUploadQuotation && uploadedQuotationFile && pdfProcessed) || (!isUploadQuotation && parts.some(part => part.unitPrice > 0)) ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${isUploadQuotation ? totalAmount.toFixed(2) : calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
            ) : null}
          </div>
          )}

          {/* Terms and Valid Until Section */}
          {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Validity</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quotation will be valid until this date
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({...formData, terms: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter terms and conditions"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Any additional notes or special instructions"
              />
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Submit Quotation'}
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Pricing Modal */}
      {showBulkPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Material-wise Bulk Pricing</h3>
              <button
                onClick={() => setShowBulkPricingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {/* <p className="text-sm text-gray-600 mb-4">
                Set prices for each material type. All parts with the same material will get the same unit price.
              </p> */}

              {/* <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"> */}
                {/* <div className="flex items-center justify-between">
                  {/* <div>
                    <h4 className="text-sm font-medium text-green-800">Quick Base Pricing</h4>
                    <p className="text-xs text-green-600">Apply standard base prices for all materials with one click</p>
                  </div> */}
                  {/* <button
                    type="button"
                    onClick={applyBasePricing}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    Apply Base Prices
                  </button> */}
                {/* </div> */} 
              {/* </div> */}

              <div className="space-y-4">
                {getUniqueMaterials().map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {material}
                      </label>
                      <p className="text-xs text-gray-500">
                        {parts.filter(part => part.material === material).length} part(s) with this material
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={materialPricing[material] || ''}
                          onChange={(e) => setMaterialPricing({
                            ...materialPricing,
                            [material]: parseFloat(e.target.value) || 0
                          })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getUniqueMaterials().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No materials found in parts list.</p>
                  <p className="text-sm">Add some parts first to set material-wise pricing.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBulkPricingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyMaterialPricing}
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                >
                  Apply Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
