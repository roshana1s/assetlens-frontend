import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AssetDetails.css";
import { Button, Spinner, Nav, Tab, Alert } from "react-bootstrap";

const DUMMY_FRAME =
    "https://storage.googleapis.com/assetlens-b9f76.firebasestorage.app/f0001-z0001/2025-07-14T10%3A34%3A58.jpg";

const AssetDetails = () => {
    const { asset_id } = useParams();
    const navigate = useNavigate();
    const org_id = 1;
    const user_id = "u0002"; // You may need to get this from context/auth
    const ws = useRef(null);

    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("realtime");
    const [liveLocation, setLiveLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const fetchAsset = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/dashboard/assets/${org_id}/${asset_id}`
                );
                const data = await res.json();
                setAsset(data);
            } catch (err) {
                setAsset(null);
            }
            setLoading(false);
        };
        fetchAsset();
    }, [asset_id]);

    // WebSocket connection for live tracking
    useEffect(() => {
        const socketUrl = `ws://localhost:8000/ws/online-tracking/${org_id}/${user_id}`;
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Filter for our specific asset
                const assetLocation = data.locations?.find(
                    (location) => location.asset_id === asset_id
                );
                console.log(assetLocation);
                if (assetLocation) {
                    setLiveLocation(assetLocation);
                    setLastUpdate(new Date(data.timestamp));
                }
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            setIsConnected(false);
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed:", event);
            setIsConnected(false);
        };

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [asset_id, org_id, user_id]);

    if (loading) {
        return (
            <div className="assetdetails-loading">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="assetdetails-error">
                <h4>Asset not found</h4>
            </div>
        );
    }

    return (
        <div className="assetdetails-root">
            {/* Main Content Container */}
            <div className="assetdetails-main-content">
                {/* Left Panel - 25% - Asset Metadata */}
                <div className="assetdetails-metadata-panel">
                    {/* Back Button in Left Panel */}
                    <div className="assetdetails-back-button">
                        <Button
                            variant="outline-secondary"
                            size="lg"
                            onClick={() => navigate(-1)}
                            className="assetdetails-back-btn"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Assets
                        </Button>
                    </div>

                    <div className="assetdetails-metadata-container">
                        <div className="assetdetails-header">
                            <div className="assetdetails-title">
                                <i className="bi bi-box-seam"></i>
                                <span>{asset.name}</span>
                                <span className="assetdetails-id">
                                    #{asset.asset_id}
                                </span>
                            </div>
                            <div className="assetdetails-category">
                                <span className="assetdetails-category-chip">
                                    {asset.category}
                                </span>
                                {asset.geofencing && (
                                    <span className="assetdetails-geofence-chip">
                                        <i className="bi bi-geo-alt-fill"></i>{" "}
                                        Geofencing Enabled
                                    </span>
                                )}
                                <span
                                    className={`assetdetails-status-chip ${
                                        asset.assigned_to &&
                                        asset.assigned_to.length
                                            ? "assigned"
                                            : "available"
                                    }`}
                                >
                                    <i
                                        className={`bi ${
                                            asset.assigned_to &&
                                            asset.assigned_to.length
                                                ? "bi-person-check-fill"
                                                : "bi-person-dash"
                                        }`}
                                    ></i>{" "}
                                    {asset.assigned_to &&
                                    asset.assigned_to.length
                                        ? "Assigned"
                                        : "Available"}
                                </span>
                            </div>
                        </div>

                        <div className="assetdetails-content">
                            <div className="assetdetails-imgbox">
                                <img
                                    src={
                                        asset.image_link
                                            ? asset.image_link
                                            : "https://cdn-icons-png.flaticon.com/512/2991/2991108.png"
                                    }
                                    alt={asset.name}
                                    className="assetdetails-img"
                                />
                            </div>

                            <div className="assetdetails-fields">
                                <div className="assetdetails-field">
                                    <span className="assetdetails-label">
                                        RFID:
                                    </span>
                                    <span className="assetdetails-value">
                                        {asset.RFID || "-"}
                                    </span>
                                </div>
                                <div className="assetdetails-field">
                                    <span className="assetdetails-label">
                                        Assigned To:
                                    </span>
                                    <span className="assetdetails-value">
                                        {asset.assigned_to &&
                                        asset.assigned_to.length
                                            ? asset.assigned_to.join(" / ")
                                            : "-"}
                                    </span>
                                </div>
                                <div className="assetdetails-field">
                                    <span className="assetdetails-label">
                                        Floors:
                                    </span>
                                    <span className="assetdetails-value">
                                        {asset.floors && asset.floors.length
                                            ? asset.floors.join(", ")
                                            : "-"}
                                    </span>
                                </div>
                                <div className="assetdetails-field">
                                    <span className="assetdetails-label">
                                        Zones:
                                    </span>
                                    <span className="assetdetails-value">
                                        {asset.zones && asset.zones.length
                                            ? asset.zones.join(", ")
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - 75% - Monitoring Interface */}
                <div className="assetdetails-monitoring-panel">
                    <div className="assetdetails-monitoring-container">
                        <Tab.Container
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                        >
                            <div className="assetdetails-tab-header">
                                <Nav
                                    variant="tabs"
                                    className="assetdetails-nav-tabs"
                                >
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="realtime"
                                            className="assetdetails-nav-link"
                                        >
                                            <i className="bi bi-broadcast"></i>
                                            Real-time
                                            {isConnected && (
                                                <span className="assetdetails-connection-status connected">
                                                    <i className="bi bi-circle-fill"></i>
                                                </span>
                                            )}
                                            {!isConnected && (
                                                <span className="assetdetails-connection-status disconnected">
                                                    <i className="bi bi-circle"></i>
                                                </span>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="history"
                                            className="assetdetails-nav-link"
                                        >
                                            <i className="bi bi-clock-history"></i>
                                            History
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>

                            <Tab.Content className="assetdetails-tab-content">
                                <Tab.Pane
                                    eventKey="realtime"
                                    className="assetdetails-tab-pane"
                                >
                                    <div className="assetdetails-realtime-content">
                                        {/* Geofencing Alert */}
                                        {liveLocation?.geofencing_breached && (
                                            <Alert
                                                variant="danger"
                                                className="assetdetails-geofence-alert"
                                            >
                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                <strong>
                                                    Geofencing Breach Detected!
                                                </strong>
                                                <span>
                                                    Asset has moved outside the
                                                    designated zone.
                                                </span>
                                            </Alert>
                                        )}

                                        {/* Connection Status */}
                                        {!isConnected && (
                                            <Alert
                                                variant="warning"
                                                className="assetdetails-connection-alert"
                                            >
                                                <i className="bi bi-wifi-off"></i>
                                                <strong>Connection Lost</strong>
                                                <span>
                                                    Attempting to reconnect to
                                                    live tracking...
                                                </span>
                                            </Alert>
                                        )}

                                        {/* Main Camera Frame */}
                                        <div className="assetdetails-frame-container">
                                            <div className="assetdetails-frame-header">
                                                <h5>
                                                    <i className="bi bi-camera-video"></i>
                                                    Live Camera Feed
                                                </h5>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="assetdetails-download-btn"
                                                >
                                                    <i className="bi bi-download"></i>
                                                    Download
                                                </Button>
                                            </div>
                                            <div className="assetdetails-frame-box">
                                                <img
                                                    src={
                                                        liveLocation?.frame_link ||
                                                        DUMMY_FRAME
                                                    }
                                                    alt="Live Camera Feed"
                                                    className="assetdetails-frame-img"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            DUMMY_FRAME;
                                                    }}
                                                />
                                                <div className="assetdetails-frame-overlay">
                                                    <span
                                                        className={`assetdetails-live-indicator ${
                                                            isConnected
                                                                ? "connected"
                                                                : "disconnected"
                                                        }`}
                                                    >
                                                        <i className="bi bi-circle-fill"></i>
                                                        {isConnected
                                                            ? "LIVE"
                                                            : "OFFLINE"}
                                                    </span>
                                                    {liveLocation?.geofencing_breached && (
                                                        <span className="assetdetails-breach-indicator">
                                                            <i className="bi bi-exclamation-triangle-fill"></i>
                                                            BREACH
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location Information */}
                                        <div className="assetdetails-location-info">
                                            <div className="assetdetails-location-grid">
                                                <div className="assetdetails-location-item">
                                                    <div className="assetdetails-location-label">
                                                        <i className="bi bi-building"></i>
                                                        Current Floor
                                                    </div>
                                                    <div className="assetdetails-location-value">
                                                        {liveLocation?.floor_id ||
                                                            asset.floors?.[0] ||
                                                            "Floor 1"}
                                                    </div>
                                                </div>
                                                <div className="assetdetails-location-item">
                                                    <div className="assetdetails-location-label">
                                                        <i className="bi bi-geo-alt"></i>
                                                        Current Zone
                                                    </div>
                                                    <div className="assetdetails-location-value">
                                                        {liveLocation?.zone_id ||
                                                            asset.zones?.[0] ||
                                                            "Zone A"}
                                                    </div>
                                                </div>
                                                <div className="assetdetails-location-item">
                                                    <div className="assetdetails-location-label">
                                                        <i className="bi bi-clock"></i>
                                                        Last Updated
                                                    </div>
                                                    <div className="assetdetails-location-value">
                                                        {lastUpdate
                                                            ? lastUpdate.toLocaleTimeString()
                                                            : new Date().toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                <div className="assetdetails-location-item">
                                                    <div className="assetdetails-location-label">
                                                        <i className="bi bi-crosshair"></i>
                                                        Coordinates
                                                    </div>
                                                    <div className="assetdetails-location-value">
                                                        {liveLocation?.coordinates
                                                            ? `X: ${liveLocation.coordinates.x}, Y: ${liveLocation.coordinates.y}`
                                                            : "X: -, Y: -"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Pane>

                                <Tab.Pane
                                    eventKey="history"
                                    className="assetdetails-tab-pane"
                                >
                                    <div className="assetdetails-history-content">
                                        <div className="assetdetails-empty-state">
                                            <i className="bi bi-clock-history"></i>
                                            <h4>History Coming Soon</h4>
                                            <p>
                                                Historical tracking data will be
                                                available here.
                                            </p>
                                        </div>
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetDetails;
