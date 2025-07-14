import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, currentOrgId, token } = useAuth();
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!currentOrgId || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [notifsResponse, countResponse] = await Promise.all([
        axios.get(`http://localhost:8000/notifications/${currentOrgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/notifications/unread/${currentOrgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setNotifications(notifsResponse.data);
      setUnreadCount(countResponse.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotifications = async (skip = 0, limit = 20) => {
    if (!currentOrgId || !token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/notifications/all/${currentOrgId}?skip=${skip}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch all notifications:', err);
      setError(err.response?.data?.detail || 'Failed to load all notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
    // Handle different message types
    if (data.type === 'notification') {
        // New notification
        setNotifications(prev => [data.data, ...prev.slice(0, 4)]);
        setAllNotifications(prev => [data.data, ...prev]);
        setUnreadCount(prev => prev + 1);
    } else if (data.type === 'unread_count') {
        // Update unread count
        setUnreadCount(data.data);
    }
};

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleNotification(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      return () => {
        socket.onmessage = null;
      };
    }
  }, [socket]);

  useEffect(() => {
    if (user && currentOrgId) {
      fetchNotifications();
    }
  }, [user, currentOrgId, token]);

  const markAsRead = async (notificationId) => {
    try {
        await axios.patch(
            `http://localhost:8000/notifications/${notificationId}/read?org_id=${currentOrgId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // No need to manually update count - will come via WebSocket
    } catch (err) {
        console.error('Failed to mark notification as read:', err);
    }
};

  const markAllAsRead = async () => {
    try {
        await axios.patch(
            `http://localhost:8000/notifications/mark-all-read/${currentOrgId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Optimistically update the UI
        setUnreadCount(0);
        setNotifications(prev => 
            prev.map(n => ({ ...n, is_read: true }))
        );
        setAllNotifications(prev => 
            prev.map(n => ({ ...n, is_read: true }))
        );
    } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
    }
};

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        allNotifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchAllNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);