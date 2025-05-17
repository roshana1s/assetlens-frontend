// NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, currentOrgId, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

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
      setUnreadCount(countResponse.data.count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Fetch immediately and then every 30 seconds
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    setPollingInterval(interval);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (user && currentOrgId) {
      const cleanup = startPolling();
      return cleanup;
    }
  }, [user, currentOrgId, token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `http://localhost:8000/notifications/mark-read/${currentOrgId}/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => 
        prev.map(n => 
          n.entity_id === notificationId ? { ...n, is_read: true } : n
        )
      );
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
      setUnreadCount(0);
      setNotifications(prev => 
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
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);