import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./NotificationDropdown.css";

// Global toast tracking to prevent duplicates across all instances
const globalToastTracker = new Set();

const NotificationDropdown = ({ userId, orgId, userRole = "admin" }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState(null);
    const websocketRef = useRef(null);

    useEffect(() => {
        if (userId && orgId) {
            fetchNotifications();
            setupWebSocket();
        }

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [userId, orgId]);

    const fetchNotifications = async () => {
        if (!userId || !orgId) return;

        setLoadingNotifications(true);
        setNotificationError(null);

        try {
            const response = await axios.get(
                `http://localhost:8000/notifications/${orgId}/${userId}`
            );

            const notificationData = response.data || [];
            setNotifications(notificationData);

            // Calculate unread count (ensure notificationData is an array)
            const safeNotificationData = Array.isArray(notificationData)
                ? notificationData
                : [];
            const unread = safeNotificationData.filter(
                (n) => !n.is_read
            ).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotificationError("Failed to load notifications");
        } finally {
            setLoadingNotifications(false);
        }
    };

    const setupWebSocket = () => {
        if (!userId || !orgId) return;

        // Close existing connection if any
        if (
            websocketRef.current &&
            websocketRef.current.readyState === WebSocket.OPEN
        ) {
            console.log("Closing existing WebSocket connection");
            websocketRef.current.close();
        }

        const wsUrl = `ws://localhost:8000/ws/notifications/${orgId}/${userId}`;
        console.log("Setting up WebSocket connection to:", wsUrl);

        try {
            websocketRef.current = new WebSocket(wsUrl);

            websocketRef.current.onopen = () => {
                console.log("Notifications WebSocket connected");
            };

            websocketRef.current.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    const notificationId =
                        notification.notification_id || notification._id;
                    const toastKey = `${notificationId}_${Date.now()}`;

                    console.log("WebSocket message received:", notificationId);

                    // Global check - if toast already shown for this notification, skip entirely
                    if (globalToastTracker.has(notificationId)) {
                        console.log(
                            "Toast already shown globally, skipping everything"
                        );
                        return;
                    }

                    // Add to notifications list
                    setNotifications((prev) => {
                        const currentNotifications = Array.isArray(prev)
                            ? prev
                            : [];

                        // Check for duplicates
                        const isDuplicate = currentNotifications.some(
                            (existing) =>
                                (existing.notification_id || existing._id) ===
                                notificationId
                        );

                        if (isDuplicate) {
                            console.log("Duplicate in list, not adding");
                            return currentNotifications;
                        }

                        const updatedNotifications = [
                            notification,
                            ...currentNotifications,
                        ];
                        const newUnreadCount = updatedNotifications.filter(
                            (n) => !n.is_read
                        ).length;
                        setUnreadCount(newUnreadCount);

                        return updatedNotifications;
                    });

                    // Show toast ONLY for unread notifications and ONLY once globally
                    if (!notification.is_read) {
                        globalToastTracker.add(notificationId);
                        console.log(
                            "Showing single toast for:",
                            notification.message
                        );

                        toast.info(notification.message, {
                            position: "top-right",
                            autoClose: 1500, // 1.5 seconds
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: true,
                        });

                        // Remove from global tracker after 5 seconds
                        setTimeout(() => {
                            globalToastTracker.delete(notificationId);
                            console.log(
                                "Removed from global tracker:",
                                notificationId
                            );
                        }, 5000);
                    }
                } catch (error) {
                    console.error("Error parsing notification data:", error);
                }
            };

            websocketRef.current.onerror = (error) => {
                console.error("Notifications WebSocket error:", error);
            };

            websocketRef.current.onclose = (event) => {
                console.log(
                    "Notifications WebSocket disconnected:",
                    event.code,
                    event.reason
                );

                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    if (userId && orgId) {
                        setupWebSocket();
                    }
                }, 5000);
            };
        } catch (error) {
            console.error("Error setting up notifications WebSocket:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        if (!userId || !orgId) return;

        try {
            await axios.put(
                `http://localhost:8000/notifications/read/${orgId}/${userId}`,
                { notification_id: notificationId }
            );

            // Update local state (ensure prev is always an array)
            setNotifications((prev) => {
                const currentNotifications = Array.isArray(prev) ? prev : [];
                return currentNotifications.map((n) =>
                    n.notification_id === notificationId ||
                    n._id === notificationId
                        ? { ...n, is_read: true }
                        : n
                );
            });

            // Update unread count
            setUnreadCount((prev) => Math.max(0, (prev || 0) - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!userId || !orgId || unreadCount === 0) return;

        try {
            console.log(
                "Marking all as read using new endpoint for orgId:",
                orgId,
                "userId:",
                userId
            );

            // Use the new read-all endpoint
            await axios.put(
                `http://localhost:8000/notifications/read-all/${orgId}/${userId}`
            );

            // Update local state - mark all notifications as read
            setNotifications((prev) => {
                const currentNotifications = Array.isArray(prev) ? prev : [];
                return currentNotifications.map((n) => ({
                    ...n,
                    is_read: true,
                }));
            });
            setUnreadCount(0);

            console.log("Successfully marked all notifications as read");
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp.$date || timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const getNotificationRoute = () => {
        if (userRole === "admin") {
            return `/admin/notifications`;
        }
        return `/user/notifications`;
    };

    return (
        <div className="icon-wrapper" onClick={toggleNotifications}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="notification-icon"
                viewBox="0 0 16 16"
            >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
            </svg>
            {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
            )}
            {showNotifications && (
                <div className="popup-box notification-popup">
                    {loadingNotifications ? (
                        <div className="loading-notifications">
                            Loading notifications...
                        </div>
                    ) : notificationError ? (
                        <div className="notification-error">
                            {notificationError}
                        </div>
                    ) : Array.isArray(notifications) &&
                      notifications.length > 0 ? (
                        <>
                            <div className="notification-header">
                                <h4>Notifications</h4>
                                <div className="notification-actions">
                                    <button
                                        className="mark-all-read"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                        disabled={unreadCount === 0}
                                    >
                                        Mark all as read
                                    </button>
                                    <NavLink
                                        to={getNotificationRoute()}
                                        className="view-all-link"
                                        onClick={() =>
                                            setShowNotifications(false)
                                        }
                                    >
                                        View All
                                    </NavLink>
                                </div>
                            </div>
                            <div className="notification-list">
                                {notifications
                                    .slice(0, 10)
                                    .map((notification) => (
                                        <div
                                            key={
                                                notification.notification_id ||
                                                notification._id
                                            }
                                            className={`notification-item ${
                                                notification.is_read
                                                    ? ""
                                                    : "unread"
                                            }`}
                                        >
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-meta">
                                                <span className="notification-type">
                                                    {notification.type
                                                        .replace(/_/g, " ")
                                                        .toLowerCase()}
                                                </span>
                                                <span className="notification-time">
                                                    {formatTime(
                                                        notification.timestamp
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-notifications">
                            No new notifications
                            <NavLink
                                to={getNotificationRoute()}
                                className="view-all-link"
                                onClick={() => setShowNotifications(false)}
                            >
                                View All Notifications
                            </NavLink>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
