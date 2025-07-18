import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [notificationSocket, setNotificationSocket] = useState(null);
    const [notificationMessages, setNotificationMessages] = useState([]);
    const { currentOrgId, isAuthenticated, token } = useAuth();
    const wsRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const pingIntervalRef = useRef(null);
    const isMountedRef = useRef(false);
    const reconnectTimeoutRef = useRef(null);

    const cleanup = useCallback(() => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.onopen = null;
            wsRef.current.onclose = null;
            wsRef.current.onerror = null;
            wsRef.current.onmessage = null;
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, "Normal closure");
            }
            wsRef.current = null;
        }
        setNotificationSocket(null);
    }, []);

    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated || !currentOrgId || !token) {
            cleanup();
            return;
        }

        // Clean up any existing connection
        cleanup();

        const wsUrl = `ws://localhost:8000/ws/notifications/${currentOrgId}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!isMountedRef.current) return;
            console.log('WebSocket successfully connected');
            setNotificationSocket(ws);
            reconnectAttemptsRef.current = 0;
            
            // Setup ping interval (25 seconds)
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send("ping");
                }
            }, 25000);
        };

        ws.onmessage = (event) => {
            if (!isMountedRef.current) return;
            try {
                if (event.data === "pong" || event.data === "ping") {
                    console.log("Ping/pong message received");
                    return;
                }
                
                
                let data;
                try {
                    data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    console.log('RAW WebSocket message:', event.data);
                    console.log('Parsed WebSocket message:', data);
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                    return;
                }
                
                console.log('Received WebSocket message:', data);
                setNotificationMessages(prev => [...prev, data]);
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
            }
        };

        ws.onclose = (event) => {
            if (!isMountedRef.current) return;
            console.log('WebSocket closed:', event.code, event.reason);
            
            cleanup();
            
            if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                console.log(`Reconnecting in ${delay}ms...`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectWebSocket();
                }, delay);
                reconnectAttemptsRef.current++;
            }
        };

        ws.onerror = (error) => {
            if (!isMountedRef.current) return;
            console.error('WebSocket error:', error);
        };
    }, [isAuthenticated, currentOrgId, token, cleanup]);

    useEffect(() => {
        isMountedRef.current = true;
        connectWebSocket();
        
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, [connectWebSocket, cleanup]);

    return (
        <WebSocketContext.Provider value={{ 
            notificationSocket,
            notificationMessages,
            clearNotificationMessages: () => setNotificationMessages([])
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);