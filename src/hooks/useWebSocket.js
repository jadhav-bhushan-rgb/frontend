import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import websocketService from '../services/websocketService';

export const useWebSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (user?._id) {
      // Connect to WebSocket
      websocketService.connect();

      // Listen for connection status changes
      const handleConnection = (data) => {
        setIsConnected(data.status === 'connected');
        setConnectionStatus(data.status);
      };

      websocketService.subscribe('connection', handleConnection);

      // Set up ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (websocketService.getConnectionStatus().isConnected) {
          websocketService.ping();
        }
      }, 30000); // Ping every 30 seconds

      return () => {
        websocketService.unsubscribe('connection', handleConnection);
        clearInterval(pingInterval);
        websocketService.disconnect();
      };
    }
  }, [user?._id]);

  const subscribe = (event, callback) => {
    websocketService.subscribe(event, callback);
    
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);

    return () => {
      websocketService.unsubscribe(event, callback);
      const callbacks = listenersRef.current.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  };

  const send = (message) => {
    return websocketService.send(message);
  };

  return {
    isConnected,
    connectionStatus,
    subscribe,
    send,
    getConnectionStatus: websocketService.getConnectionStatus.bind(websocketService)
  };
};

export const useOrderUpdates = (orderId) => {
  const [orderData, setOrderData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (!orderId) return;

    const unsubscribeOrder = subscribe('order_update', (data) => {
      if (data.data?.orderId === orderId) {
        setOrderData(data.data);
        setLastUpdate(new Date());
      }
    });

    const unsubscribeDispatch = subscribe('dispatch', (data) => {
      if (data.data?.orderId === orderId) {
        setOrderData(prev => ({
          ...prev,
          dispatch: data.data
        }));
        setLastUpdate(new Date());
      }
    });

    const unsubscribePayment = subscribe('payment', (data) => {
      if (data.data?.orderId === orderId) {
        setOrderData(prev => ({
          ...prev,
          payment: data.data
        }));
        setLastUpdate(new Date());
      }
    });

    return () => {
      unsubscribeOrder();
      unsubscribeDispatch();
      unsubscribePayment();
    };
  }, [orderId, subscribe]);

  return {
    orderData,
    lastUpdate
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return unsubscribe;
  }, [subscribe]);

  return notifications;
};

export default useWebSocket;
