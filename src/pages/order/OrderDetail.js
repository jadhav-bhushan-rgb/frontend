import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, adminAPI, quotationAPI, inquiryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [dispatchData, setDispatchData] = useState({
    courier: '',
    trackingNumber: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    if (user?._id) {
      fetchOrder();
    }
  }, [id, user?._id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      console.log('=== FRONTEND: Fetching order with ID:', id);
      
      // Use the proper order API endpoint
      const response = await orderAPI.getOrder(id);
      console.log('=== FRONTEND: Order API response:', response);
      console.log('=== FRONTEND: Response data:', response.data);
      
      if (response.data.success) {
        console.log('=== FRONTEND: Found order:', response.data.order);
        console.log('=== FRONTEND: Order parts:', response.data.order.parts);
        console.log('=== FRONTEND: Order parts length:', response.data.order.parts?.length || 0);
        let orderData = response.data.order;
        
        // If order has no parts, try to fetch from quotation/inquiry
        if (!orderData.parts || orderData.parts.length === 0) {
          console.log('⚠️ FRONTEND: Order has no parts, fetching from quotation/inquiry...');
          
          try {
            // First try to get parts from quotation
            if (orderData.quotation) {
              const quotationId = typeof orderData.quotation === 'object' ? orderData.quotation._id : orderData.quotation;
              console.log('Fetching quotation:', quotationId);
              
              const quotationResponse = await quotationAPI.getQuotation(quotationId);
              if (quotationResponse.data.success && quotationResponse.data.quotation?.items?.length > 0) {
                console.log('Found parts in quotation items:', quotationResponse.data.quotation.items);
                orderData.parts = quotationResponse.data.quotation.items;
              } else if (quotationResponse.data.success && quotationResponse.data.quotation?.inquiryId) {
                // If quotation has no items, try to fetch from inquiry
                console.log('Quotation has no items, trying inquiry...');
                const inquiryId = quotationResponse.data.quotation.inquiryId;
                
                try {
                  // Try customer endpoint first, fallback to admin endpoint
                  let inquiryResponse;
                  try {
                    inquiryResponse = await inquiryAPI.getInquiry(inquiryId);
                  } catch (err) {
                    console.log('Customer inquiry endpoint failed, trying admin endpoint...');
                    inquiryResponse = await inquiryAPI.getInquiryAdmin(inquiryId);
                  }
                  
                  if (inquiryResponse.data.success && inquiryResponse.data.inquiry?.parts?.length > 0) {
                    console.log('Found parts in inquiry:', inquiryResponse.data.inquiry.parts);
                    const inquiry = inquiryResponse.data.inquiry;
                    const parts = inquiry.parts;
                    const totalAmount = orderData.totalAmount || 0;
                    const totalQuantity = parts.reduce((sum, part) => sum + (part.quantity || 0), 0);
                    
                    // Calculate prices proportionally
                    orderData.parts = parts.map(part => {
                      const quantity = part.quantity || 0;
                      const itemTotalPrice = totalQuantity > 0 ? (totalAmount * quantity) / totalQuantity : totalAmount / parts.length;
                      const unitPrice = quantity > 0 ? itemTotalPrice / quantity : itemTotalPrice;
                      
                      return {
                        partName: part.partName || part.partRef || 'N/A',
                        partRef: part.partRef || part.partName || 'N/A',
                        material: part.material || 'N/A',
                        thickness: part.thickness || 'N/A',
                        quantity: quantity,
                        unitPrice: unitPrice,
                        totalPrice: itemTotalPrice,
                        remarks: part.remarks || ''
                      };
                    });
                    console.log('Calculated parts from inquiry:', orderData.parts);
                  }
                } catch (inquiryError) {
                  console.error('Failed to fetch inquiry:', inquiryError);
                }
              }
            } else if (orderData.inquiry) {
              // If no quotation, try inquiry directly
              const inquiryId = typeof orderData.inquiry === 'object' ? orderData.inquiry._id : orderData.inquiry;
              console.log('Fetching inquiry directly:', inquiryId);
              
              // Try customer endpoint first, fallback to admin endpoint
              let inquiryResponse;
              try {
                inquiryResponse = await inquiryAPI.getInquiry(inquiryId);
              } catch (err) {
                console.log('Customer inquiry endpoint failed, trying admin endpoint...');
                inquiryResponse = await inquiryAPI.getInquiryAdmin(inquiryId);
              }
              
              if (inquiryResponse.data.success && inquiryResponse.data.inquiry?.parts?.length > 0) {
                const inquiry = inquiryResponse.data.inquiry;
                const parts = inquiry.parts;
                const totalAmount = orderData.totalAmount || 0;
                const totalQuantity = parts.reduce((sum, part) => sum + (part.quantity || 0), 0);
                
                orderData.parts = parts.map(part => {
                  const quantity = part.quantity || 0;
                  const itemTotalPrice = totalQuantity > 0 ? (totalAmount * quantity) / totalQuantity : totalAmount / parts.length;
                  const unitPrice = quantity > 0 ? itemTotalPrice / quantity : itemTotalPrice;
                  
                  return {
                    partName: part.partName || part.partRef || 'N/A',
                    partRef: part.partRef || part.partName || 'N/A',
                    material: part.material || 'N/A',
                    thickness: part.thickness || 'N/A',
                    quantity: quantity,
                    unitPrice: unitPrice,
                    totalPrice: itemTotalPrice,
                    remarks: part.remarks || ''
                  };
                });
                console.log('Calculated parts from inquiry:', orderData.parts);
              }
            }
          } catch (fallbackError) {
            console.error('Failed to fetch parts from quotation/inquiry:', fallbackError);
          }
        }
        
        console.log('=== FRONTEND: Final order data to display:', orderData);
        console.log('=== FRONTEND: Final parts:', orderData.parts);
        console.log('=== FRONTEND: Final parts length:', orderData.parts?.length || 0);
        setOrder(orderData);
      } else {
        console.log('❌ FRONTEND: Order not found:', response.data.message);
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('❌ FRONTEND: Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Handler for setting delivery time (Point 5)
  const handleSetDeliveryTime = () => {
    setDeliveryTime('');
    setShowDeliveryModal(true);
  };

  const handleSubmitDeliveryTime = async () => {
    if (!deliveryTime) {
      toast.error('Please select delivery time');
      return;
    }

    try {
      const response = await adminAPI.updateDeliveryDetails(order._id, {
        estimatedDelivery: deliveryTime,
        notes: 'Production started with estimated delivery time'
      });

      if (response.data.success) {
        toast.success('Delivery time set and customer notified');
        setShowDeliveryModal(false);
        fetchOrder(); // Refresh order
      } else {
        toast.error(response.data.message || 'Failed to set delivery time');
      }
    } catch (error) {
      console.error('Error setting delivery time:', error);
      toast.error('Failed to set delivery time');
    }
  };

  // Handler for marking order ready for dispatch
  const handleMarkReadyForDispatch = async () => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'ready_for_dispatch', {
        notes: 'Order completed and ready for dispatch'
      });

      if (response.data.success) {
        toast.success('Order marked as ready for dispatch');
        fetchOrder(); // Refresh order
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Handler for dispatching order (Point 6)
  const handleDispatchOrder = () => {
    setDispatchData({
      courier: '',
      trackingNumber: '',
      estimatedDelivery: ''
    });
    setShowDispatchModal(true);
  };

  const handleSubmitDispatch = async () => {
    if (!dispatchData.courier || !dispatchData.trackingNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await adminAPI.updateDispatchDetails(order._id, dispatchData);

      if (response.data.success) {
        toast.success('Order dispatched and customer notified');
        setShowDispatchModal(false);
        fetchOrder(); // Refresh order
      } else {
        toast.error(response.data.message || 'Failed to dispatch order');
      }
    } catch (error) {
      console.error('Error dispatching order:', error);
      toast.error('Failed to dispatch order');
    }
  };

  // Handler for marking order as delivered
  const handleMarkDelivered = async () => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'delivered', {
        notes: 'Order delivered successfully'
      });

      if (response.data.success) {
        toast.success('Order marked as delivered');
        fetchOrder(); // Refresh order
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Handler for downloading invoice
  const handleDownloadInvoice = async () => {
    try {
      toast.loading('Generating invoice...', { id: 'invoice' });
      
      // Create invoice data
      const invoiceData = {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A',
        customerEmail: order.customer?.email || 'N/A',
        totalAmount: order.totalAmount || 0,
        parts: order.parts || [],
        status: order.status,
        deliveryAddress: order.deliveryAddress || null
      };

      // Generate HTML content for PDF
      const htmlContent = generateInvoiceHTML(invoiceData);
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      toast.success('Invoice opened for printing!', { id: 'invoice' });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice', { id: 'invoice' });
    }
  };

  // Generate HTML content for invoice
  const generateInvoiceHTML = (data) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${data.orderNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: black;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 5px;
          }
          .invoice-title { 
            font-size: 20px; 
            color: #6b7280; 
            margin-top: 10px; 
          }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            margin-top: 20px;
          }
          .invoice-info, .customer-info { 
            width: 45%; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #374151; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .info-item { 
            margin-bottom: 8px; 
            color: #4b5563; 
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            border: 1px solid #d1d5db;
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            border: 1px solid #d1d5db; 
          }
          th { 
            background-color: #f9fafb; 
            font-weight: bold; 
            color: #374151; 
          }
          .total-row { 
            font-weight: bold; 
            background-color: #f3f4f6; 
            font-size: 16px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
        
        <div class="header">
          <div class="company-name">247 CUTBEND</div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-details">
          <div class="invoice-info">
            <div class="section-title">Invoice Details</div>
            <div class="info-item">Invoice #: ${data.orderNumber}</div>
            <div class="info-item">Date: ${data.orderDate}</div>
            <div class="info-item">Status: ${data.status.toUpperCase()}</div>
          </div>
          <div class="customer-info">
            <div class="section-title">Bill To</div>
            <div class="info-item">${data.customerName}</div>
            <div class="info-item">${data.customerEmail}</div>
            ${data.deliveryAddress ? `
              <div class="info-item">${data.deliveryAddress.street || ''}</div>
              <div class="info-item">${data.deliveryAddress.city || ''}, ${data.deliveryAddress.state || ''} ${data.deliveryAddress.zipCode || ''}</div>
              <div class="info-item">${data.deliveryAddress.country || ''}</div>
            ` : ''}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Part Name</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.parts.map(part => `
              <tr>
                <td>${part.partName || part.partRef || 'N/A'}</td>
                <td>${part.material || 'N/A'}</td>
                <td>${part.quantity || 0}</td>
                <td>$${(part.unitPrice || 0).toFixed(2)}</td>
                <td>$${(part.totalPrice || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4">Total Amount</td>
              <td>$${data.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact us at support@247cutbend.com</p>
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_production':
        return 'bg-purple-100 text-purple-800';
      case 'ready_for_dispatch':
        return 'bg-orange-100 text-orange-800';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">OrderDetail Component Loaded!</h3>
            <p className="text-sm text-blue-700">Order ID: {id}</p>
            <p className="text-sm text-blue-700">Loading order data...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
            <p className="text-gray-600 mt-2">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link 
              to='/dashboard'
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">OrderDetail Component Successfully Loaded!</h3>
          <p className="text-sm text-green-700">Order ID: {id}</p>
          <p className="text-sm text-green-700">Order found and loaded successfully!</p>
        </div> */}
        <div className="mb-6">
          <Link
            to='/dashboard'
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">
                  Customer: {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Total Amount: ${order.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Status: {order.status}</p>
                </div>
              </div>
            </div>

          

            {/* Admin Action Buttons */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Admin Actions</h3>
              <div className="flex flex-wrap gap-3">
                {order.status === 'confirmed' && (
                  <button
                    onClick={handleSetDeliveryTime}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Set Delivery Time
                  </button>
                )}
                {order.status === 'in_production' && (
                  <button
                    onClick={handleMarkReadyForDispatch}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Mark Ready for Dispatch
                  </button>
                )}
                {order.status === 'ready_for_dispatch' && (
                  <button
                    onClick={handleDispatchOrder}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Dispatch Order
                  </button>
                )}
                {order.status === 'dispatched' && (
                  <button
                    onClick={handleMarkDelivered}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status === 'delivered' && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
                    Order Completed
                  </span>
                )}
              </div>
            </div>

           

            <div className="grid ">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <div className="max-h-64 overflow-y-auto overflow-x-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Part Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                      {order.parts && order.parts.length > 0 ? (
                        order.parts.map((part, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {part.partName || part.partRef}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {part.material}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {part.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${part.unitPrice?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${part.totalPrice?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p>Loading parts information...</p>
                              <p className="text-xs text-gray-400 mt-1">If parts don't load, please refresh the page.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    console.log('=== SHIPPING ADDRESS DEBUG ===');
                    console.log('order.deliveryAddress:', order.deliveryAddress);
                    console.log('order.customer?.address:', order.customer?.address);
                    console.log('order.inquiry?.deliveryAddress:', order.inquiry?.deliveryAddress);
                    
                    // Check if deliveryAddress has default values or is empty
                    const hasDefaultOrEmptyValues = 
                      order.deliveryAddress?.street?.includes('Default') || 
                      order.deliveryAddress?.city?.includes('Default') ||
                      !order.deliveryAddress?.street ||
                      order.deliveryAddress?.street === 'N/A';
                    
                    // Priority: Order deliveryAddress > Inquiry deliveryAddress > Customer address
                    let address;
                    if (!hasDefaultOrEmptyValues && order.deliveryAddress) {
                      address = order.deliveryAddress;
                      console.log('Using order.deliveryAddress');
                    } else if (order.inquiry?.deliveryAddress && order.inquiry.deliveryAddress.street) {
                      address = order.inquiry.deliveryAddress;
                      console.log('Using inquiry.deliveryAddress');
                    } else if (order.customer?.address) {
                      address = order.customer.address;
                      console.log('Using customer.address');
                    }
                    
                    console.log('Final address to display:', address);
                    
                    return address && (address.street || address.city) ? (
                      <>
                        <p className="text-sm text-gray-900 font-medium">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        {address.street && address.street !== 'N/A' && (
                          <p className="text-sm text-gray-700">{address.street}</p>
                        )}
                        {(address.city || address.state || address.zipCode) && (
                          <p className="text-sm text-gray-700">
                            {address.city && address.city !== 'N/A' ? address.city : ''}{address.city && address.state ? ', ' : ''}{address.state && address.state !== 'N/A' ? address.state : ''} {address.zipCode && address.zipCode !== 'N/A' ? address.zipCode : ''}
                          </p>
                        )}
                        {address.country && address.country !== 'N/A' && (
                          <p className="text-sm text-gray-700">{address.country}</p>
                        )}
                        <p className="text-sm text-gray-700">Phone: {order.customer?.phoneNumber || order.customer?.phone || 'N/A'}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No shipping address available</p>
                    );
                  })()}
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Order Timeline</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto">
                  {order.timeline && order.timeline.length > 0 ? (
                    order.timeline.map((update, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{update.status}</p>
                          <p className="text-sm text-gray-600">{update.description}</p>
                          <p className="text-xs text-gray-500">
                            {update.timestamp ? new Date(update.timestamp).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No timeline events available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>Order Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p>Expected Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={`/order/${order._id || order.id}/tracking`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Track Order
                </Link>
                <button 
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Time Modal */}
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Set Delivery Time - {order?.orderNumber}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDeliveryTime}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Set Delivery Time
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Dispatch Order - {order?.orderNumber}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Courier Name *
                    </label>
                    <input
                      type="text"
                      value={dispatchData.courier}
                      onChange={(e) => setDispatchData({...dispatchData, courier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., FedEx, UPS, DHL"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number *
                    </label>
                    <input
                      type="text"
                      value={dispatchData.trackingNumber}
                      onChange={(e) => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1Z999AA1234567890"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dispatchData.estimatedDelivery}
                      onChange={(e) => setDispatchData({...dispatchData, estimatedDelivery: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDispatchModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDispatch}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Dispatch Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
