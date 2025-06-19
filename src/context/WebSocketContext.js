import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [notificationSocket, setNotificationSocket] = useState(null);
    const [alertSocket, setAlertSocket] = useState(null);
    const { currentOrgId, isAuthenticated, user } = useAuth();

    useEffect(() => {
    let notifWs = null;
    let alertWs = null;
    
    const connectWebSockets = () => {
        if (isAuthenticated && currentOrgId && user?.id) {
            notifWs = new WebSocket(`ws://localhost:8000/ws/notifications/${currentOrgId}`);
            
            notifWs.onopen = () => {
                console.log('Notification WebSocket connected');
                setNotificationSocket(notifWs);
            };
            
            notifWs.onmessage = (event) => {
            };
            
            notifWs.onclose = (event) => {
                console.log('Notification WebSocket disconnected', event.reason);
                setNotificationSocket(null);
                setTimeout(connectWebSockets, 3000);
            };
            
            notifWs.onerror = (error) => {
                console.error('Notification WebSocket error:', error);
            };

            alertWs = new WebSocket(`ws://localhost:8000/ws/alerts/${currentOrgId}`);
            
            alertWs.onopen = () => {
                console.log('Alert WebSocket connected');
                setAlertSocket(alertWs);
            };
            
            alertWs.onclose = (event) => {
                console.log('Alert WebSocket disconnected', event.reason);
                setAlertSocket(null);
                setTimeout(connectWebSockets, 3000);
            };
            
            alertWs.onerror = (error) => {
                console.error('Alert WebSocket error:', error);
            };
        }
    };

    connectWebSockets();

    return () => {
        if (notifWs) notifWs.close();
        if (alertWs) alertWs.close();
    };
}, [isAuthenticated, currentOrgId, user?.id]);

    return (
        <WebSocketContext.Provider value={{ 
            notificationSocket,
            alertSocket
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);