import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [dispatchData, setDispatchData] = useState({
    courier: '',
    trackingNumber: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders from API...'); // Debug log
      const response = await adminAPI.getAllOrders();
      console.log('API Response:', response); // Debug log
      
      if (response.data.success) {
        console.log('Fetched orders:', response.data.orders);
        const transformedOrders = response.data.orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A',
          title: `Order for ${order.parts?.length || 0} parts`,
          status: order.status,
          amount: order.totalAmount,
          createdAt: new Date(order.createdAt).toISOString().split('T')[0],
          expectedDelivery: order.production?.estimatedCompletion ? 
            new Date(order.production.estimatedCompletion).toISOString().split('T')[0] : 'TBD',
          // Keep full order data for actions
          _id: order._id,
          customer: order.customer,
          parts: order.parts,
          payment: order.payment,
          dispatch: order.dispatch
        }));
        console.log('Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Handler for setting delivery time (Point 5)
  const handleSetDeliveryTime = (order) => {
    setSelectedOrder(order);
    setDeliveryTime('');
    setShowDeliveryModal(true);
  };

  const handleSubmitDeliveryTime = async () => {
    if (!deliveryTime) {
      toast.error('Please select delivery time');
      return;
    }

    try {
      console.log('Setting delivery time with data:', {
        orderId: selectedOrder._id,
        deliveryTime: deliveryTime
      });
      
      const response = await adminAPI.updateDeliveryDetails(selectedOrder._id, {
        estimatedDelivery: deliveryTime,
        notes: 'Production started with estimated delivery time'
      });
      console.log('Delivery time response:', response);

      if (response.data.success) {
        toast.success('Delivery time set and customer notified');
        setShowDeliveryModal(false);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to set delivery time');
      }
    } catch (error) {
      console.error('Error setting delivery time:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to set delivery time');
    }
  };

  // Handler for confirming order
  const handleConfirmOrder = async (order) => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'confirmed', {
        notes: 'Order confirmed and ready for production'
      });

      if (response.data.success) {
        toast.success('Order confirmed successfully');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to confirm order');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    }
  };

  // Handler for starting production
  const handleStartProduction = async (order) => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'in_production', {
        notes: 'Production started for this order'
      });

      if (response.data.success) {
        toast.success('Production started for order');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to start production');
      }
    } catch (error) {
      console.error('Error starting production:', error);
      toast.error('Failed to start production');
    }
  };

  // Handler for marking order ready for dispatch
  const handleMarkReadyForDispatch = async (order) => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'ready_for_dispatch', {
        notes: 'Order completed and ready for dispatch'
      });

      if (response.data.success) {
        toast.success('Order marked as ready for dispatch');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Handler for dispatching order (Point 6)
  const handleDispatchOrder = (order) => {
    setSelectedOrder(order);
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
      console.log('Dispatching order with data:', {
        orderId: selectedOrder._id,
        dispatchData: dispatchData
      });
      
      const response = await adminAPI.updateDispatchDetails(selectedOrder._id, dispatchData);
      console.log('Dispatch response:', response);

      if (response.data.success) {
        toast.success('Order dispatched and customer notified');
        setShowDispatchModal(false);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to dispatch order');
      }
    } catch (error) {
      console.error('Error dispatching order:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to dispatch order');
    }
  };

  // Handler for marking order as delivered
  const handleMarkDelivered = async (order) => {
    try {
      const response = await adminAPI.updateOrderStatus(order._id, 'delivered', {
        notes: 'Order delivered successfully'
      });

      if (response.data.success) {
        toast.success('Order marked as delivered');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in_production':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ready_for_dispatch':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getFilterButtonColor = (status) => {
    switch (status) {
      case 'all':
        return {
          active: 'bg-gray-800 text-white',
          inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        };
      case 'pending':
        return {
          active: 'bg-yellow-500 text-white',
          inactive: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        };
      case 'confirmed':
        return {
          active: 'bg-blue-500 text-white',
          inactive: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        };
      case 'in_production':
        return {
          active: 'bg-purple-500 text-white',
          inactive: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        };
      case 'ready_for_dispatch':
        return {
          active: 'bg-orange-500 text-white',
          inactive: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        };
      case 'dispatched':
        return {
          active: 'bg-indigo-500 text-white',
          inactive: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        };
      case 'delivered':
        return {
          active: 'bg-green-500 text-white',
          inactive: 'bg-green-100 text-green-700 hover:bg-green-200'
        };
      case 'cancelled':
        return {
          active: 'bg-red-500 text-white',
          inactive: 'bg-red-100 text-red-700 hover:bg-red-200'
        };
      default:
        return {
          active: 'bg-gray-500 text-white',
          inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        };
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Get status counts for indicators
  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage and track all customer orders.
            </p>
          </div>
        </div>

        {/* Order Workflow Guide */}
        {/* <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Order Workflow Guide</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending</span>
              <span className="text-blue-600">→</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Confirmed</span>
              <span className="text-blue-600">→</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">In Production</span>
              <span className="text-blue-600">→</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Ready for Dispatch</span>
              <span className="text-blue-600">→</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">Dispatched</span>
              <span className="text-blue-600">→</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Delivered</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Use the action buttons in each row to move orders through the workflow stages.
          </p>
        </div> */}

        {/* Order Status Summary */}
        {/* <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{orders.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{orders.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('pending')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('pending')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('confirmed')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('confirmed')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('in_production')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Production</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('in_production')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('ready_for_dispatch')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ready</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('ready_for_dispatch')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('dispatched')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Dispatched</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('dispatched')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getStatusCount('delivered')}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('delivered')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mt-6">
          <div className="flex flex-wrap gap-7">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'all'
                  ? getFilterButtonColor('all').active
                  : getFilterButtonColor('all').inactive
              }`}
            >
              <span>All Orders</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'all' ? 'bg-white bg-opacity-20' : 'bg-gray-200'
              }`}>
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'pending'
                  ? getFilterButtonColor('pending').active
                  : getFilterButtonColor('pending').inactive
              }`}
            >
              <span>Pending</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'pending' ? 'bg-white bg-opacity-20' : 'bg-yellow-200'
              }`}>
                {getStatusCount('pending')}
              </span>
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'confirmed'
                  ? getFilterButtonColor('confirmed').active
                  : getFilterButtonColor('confirmed').inactive
              }`}
            >
              <span>Confirmed</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'confirmed' ? 'bg-white bg-opacity-20' : 'bg-blue-200'
              }`}>
                {getStatusCount('confirmed')}
              </span>
            </button>
            <button
              onClick={() => setFilter('in_production')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'in_production'
                  ? getFilterButtonColor('in_production').active
                  : getFilterButtonColor('in_production').inactive
              }`}
            >
              <span>In Production</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'in_production' ? 'bg-white bg-opacity-20' : 'bg-purple-200'
              }`}>
                {getStatusCount('in_production')}
              </span>
            </button>
            <button
              onClick={() => setFilter('ready_for_dispatch')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'ready_for_dispatch'
                  ? getFilterButtonColor('ready_for_dispatch').active
                  : getFilterButtonColor('ready_for_dispatch').inactive
              }`}
            >
              <span>Ready for Dispatch</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'ready_for_dispatch' ? 'bg-white bg-opacity-20' : 'bg-orange-200'
              }`}>
                {getStatusCount('ready_for_dispatch')}
              </span>
            </button>
            <button
              onClick={() => setFilter('dispatched')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'dispatched'
                  ? getFilterButtonColor('dispatched').active
                  : getFilterButtonColor('dispatched').inactive
              }`}
            >
              <span>Dispatched</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'dispatched' ? 'bg-white bg-opacity-20' : 'bg-indigo-200'
              }`}>
                {getStatusCount('dispatched')}
              </span>
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                filter === 'delivered'
                  ? getFilterButtonColor('delivered').active
                  : getFilterButtonColor('delivered').inactive
              }`}
            >
              <span>Delivered</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === 'delivered' ? 'bg-white bg-opacity-20' : 'bg-green-200'
              }`}>
                {getStatusCount('delivered')}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expected Delivery
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.orderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status === 'pending' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'confirmed' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'in_production' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'ready_for_dispatch' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'dispatched' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'delivered' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status === 'cancelled' && (
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.expectedDelivery === 'TBD' ? 'TBD' : new Date(order.expectedDelivery).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            to={`/order/${order.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => console.log('View button clicked for order:', order.id, 'Full order:', order)}
                          >
                            View
                          </Link>
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmOrder(order)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleSetDeliveryTime(order)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Set Delivery
                              </button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStartProduction(order)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Start Production
                              </button>
                              <button
                                onClick={() => handleSetDeliveryTime(order)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Set Delivery
                              </button>
                            </>
                          )}
                          {order.status === 'in_production' && (
                            <>
                              <button
                                onClick={() => handleMarkReadyForDispatch(order)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Ready for Dispatch
                              </button>
                              <button
                                onClick={() => handleSetDeliveryTime(order)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Update Delivery
                              </button>
                            </>
                          )}
                          {order.status === 'ready_for_dispatch' && (
                            <button
                              onClick={() => handleDispatchOrder(order)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Dispatch
                            </button>
                          )}
                          {order.status === 'dispatched' && (
                            <button
                              onClick={() => handleMarkDelivered(order)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No orders found</div>
          </div>
        )}

        {/* Delivery Time Modal */}
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Set Delivery Time - {selectedOrder?.orderNumber}
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
                  Dispatch Order - {selectedOrder?.orderNumber}
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

export default OrderManagement;

