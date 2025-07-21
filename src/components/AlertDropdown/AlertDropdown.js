import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AlertDropdown.css";

const AlertDropdown = ({
    userId,
    orgId,
    userRole = "admin",
    isOpen,
    onToggle,
    onClose,
}) => {
    const [alerts, setAlerts] = useState([]);
    const [unreadAlertCount, setUnreadAlertCount] = useState(0);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [alertError, setAlertError] = useState(null);
    const websocketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId && orgId) {
            fetchAlerts();
            setupWebSocket();
        }

        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [userId, orgId]);

    const fetchAlerts = async () => {
        if (!userId || !orgId) return;

        setLoadingAlerts(true);
        setAlertError(null);

        try {
            const response = await axios.get(
                `http://localhost:8000/alerts/${orgId}/${userId}`
            );

            const alertData = response.data || [];
            setAlerts(alertData);

            // Calculate unread count (ensure alertData is an array)
            const safeAlertData = Array.isArray(alertData) ? alertData : [];
            const unread = safeAlertData.filter((a) => !a.is_read).length;
            setUnreadAlertCount(unread);
        } catch (error) {
            console.error("Error fetching alerts:", error);
            setAlertError("Failed to load alerts");
        } finally {
            setLoadingAlerts(false);
        }
    };

    const setupWebSocket = () => {
        if (!userId || !orgId) return;

        // Close existing connection if any
        if (
            websocketRef.current &&
            websocketRef.current.readyState === WebSocket.OPEN
        ) {
            console.log("Closing existing Alert WebSocket connection");
            websocketRef.current.close();
        }

        const wsUrl = `ws://localhost:8000/ws/alerts/${orgId}/${userId}`;
        console.log("Setting up Alert WebSocket connection to:", wsUrl);

        try {
            websocketRef.current = new WebSocket(wsUrl);

            websocketRef.current.onopen = () => {
                console.log("Alerts WebSocket connected");
            };

            websocketRef.current.onmessage = (event) => {
                try {
                    const alert = JSON.parse(event.data);
                    const alertId = alert.alert_id;

                    console.log("WebSocket alert message received:", alertId);

                    // Add to alerts list
                    setAlerts((prev) => {
                        const currentAlerts = Array.isArray(prev) ? prev : [];

                        // Check for duplicates
                        const isDuplicate = currentAlerts.some(
                            (existing) => existing.alert_id === alertId
                        );

                        if (isDuplicate) {
                            console.log("Duplicate alert in list, not adding");
                            return currentAlerts;
                        }

                        const updatedAlerts = [alert, ...currentAlerts];
                        const newUnreadCount = updatedAlerts.filter(
                            (a) => !a.is_read
                        ).length;
                        setUnreadAlertCount(newUnreadCount);

                        return updatedAlerts;
                    });

                    // No toast notifications for alerts - just update the list and count
                    console.log("Alert added to list:", alertId);
                } catch (error) {
                    console.error("Error parsing alert data:", error);
                }
            };

            websocketRef.current.onerror = (error) => {
                console.error("Alerts WebSocket error:", error);
            };

            websocketRef.current.onclose = (event) => {
                console.log(
                    "Alerts WebSocket disconnected:",
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
            console.error("Error setting up alerts WebSocket:", error);
        }
    };

    const markAsRead = async (alertId) => {
        if (!userId || !orgId) return;

        try {
            await axios.put(
                `http://localhost:8000/alerts/read/${orgId}/${userId}?alert_id=${alertId}`
            );

            // Update local state
            setAlerts((prev) => {
                const currentAlerts = Array.isArray(prev) ? prev : [];
                return currentAlerts.map((a) =>
                    a.alert_id === alertId ? { ...a, is_read: true } : a
                );
            });

            // Update unread count
            setUnreadAlertCount((prev) => Math.max(0, (prev || 0) - 1));
        } catch (error) {
            console.error("Error marking alert as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!userId || !orgId || unreadAlertCount === 0) return;

        try {
            console.log(
                "Marking all alerts as read using endpoint for orgId:",
                orgId,
                "userId:",
                userId
            );

            // Use the read-all endpoint
            await axios.put(
                `http://localhost:8000/alerts/read-all/${orgId}/${userId}`
            );

            // Update local state - mark all alerts as read
            setAlerts((prev) => {
                const currentAlerts = Array.isArray(prev) ? prev : [];
                return currentAlerts.map((a) => ({
                    ...a,
                    is_read: true,
                }));
            });
            setUnreadAlertCount(0);

            console.log("Successfully marked all alerts as read");
        } catch (error) {
            console.error("Error marking all alerts as read:", error);
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

    const formatDescription = (alert) => {
        if (alert.description) {
            return alert.description;
        }

        // Fallback description based on type
        switch (alert.type) {
            case "geofence_breach":
                return `Asset ${alert.asset_id} has breached geofence`;
            case "potential_geofence_breach":
                return `Asset ${alert.asset_id} is near geofence boundary`;
            case "misplaced":
                return `Asset ${alert.asset_id} appears to be misplaced`;
            default:
                return `${alert.type.replace(/_/g, " ")} alert for asset ${
                    alert.asset_id
                }`;
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case "geofence_breach":
                return "#dc3545"; // Red
            case "potential_geofence_breach":
                return "#ffc107"; // Yellow
            case "misplaced":
                return "#fd7e14"; // Orange
            default:
                return "#6c757d"; // Gray
        }
    };

    const toggleAlerts = () => {
        if (onToggle) {
            onToggle();
        }
    };

    const handleAlertClick = (alert) => {
        // Close the dropdown first
        if (onClose) {
            onClose();
        }

        // Navigate to the asset page based on user role
        const assetId = alert.asset_id;
        if (userRole === "admin") {
            navigate(`/admin/asset/${assetId}`);
        } else {
            navigate(`/user/asset/${assetId}`);
        }
    };

    return (
        <div
            className={`icon-wrapper ${
                unreadAlertCount > 0 ? "alert-icon-wrapper-active" : ""
            }`}
            onClick={toggleAlerts}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="alert-icon"
                viewBox="0 0 16 16"
            >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            {unreadAlertCount > 0 && (
                <span className="alert-badge">{unreadAlertCount}</span>
            )}
            {isOpen && (
                <div className="popup-box alert-popup">
                    {loadingAlerts ? (
                        <div className="loading-alerts">Loading alerts...</div>
                    ) : alertError ? (
                        <div className="alert-error">{alertError}</div>
                    ) : Array.isArray(alerts) && alerts.length > 0 ? (
                        <>
                            <div className="alert-header">
                                <h4>Alerts</h4>
                                <div className="alert-actions">
                                    <button
                                        className="mark-all-read"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                        disabled={unreadAlertCount === 0}
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            </div>
                            <div className="alert-list">
                                {alerts.slice(0, 10).map((alert) => (
                                    <div
                                        key={alert.alert_id}
                                        className={`alert-item ${
                                            alert.is_read ? "" : "unread"
                                        }`}
                                        style={{
                                            borderLeft: `3px solid ${getAlertColor(
                                                alert.type
                                            )}`,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handleAlertClick(alert)}
                                    >
                                        <div className="alert-icon-container">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill={getAlertColor(alert.type)}
                                                viewBox="0 0 16 16"
                                                className="alert-type-icon"
                                            >
                                                {alert.type ===
                                                    "geofence_breach" && (
                                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                                )}
                                                {alert.type ===
                                                    "potential_geofence_breach" && (
                                                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
                                                )}
                                                {alert.type === "misplaced" && (
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                )}
                                            </svg>
                                        </div>
                                        <div className="alert-details">
                                            <div className="alert-message">
                                                {formatDescription(alert)}
                                            </div>
                                            <div className="alert-meta">
                                                <span className="alert-type">
                                                    {alert.type.replace(
                                                        /_/g,
                                                        " "
                                                    )}
                                                </span>
                                                <span className="alert-time">
                                                    {formatTime(
                                                        alert.timestamp
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-alerts">No new alerts</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertDropdown;
