import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { notificationAPI } from '../services/api';
import { 
  BellIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  const { data: notificationData, refetch } = useQuery(
    'notifications',
    async () => {
      try {
        const response = await notificationAPI.getNotifications();
        return response.data.notifications || [];
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true
    }
  );

  useEffect(() => {
    if (notificationData) {
      setNotifications(notificationData);
    }
  }, [notificationData]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-4 border-l-red-500 bg-red-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('=== MARKING NOTIFICATION AS READ ===');
      console.log('Notification ID:', notificationId);
      
      const response = await notificationAPI.markAsRead(notificationId);
      console.log('Mark as read response:', response);
      
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      
      console.log('Notification marked as read successfully');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  // Mark all as read
                  try {
                    await notificationAPI.markAllAsRead();
                    setNotifications(prev => 
                      prev.map(n => ({ ...n, read: true }))
                    );
                  } catch (error) {
                    console.error('Failed to mark all notifications as read:', error);
                  }
                }}
                className="w-full text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
