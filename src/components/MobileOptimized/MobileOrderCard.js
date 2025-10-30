import React from 'react';
import { Link } from 'react-router-dom';

const MobileOrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_production':
        return 'bg-purple-100 text-purple-800';
      case 'ready_for_dispatch':
        return 'bg-indigo-100 text-indigo-800';
      case 'dispatched':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_production':
        return 'In Production';
      case 'ready_for_dispatch':
        return 'Ready for Dispatch';
      case 'dispatched':
        return 'Dispatched';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            Created {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Order Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-sm font-medium text-gray-900">
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
        
        {order.parts && order.parts.length > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Parts:</span>
            <span className="text-sm font-medium text-gray-900">
              {order.parts.length} item{order.parts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {order.payment && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Payment:</span>
            <span className={`text-sm font-medium ${
              order.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {order.payment.status === 'completed' ? 'Paid' : 'Pending'}
            </span>
          </div>
        )}
      </div>

      {/* Tracking Information */}
      {order.dispatch && order.dispatch.trackingNumber && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tracking Information</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tracking #:</span>
              <span className="font-medium text-gray-900">{order.dispatch.trackingNumber}</span>
            </div>
            {order.dispatch.courier && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Courier:</span>
                <span className="font-medium text-gray-900">{order.dispatch.courier}</span>
              </div>
            )}
            {order.dispatch.estimatedDelivery && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. Delivery:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.dispatch.estimatedDelivery)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Production Timeline */}
      {order.production && (
        <div className="bg-blue-50 rounded-md p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Production Timeline</h4>
          <div className="space-y-1">
            {order.production.startDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.production.startDate)}
                </span>
              </div>
            )}
            {order.production.estimatedCompletion && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. Completion:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.production.estimatedCompletion)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Link
          to={`/order/${order._id}`}
          className="flex-1 bg-orange-500 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          View Details
        </Link>
        {order.status === 'dispatched' && order.dispatch?.trackingNumber && (
          <Link
            to={`/order/${order._id}/tracking`}
            className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Track
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileOrderCard;
