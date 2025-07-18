import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, currentOrgId, token } = useAuth();
  const { notificationMessages, clearNotificationMessages } = useWebSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
  if (!currentOrgId || !token) return;

  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(`http://localhost:8000/notifications/${currentOrgId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setNotifications(prev => {
      if (prev.length === 0) {
        return response.data;
      } else {

        return prev;
      }
    });
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    setError('Failed to load notifications');
  } finally {
    setLoading(false);
  }
};

  const fetchUnreadCount = async () => {
    if (!currentOrgId || !token) return;
    
    try {
      const response = await axios.get(`http://localhost:8000/notifications/unread/${currentOrgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Process WebSocket messages for real-time updates
  useEffect(() => {
    if (notificationMessages.length === 0) return;
    console.log("Processing notification messages:", notificationMessages);

    const newMessages = [...notificationMessages];
    clearNotificationMessages();

    newMessages.forEach(message => {
      console.log("Processing message type:", message.type, "with data:", message);
      switch(message.type) {
        case 'new_notification':
          console.log("Adding new notification:", message.data);
          setNotifications(prev => {
            console.log("Previous notifications count:", prev.length);
            return [message.data, ...prev];
          });
          setUnreadCount(prev => prev + 1);
          break;
          
        case 'unread_count':
          console.log("Updating unread count to:", message.data);
          setUnreadCount(message.data);
          break;
          
        case 'initial_data':
          console.log("Initial data received with", 
                    message.notifications?.length, "notifications");
          setNotifications(message.notifications || []);
          setUnreadCount(message.unread_count || 0);
          break;
          
        case 'heartbeat':
          console.log("Heartbeat received");
          // Ignore heartbeat messages
          break;
          
        default:
          console.log('Unhandled message type:', message.type);
      }
    });
  }, [notificationMessages, clearNotificationMessages]);

  useEffect(() => {
    if (user && currentOrgId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, currentOrgId, token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `http://localhost:8000/notifications/${notificationId}/read?org_id=${currentOrgId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
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