import React, { useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import './NotificationPage.css';

const NotificationPage = () => {
    const { 
        notifications: allNotifications = [],
        fetchNotifications: fetchAllNotifications,
    } = useNotifications();
    const { currentOrgId } = useAuth();

    useEffect(() => {
        if (currentOrgId) {
            fetchAllNotifications();
        }
    }, [currentOrgId, fetchAllNotifications]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'asset_created': return '#28a745';
            case 'asset_updated': return '#17a2b8';
            case 'asset_deleted': return '#dc3545';
            case 'user_created': return '#28a745';
            case 'user_updated': return '#17a2b8';
            case 'user_deleted': return '#dc3545';
            default: return '#6c757d';
        }
    };

    return (
        <div className="notification-page-container">
            <div className="notification-page-header">
                <h1>Notifications History</h1>
            </div>
            
            <div className="notification-list-container">
                {allNotifications.length > 0 ? (
                    <table className="notification-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60%' }}>Notification</th>
                                <th style={{ width: '20%' }}>Type</th>
                                <th style={{ width: '20%' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allNotifications.map((notification) => (
                                <tr key={notification._id} className="notification-row">
                                    <td>
                                        <div className="notification-message" style={{ borderLeft: `3px solid ${getNotificationColor(notification.type)}` }}>
                                            {notification.message}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="notification-type-badge" style={{ backgroundColor: getNotificationColor(notification.type) }}>
                                            {notification.type.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="notification-time">{formatTime(notification.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-notifications-message">
                        <p>No notifications found in your history</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;