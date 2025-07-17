import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AssetDetails.css";
import { Button, Spinner, Nav, Tab, Alert } from "react-bootstrap";

const DUMMY_FRAME =
    "https://firebasestorage.googleapis.com/v0/b/assetlens-b9f76.firebasestorage.app/o/animation%2Floading-dummy-frame.gif?alt=media&token=b77f9ad7-7947-4182-87d9-2d6ffb3cd044";

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
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

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

    // Function to handle video generation
    const handleGenerateVideo = async () => {
        if (!startTime || !endTime) {
            setVideoError("Please select both start and end times");
            return;
        }

        if (new Date(startTime) >= new Date(endTime)) {
            setVideoError("End time must be after start time");
            return;
        }

        setVideoLoading(true);
        setVideoError(null);
        setVideoUrl(null);

        try {
            const response = await fetch(
                `http://localhost:8000/asset-video/${org_id}/${asset_id}/video`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        start_time: startTime,
                        end_time: endTime,
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate video: ${errorText}`);
            }

            // Simple blob approach
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        } catch (err) {
            setVideoError("Failed to generate video. Please try again.");
            console.error("Video generation error:", err);
        } finally {
            setVideoLoading(false);
        }
    };

    // Function to get default datetime values (last 24 hours)
    const getDefaultDateTimes = () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return {
            start: yesterday.toISOString().slice(0, 16),
            end: now.toISOString().slice(0, 16),
        };
    };

    // Set default values when component mounts
    React.useEffect(() => {
        const defaults = getDefaultDateTimes();
        setStartTime(defaults.start);
        setEndTime(defaults.end);
    }, []);

    // Cleanup video URL when component unmounts
    React.useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

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

                                        {/* Main Camera Frame with Right Sidebar */}
                                        <div className="assetdetails-frame-container">
                                            <div className="assetdetails-frame-main">
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

                                            {/* Right Sidebar */}
                                            <div className="assetdetails-frame-sidebar">
                                                {/* Location Information */}
                                                <div className="assetdetails-location-info">
                                                    <div className="assetdetails-location-header">
                                                        <h6>
                                                            <i className="bi bi-geo-alt-fill"></i>
                                                            Location Details
                                                        </h6>
                                                    </div>
                                                    <div className="assetdetails-location-stack">
                                                        <div className="assetdetails-location-item">
                                                            <div className="assetdetails-location-label">
                                                                <i className="bi bi-building"></i>
                                                                Floor
                                                            </div>
                                                            <div className="assetdetails-location-value floor">
                                                                {liveLocation?.floor_id ||
                                                                    "-"}
                                                            </div>
                                                        </div>
                                                        <div className="assetdetails-location-item">
                                                            <div className="assetdetails-location-label">
                                                                <i className="bi bi-geo-alt"></i>
                                                                Zone
                                                            </div>
                                                            <div className="assetdetails-location-value zone">
                                                                {liveLocation?.zone_id ||
                                                                    "-"}
                                                            </div>
                                                        </div>
                                                        <div className="assetdetails-location-item">
                                                            <div className="assetdetails-location-label">
                                                                <i className="bi bi-geo-alt-fill"></i>
                                                                X
                                                            </div>
                                                            <div className="assetdetails-location-value coordinate">
                                                                {liveLocation?.coordinates
                                                                    ? Math.floor(
                                                                          liveLocation
                                                                              .coordinates
                                                                              .x
                                                                      )
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                        <div className="assetdetails-location-item">
                                                            <div className="assetdetails-location-label">
                                                                <i className="bi bi-geo-alt-fill"></i>
                                                                Y
                                                            </div>
                                                            <div className="assetdetails-location-value coordinate">
                                                                {liveLocation?.coordinates
                                                                    ? Math.floor(
                                                                          liveLocation
                                                                              .coordinates
                                                                              .y
                                                                      )
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                        <div className="assetdetails-location-item">
                                                            <div className="assetdetails-location-label">
                                                                <i className="bi bi-clock"></i>
                                                                Last Update
                                                            </div>
                                                            <div className="assetdetails-location-value time">
                                                                {lastUpdate
                                                                    ? lastUpdate.toLocaleTimeString()
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Info Section */}
                                                <div className="assetdetails-status-info">
                                                    <div className="assetdetails-location-header">
                                                        <h6>
                                                            <i className="bi bi-activity"></i>
                                                            Status
                                                        </h6>
                                                    </div>
                                                    <div className="assetdetails-status-items">
                                                        <div className="assetdetails-status-item">
                                                            <span className="assetdetails-status-label">
                                                                Connection
                                                            </span>
                                                            <span
                                                                className={`assetdetails-status-value ${
                                                                    isConnected
                                                                        ? "connected"
                                                                        : "disconnected"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`bi ${
                                                                        isConnected
                                                                            ? "bi-wifi"
                                                                            : "bi-wifi-off"
                                                                    }`}
                                                                ></i>
                                                                {isConnected
                                                                    ? "Online"
                                                                    : "Offline"}
                                                            </span>
                                                        </div>
                                                        <div className="assetdetails-status-item">
                                                            <span className="assetdetails-status-label">
                                                                Geofencing
                                                            </span>
                                                            <span
                                                                className={`assetdetails-status-value ${
                                                                    liveLocation?.geofencing_breached
                                                                        ? "breach"
                                                                        : "safe"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`bi ${
                                                                        liveLocation?.geofencing_breached
                                                                            ? "bi-exclamation-triangle-fill"
                                                                            : "bi-shield-check"
                                                                    }`}
                                                                ></i>
                                                                {liveLocation?.geofencing_breached
                                                                    ? "Breach"
                                                                    : "Safe"}
                                                            </span>
                                                        </div>
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
                                        <div className="assetdetails-video-generator">
                                            <div className="assetdetails-video-form">
                                                <h5>
                                                    <i className="bi bi-film"></i>
                                                    Generate Tracking Video
                                                </h5>
                                                <p className="text-muted">
                                                    Select a time range to
                                                    generate a video from asset
                                                    tracking frames.
                                                </p>

                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-6">
                                                        <label
                                                            htmlFor="startTime"
                                                            className="form-label"
                                                        >
                                                            <i className="bi bi-play-circle"></i>
                                                            Start Time
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            className="form-control"
                                                            id="startTime"
                                                            value={startTime}
                                                            onChange={(e) =>
                                                                setStartTime(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                videoLoading
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label
                                                            htmlFor="endTime"
                                                            className="form-label"
                                                        >
                                                            <i className="bi bi-stop-circle"></i>
                                                            End Time
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            className="form-control"
                                                            id="endTime"
                                                            value={endTime}
                                                            onChange={(e) =>
                                                                setEndTime(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                videoLoading
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {videoError && (
                                                    <Alert
                                                        variant="danger"
                                                        className="mb-3"
                                                    >
                                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                                        {videoError}
                                                    </Alert>
                                                )}

                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    onClick={
                                                        handleGenerateVideo
                                                    }
                                                    disabled={
                                                        videoLoading ||
                                                        !startTime ||
                                                        !endTime
                                                    }
                                                    className="assetdetails-generate-btn"
                                                >
                                                    {videoLoading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                                className="me-2"
                                                            />
                                                            Generating Video...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-film"></i>
                                                            Generate Video
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {videoUrl && (
                                                <div className="assetdetails-video-player">
                                                    <h5>
                                                        <i className="bi bi-play-btn"></i>
                                                        Generated Video
                                                    </h5>
                                                    <div className="assetdetails-video-container">
                                                        <video
                                                            controls
                                                            width="100%"
                                                            height="auto"
                                                            className="assetdetails-video"
                                                            src={videoUrl}
                                                            onError={(e) => {
                                                                console.error(
                                                                    "Video error:",
                                                                    e.target
                                                                        .error
                                                                );
                                                                setVideoError(
                                                                    "Cannot play video in browser. Please download to watch."
                                                                );
                                                            }}
                                                            style={{
                                                                maxHeight:
                                                                    "500px",
                                                                objectFit:
                                                                    "contain",
                                                            }}
                                                        >
                                                            Your browser does
                                                            not support the
                                                            video tag.
                                                        </video>
                                                    </div>
                                                    <div className="assetdetails-video-actions">
                                                        <Button
                                                            variant="success"
                                                            onClick={() => {
                                                                const link =
                                                                    document.createElement(
                                                                        "a"
                                                                    );
                                                                link.href =
                                                                    videoUrl;
                                                                link.download = `asset_${asset_id}_tracking_video.mp4`;
                                                                link.click();
                                                            }}
                                                            className="me-2"
                                                        >
                                                            <i className="bi bi-download"></i>
                                                            Download Video
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => {
                                                                if (videoUrl) {
                                                                    URL.revokeObjectURL(
                                                                        videoUrl
                                                                    );
                                                                }
                                                                setVideoUrl(
                                                                    null
                                                                );
                                                                setVideoError(
                                                                    null
                                                                );
                                                            }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                            Clear Video
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
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
