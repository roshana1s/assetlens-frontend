// src/pages/alertPage/AlertPage.js
import React, { useState, useEffect } from 'react';
import { alertSocket } from '../../services/alertSocket';
import './alertPage.css';

const AlertPage = ({ orgId = 1, userId = 'current_user' }) => {
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    alertSocket.connect(orgId, userId);

    const handleConnect = () => setConnectionStatus('connected');
    const handleDisconnect = () => setConnectionStatus('disconnected');
    const handleMessage = (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      showNotification(alert);
    };

    alertSocket.on('connect', handleConnect);
    alertSocket.on('disconnect', handleDisconnect);
    alertSocket.on('message', handleMessage);

    return () => {
      alertSocket.off('connect', handleConnect);
      alertSocket.off('disconnect', handleDisconnect);
      alertSocket.off('message', handleMessage);
      alertSocket.disconnect();
    };
  }, [orgId, userId]);

  const showNotification = (alert) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(`New Alert: ${alert.title}`, {
        body: alert.message,
        icon: '/notification-icon.png',
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  };

  const markAsRead = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.alert_id === alertId ? { ...alert, is_read: true } : alert
      )
    );
  };

  return (
    <div className="alert-page">
      <header className="alert-header">
        <h1>Alerts</h1>
        <div className="alert-actions">
          <button onClick={requestNotificationPermission}>
            Enable Notifications
          </button>
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus}
          </span>
        </div>
      </header>

      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">No alerts received</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`alert-item ${alert.is_read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(alert.alert_id)}
            >
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-message">{alert.message}</p>
              <time className="alert-time">
                {new Date(alert.timestamp).toLocaleString()}
              </time>
              {!alert.is_read && <div className="unread-badge">New</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPage;