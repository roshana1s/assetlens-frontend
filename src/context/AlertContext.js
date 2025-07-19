// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from './AuthContext';
// import { useWebSocket } from './WebSocketContext';

// const AlertContext = createContext();

// export const AlertProvider = ({ children }) => {
//   const { user, currentOrgId, token } = useAuth();
//   const { alertSocket } = useWebSocket();
//   const [alerts, setAlerts] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const fetchAlerts = async () => {
//     if (!currentOrgId || !token) return;
    
//     try {
//       setLoading(true);
//       console.log('Fetching alerts for org:', currentOrgId);  // Debug log
//       const response = await axios.get(
//         `http://localhost:8000/alerts/${currentOrgId}`, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log('Alerts response:', response.data);  // Debug log
//       setAlerts(response.data);
      
//       const countResponse = await axios.get(
//         `http://localhost:8000/alerts/unread/${currentOrgId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log('Unread count:', countResponse.data.unread_count);  // Debug log
//       setUnreadCount(countResponse.data.unread_count);
//     } catch (error) {
//       console.error('Error fetching alerts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (alertSocket) {
//       alertSocket.onmessage = (event) => {
//     try {
//         const data = JSON.parse(event.data);
//         if (data.type === 'alert') {
//             setAlerts(prev => [data.data, ...prev.slice(0, 4)]);
//             setUnreadCount(prev => prev + 1);
//         } 
//         else if (data.type === 'alert_unread_count') {
//             setUnreadCount(data.data);
//         }
//         else if (data.type === 'initial_alerts') {
//             setAlerts(data.data);
//         }
//     } catch (err) {
//         console.error('Error parsing WebSocket message:', err);
//     }
// };
//     }
//   }, [alertSocket]);

//   useEffect(() => {
//     if (user && currentOrgId) {
//       fetchAlerts();
//     }
//   }, [user, currentOrgId, token]);

//   const markAsRead = async (alertId) => {
//     try {
//       await axios.patch(
//         `http://localhost:8000/alerts/${alertId}/read`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAlerts(prev => 
//         prev.map(alert => 
//           alert._id === alertId ? { ...alert, status: 'read' } : alert
//         )
//       );
//       setUnreadCount(prev => prev - 1);
//     } catch (error) {
//       console.error('Error marking alert as read:', error);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await axios.patch(
//         `http://localhost:8000/alerts/mark-all-read/${currentOrgId}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAlerts(prev => 
//         prev.map(alert => ({ ...alert, status: 'read' }))
//       );
//       setUnreadCount(0);
//     } catch (error) {
//       console.error('Error marking all alerts as read:', error);
//     }
//   };

//   return (
//     <AlertContext.Provider value={{ 
//       alerts, 
//       unreadCount,
//       loading,
//       markAsRead,
//       markAllAsRead,
//       fetchAlerts
//     }}>
//       {children}
//     </AlertContext.Provider>
//   );
// };

// export const useAlerts = () => useContext(AlertContext);

// frontend/context/AlertContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { user, currentOrgId, token } = useAuth();
  const { notificationSocket } = useWebSocket();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    if (!currentOrgId || !token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/alerts/${currentOrgId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts(response.data);
      
      const countResponse = await axios.get(
        `http://localhost:8000/alerts/unread/${currentOrgId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(countResponse.data.unread_count);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notificationSocket) {
      notificationSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Alert WebSocket message:', data); // Debug log
          
          if (data.type === 'alert') {
            // New alert received
            setAlerts(prev => [data.data, ...prev.slice(0, 4)]);
            setUnreadCount(prev => prev + 1);
          } 
          else if (data.type === 'alert_unread_count') {
            // Unread count update
            setUnreadCount(data.data);
          }
          else if (data.type === 'initial_alerts') {
            // Initial alerts data
            setAlerts(data.data);
          }
          else if (data.type === 'heartbeat') {
            // Ignore heartbeat
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
    }
  }, [notificationSocket]);

  useEffect(() => {
    if (user && currentOrgId) {
      fetchAlerts();
    }
  }, [user, currentOrgId, token]);

  const markAsRead = async (alertId) => {
    try {
      await axios.patch(
        `http://localhost:8000/alerts/${alertId}/read`,
        { org_id: currentOrgId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts(prev => 
        prev.map(alert => 
          alert._id === alertId ? { ...alert, status: 'read' } : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `http://localhost:8000/alerts/mark-all-read/${currentOrgId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update the state
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, status: 'read' }))
      );
      setUnreadCount(0); // Reset unread count to 0
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
};

  return (
    <AlertContext.Provider value={{ 
      alerts, 
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      fetchAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);