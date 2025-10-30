import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useOrderUpdates } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { orderData: realTimeOrderData, lastUpdate } = useOrderUpdates(id);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchOrder();
    }
  }, [id, user?._id]);

  // Update order with real-time data
  useEffect(() => {
    if (realTimeOrderData && order) {
      setOrder(prevOrder => ({
        ...prevOrder,
        ...realTimeOrderData,
        tracking: generateTimeline({ ...prevOrder, ...realTimeOrderData })
      }));
    }
  }, [realTimeOrderData, order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      console.log('Fetching order tracking for ID:', id);
      
      // Use the proper order API endpoint
      const response = await orderAPI.getOrder(id);
      console.log('Order API response:', response);
      
      if (response.data.success) {
        console.log('Found order:', response.data.order);
        
        // Generate timeline based on actual order status
        const timeline = generateTimeline(response.data.order);
        
        const orderWithTracking = {
          ...response.data.order,
          tracking: timeline
        };
        console.log('Setting order with tracking:', orderWithTracking);
        setOrder(orderWithTracking);
      } else {
        console.log('Order not found:', response.data.message);
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Generate timeline based on actual order status - Fixed 6 steps
  const generateTimeline = (orderData) => {
    const status = orderData.status || 'pending';
    const createdAt = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
    
    // Helper function to get real timestamp or fallback
    const getRealTimestamp = (timestamp, fallbackDate) => {
      if (timestamp) {
        const date = new Date(timestamp);
        return {
          date: date.toISOString().split('T')[0],
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return {
        date: fallbackDate.toISOString().split('T')[0],
        time: fallbackDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    };

    // Define all 6 steps with their completion status based on order status
    const steps = [
      {
        ...getRealTimestamp(orderData.createdAt, createdAt),
        status: 'Inquiry Generation', 
        description: 'Customer submitted inquiry with technical specifications and requirements.',
        location: 'Customer Portal',
        step: 1,
        icon: 'inquiry',
        completed: true, // Always completed
        isCurrent: false
      },
      { 
        ...getRealTimestamp(orderData.quotation?.createdAt, new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)),
        status: 'Quotation Preparation', 
        description: 'Back Office reviewed inquiry and prepared detailed quotation with pricing.',
        location: 'Back Office',
        step: 2,
        icon: 'quotation',
        completed: true, // Always completed
        isCurrent: false
      },
      {
        ...getRealTimestamp(orderData.confirmedAt, new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)),
        status: 'Customer Response', 
        description: 'Customer accepted the quotation and proceeded to place the order.',
        location: 'Customer Portal',
        step: 3,
        icon: 'response',
        completed: ['confirmed', 'in_production', 'ready_for_dispatch', 'dispatched', 'delivered'].includes(status),
        isCurrent: status === 'confirmed'
      },
      {
        ...getRealTimestamp(orderData.payment?.paidAt, new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)),
        status: 'Payment Process', 
        description: 'Customer completed payment. Order confirmed and payment verified.',
        location: 'Payment Gateway',
        step: 4,
        icon: 'payment',
        completed: ['in_production', 'ready_for_dispatch', 'dispatched', 'delivered'].includes(status),
        isCurrent: status === 'in_production'
      },
      {
        ...getRealTimestamp(orderData.dispatch?.dispatchedAt, new Date(createdAt.getTime() + 4 * 24 * 60 * 60 * 1000)),
        status: 'Order Dispatch', 
        description: 'Order completed and ready for dispatch. Tracking details updated.',
        location: 'Logistics Center',
        step: 5,
        icon: 'dispatch',
        completed: ['dispatched', 'delivered'].includes(status),
        isCurrent: status === 'dispatched'
      },
      {
        ...getRealTimestamp(orderData.dispatch?.actualDelivery, new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000)),
        status: 'Order Delivered',
        description: 'Order successfully delivered to customer. Delivery confirmed.',
        location: 'Customer Location',
        step: 6,
        icon: 'delivery',
        completed: status === 'delivered',
        isCurrent: status === 'delivered'
      }
    ];

    return steps;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Inquiry Generation':
        return 'bg-blue-100 text-blue-800';
      case 'Quotation Preparation':
        return 'bg-purple-100 text-purple-800';
      case 'Customer Response':
        return 'bg-indigo-100 text-indigo-800';
      case 'Payment Process':
        return 'bg-yellow-100 text-yellow-800';
      case 'Order Confirmation':
        return 'bg-green-100 text-green-800';
      case 'Order Dispatch':
        return 'bg-orange-100 text-orange-800';
      case 'Order Delivered':
        return 'bg-green-100 text-green-800';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepColor = (iconType) => {
    switch (iconType) {
      case 'inquiry':
        return 'bg-blue-500';
      case 'quotation':
        return 'bg-purple-500';
      case 'response':
        return 'bg-indigo-500';
      case 'payment':
        return 'bg-yellow-500';
      case 'confirmation':
        return 'bg-green-500';
      case 'dispatch':
        return 'bg-orange-500';
      case 'delivery':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStepIcon = (iconType, isCompleted = false, isVertical = false, isCurrent = false) => {
    let iconClass;
    if (isCompleted) {
      iconClass = isVertical ? getStepColor(iconType).replace('500', '600') : 'text-white';
    } else if (isCurrent) {
      iconClass = isVertical ? getStepColor(iconType).replace('500', '600') : 'text-white';
    } else {
      iconClass = 'text-gray-400';
    }
    
    switch (iconType) {
      case 'inquiry':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'quotation':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'response':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'payment':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'confirmation':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'dispatch':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'delivery':
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-6 h-6 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800">
              Back to Orders
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
          <div className="mb-8">
            <Link
              to={`/order/${order._id || order.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
            >
              ← Back to Order Details
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
                <p className="text-lg text-gray-600">Track your order #{order.orderNumber}</p>
              </div>
              {lastUpdate && (
                <div className="text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Timeline Section */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Order Progress</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-10 left-0 right-0 h-1 bg-gray-200 rounded-full">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-indigo-500 via-yellow-500 via-green-500 via-orange-500 to-emerald-500 rounded-full" 
                       style={{ width: `${(order.tracking.filter(step => step.completed || step.isCurrent).length / order.tracking.length) * 100}%` }}>
                  </div>
                </div>
                
                {/* Timeline Steps */}
                <div className="relative flex justify-between items-start">
                  {order.tracking.map((update, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      {/* Icon */}
                      <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl ${
                        update.completed ? getStepColor(update.icon) : 
                        update.isCurrent ? getStepColor(update.icon) + ' ring-4 ring-opacity-50 ring-blue-300' : 
                        'bg-gray-300'
                      }`}>
                        {getStepIcon(update.icon, update.completed, false, update.isCurrent)}
                      </div>
                      
                      {/* Status Text */}
                      <div className="mt-4 text-center max-w-36">
                        <p className={`text-sm font-semibold leading-tight ${
                          update.completed ? 'text-gray-900' : 
                          update.isCurrent ? 'text-blue-600' : 
                          'text-gray-500'
                        }`}>{update.status}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(update.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-6">
              {/* Order Details Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                      <dd className="text-sm text-gray-900">{order.orderNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                      <dd className="text-sm text-gray-900 font-mono">
                        {order.dispatch?.trackingNumber || 'Not available yet'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                      <dd className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expected Delivery</dt>
                      <dd className="text-sm text-gray-900">
                        {order.dispatch?.estimatedDelivery 
                          ? new Date(order.dispatch.estimatedDelivery).toLocaleDateString()
                          : order.production?.estimatedCompletion 
                          ? new Date(order.production.estimatedCompletion).toLocaleDateString()
                          : 'TBD'
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                        </span>
                      </dd>
                    </div>
                    {order.dispatch?.courier && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Courier</dt>
                        <dd className="text-sm text-gray-900">{order.dispatch.courier}</dd>
                      </div>
                    )}
                    {order.dispatch?.dispatchedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Dispatched On</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(order.dispatch.dispatchedAt).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                    {order.dispatch?.actualDelivery && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Delivered On</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(order.dispatch.actualDelivery).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline Details</h3>
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    {order.tracking.map((update, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            update.completed ? getStepColor(update.icon).replace('500', '100') : 
                            update.isCurrent ? getStepColor(update.icon).replace('500', '100') + ' ring-2 ring-opacity-50 ring-blue-300' :
                            'bg-gray-100'
                          }`}>
                            {getStepIcon(update.icon, update.completed, true, update.isCurrent)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{update.status}</p>
                            <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{update.location}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(update.date).toLocaleDateString()} at {update.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      Contact Support
                    </button>
                    <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
