import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CameraFeed.css";
import { Button, Spinner, Nav, Tab, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const DUMMY_FRAME =
    "https://firebasestorage.googleapis.com/v0/b/assetlens-b9f76.firebasestorage.app/o/animation%2Floading-dummy-frame.gif?alt=media&token=b77f9ad7-7947-4182-87d9-2d6ffb3cd044";

const CameraFeed = () => {
    const { camera_id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const ws = useRef(null);

    const [camera, setCamera] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("realtime");
    const [liveFrame, setLiveFrame] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    useEffect(() => {
        const fetchCamera = async () => {
            setLoading(true);
            try {
                if (!user?.org_id) return;
                const res = await fetch(
                    `http://localhost:8000/cameras/${user.org_id}/get-camera/${camera_id}`
                );
                const data = await res.json();
                setCamera(data);
                setError(null);
            } catch (err) {
                setCamera(null);
                setError("Failed to load camera details");
            }
            setLoading(false);
        };
        fetchCamera();
    }, [camera_id, user]);

    // WebSocket connection for camera feed
    useEffect(() => {
        if (!user?.org_id) return;
        const socketUrl = `ws://localhost:8000/ws/online-tracking/${user.org_id}/${user.id}`;
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log("Camera WebSocket connected");
            setIsConnected(true);
        };

        socket.onmessage = async (event) => {
            try {
                const wsData = JSON.parse(event.data);
                console.log("WebSocket message received:", wsData);

                // When WebSocket sends a message, fetch the current frame with timestamp
                if (wsData.timestamp) {
                    const frameResponse = await fetch(
                        `http://localhost:8000/cameras/${user.org_id}/get-frame/${camera_id}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                timestamp: wsData.timestamp,
                            }),
                        }
                    );

                    if (frameResponse.ok) {
                        const frameData = await frameResponse.json();
                        setLiveFrame(frameData);
                        setLastUpdate(new Date(frameData.timestamp));
                    }
                }
            } catch (err) {
                console.error("Error processing WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("Camera WebSocket error:", err);
            setIsConnected(false);
        };

        socket.onclose = (event) => {
            console.log("Camera WebSocket closed:", event);
            setIsConnected(false);
        };

        // Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [camera_id, user]);

    // Function to handle camera video generation
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
            if (!user?.org_id) return;
            const response = await fetch(
                `http://localhost:8000/cameras/${user.org_id}/get-video-file/${camera_id}`,
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
            setVideoError("Failed to generate camera video. Please try again.");
            console.error("Camera video generation error:", err);
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
            <div className="camera-feed-loading">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!camera) {
        return (
            <div className="camera-feed-error">
                <h4>Camera not found</h4>
            </div>
        );
    }

    return (
        <div className="camera-feed-root">
            {/* Main Content Container */}
            <div className="camera-feed-main-content">
                {/* Left Panel - 25% - Camera Metadata */}
                <div className="camera-feed-metadata-panel">
                    {/* Back Button in Left Panel */}
                    <div className="camera-feed-back-button">
                        <Button
                            variant="outline-secondary"
                            size="lg"
                            onClick={() => navigate(-1)}
                            className="camera-feed-back-btn"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Dashboard
                        </Button>
                    </div>

                    <div className="camera-feed-metadata-container">
                        <div className="camera-feed-header">
                            <div className="camera-feed-title">
                                <i className="bi bi-camera-video"></i>
                                <span>Camera #{camera_id}</span>
                            </div>
                            <div className="camera-feed-category">
                                <span className="camera-feed-floor-chip">
                                    <i className="bi bi-building"></i>
                                    {camera.floor_name || "Unknown Floor"}
                                </span>
                                <span className="camera-feed-zone-chip">
                                    <i className="bi bi-geo-alt-fill"></i>
                                    {camera.zone_name || "Unknown Zone"}
                                </span>
                                <span
                                    className={`camera-feed-status-chip ${
                                        camera.working ? "working" : "offline"
                                    }`}
                                >
                                    <i
                                        className={`bi ${
                                            camera.working
                                                ? "bi-check-circle-fill"
                                                : "bi-x-circle-fill"
                                        }`}
                                    ></i>
                                    {camera.working ? "Working" : "Offline"}
                                </span>
                            </div>
                        </div>

                        <div className="camera-feed-content">
                            <div className="camera-feed-imgbox">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3179/3179068.png"
                                    alt="Camera"
                                    className="camera-feed-img"
                                />
                            </div>

                            <div className="camera-feed-fields">
                                <div className="camera-feed-field">
                                    <span className="camera-feed-label">
                                        Floor ID:
                                    </span>
                                    <span className="camera-feed-value">
                                        {camera.floor_id || "-"}
                                    </span>
                                </div>
                                <div className="camera-feed-field">
                                    <span className="camera-feed-label">
                                        Zone ID:
                                    </span>
                                    <span className="camera-feed-value">
                                        {camera.zone_id || "-"}
                                    </span>
                                </div>
                                <div className="camera-feed-field">
                                    <span className="camera-feed-label">
                                        Coordinates:
                                    </span>
                                    <span className="camera-feed-value">
                                        {camera.coordinates
                                            ? `X: ${Math.floor(
                                                  camera.coordinates.x
                                              )}, Y: ${Math.floor(
                                                  camera.coordinates.y
                                              )}`
                                            : "-"}
                                    </span>
                                </div>
                                <div className="camera-feed-field">
                                    <span className="camera-feed-label">
                                        Status:
                                    </span>
                                    <span className="camera-feed-value">
                                        {camera.working ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - 75% - Camera Monitoring Interface */}
                <div className="camera-feed-monitoring-panel">
                    <div className="camera-feed-monitoring-container">
                        <Tab.Container
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                        >
                            <div className="camera-feed-tab-header">
                                <Nav
                                    variant="tabs"
                                    className="camera-feed-nav-tabs"
                                >
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="realtime"
                                            className="camera-feed-nav-link"
                                        >
                                            <i className="bi bi-broadcast"></i>
                                            Real-time
                                            {isConnected && (
                                                <span className="camera-feed-connection-status connected">
                                                    <i className="bi bi-circle-fill"></i>
                                                </span>
                                            )}
                                            {!isConnected && (
                                                <span className="camera-feed-connection-status disconnected">
                                                    <i className="bi bi-circle"></i>
                                                </span>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            eventKey="history"
                                            className="camera-feed-nav-link"
                                        >
                                            <i className="bi bi-clock-history"></i>
                                            History
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>

                            <Tab.Content className="camera-feed-tab-content">
                                <Tab.Pane
                                    eventKey="realtime"
                                    className="camera-feed-tab-pane"
                                >
                                    <div className="camera-feed-realtime-content">
                                        {/* Camera Feed Section */}
                                        <div className="camera-feed-frame-container">
                                            <div className="camera-feed-frame-main">
                                                <div className="camera-feed-frame-box">
                                                    <img
                                                        src={
                                                            liveFrame?.frame_link ||
                                                            DUMMY_FRAME
                                                        }
                                                        alt="Live Camera Feed"
                                                        className="camera-feed-frame-img"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                DUMMY_FRAME;
                                                        }}
                                                    />
                                                    <div className="camera-feed-frame-overlay">
                                                        <span
                                                            className={`camera-feed-live-indicator ${
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
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Sidebar */}
                                            <div className="camera-feed-frame-sidebar">
                                                {/* Camera Information */}
                                                <div className="camera-feed-info">
                                                    <div className="camera-feed-info-header">
                                                        <h6>
                                                            <i className="bi bi-camera-video-fill"></i>
                                                            Camera Details
                                                        </h6>
                                                    </div>
                                                    <div className="camera-feed-info-stack">
                                                        <div className="camera-feed-info-item">
                                                            <div className="camera-feed-info-label">
                                                                <i className="bi bi-building"></i>
                                                                Floor
                                                            </div>
                                                            <div className="camera-feed-info-value floor">
                                                                {camera.floor_name ||
                                                                    "Unknown"}
                                                            </div>
                                                        </div>
                                                        <div className="camera-feed-info-item">
                                                            <div className="camera-feed-info-label">
                                                                <i className="bi bi-geo-alt"></i>
                                                                Zone
                                                            </div>
                                                            <div className="camera-feed-info-value zone">
                                                                {camera.zone_name ||
                                                                    "Unknown"}
                                                            </div>
                                                        </div>
                                                        <div className="camera-feed-info-item">
                                                            <div className="camera-feed-info-label">
                                                                <i className="bi bi-geo-alt-fill"></i>
                                                                X
                                                            </div>
                                                            <div className="camera-feed-info-value coordinate">
                                                                {camera.coordinates
                                                                    ? Math.floor(
                                                                          camera
                                                                              .coordinates
                                                                              .x
                                                                      )
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                        <div className="camera-feed-info-item">
                                                            <div className="camera-feed-info-label">
                                                                <i className="bi bi-geo-alt-fill"></i>
                                                                Y
                                                            </div>
                                                            <div className="camera-feed-info-value coordinate">
                                                                {camera.coordinates
                                                                    ? Math.floor(
                                                                          camera
                                                                              .coordinates
                                                                              .y
                                                                      )
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                        <div className="camera-feed-info-item">
                                                            <div className="camera-feed-info-label">
                                                                <i className="bi bi-clock"></i>
                                                                Last Update
                                                            </div>
                                                            <div className="camera-feed-info-value time">
                                                                {lastUpdate
                                                                    ? lastUpdate.toLocaleTimeString()
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Information */}
                                                <div className="camera-feed-status-info">
                                                    <div className="camera-feed-info-header">
                                                        <h6>
                                                            <i className="bi bi-activity"></i>
                                                            Status
                                                        </h6>
                                                    </div>
                                                    <div className="camera-feed-status-items">
                                                        <div className="camera-feed-status-item">
                                                            <span className="camera-feed-status-label">
                                                                Connection
                                                            </span>
                                                            <span
                                                                className={`camera-feed-status-value ${
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
                                                        <div className="camera-feed-status-item">
                                                            <span className="camera-feed-status-label">
                                                                Camera Status
                                                            </span>
                                                            <span
                                                                className={`camera-feed-status-value ${
                                                                    camera.working
                                                                        ? "working"
                                                                        : "offline"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`bi ${
                                                                        camera.working
                                                                            ? "bi-check-circle-fill"
                                                                            : "bi-x-circle-fill"
                                                                    }`}
                                                                ></i>
                                                                {camera.working
                                                                    ? "Working"
                                                                    : "Offline"}
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
                                    className="camera-feed-tab-pane"
                                >
                                    <div className="camera-feed-history-content">
                                        <div className="camera-feed-video-generator">
                                            <div className="camera-feed-video-form">
                                                <h5>
                                                    <i className="bi bi-film"></i>
                                                    Generate Camera Video
                                                </h5>
                                                <p className="text-muted">
                                                    Select a time range to
                                                    generate a video from camera
                                                    frames.
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
                                                    className="camera-feed-generate-btn"
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
                                                <div className="camera-feed-video-player">
                                                    <h5>
                                                        <i className="bi bi-play-btn"></i>
                                                        Generated Video
                                                    </h5>
                                                    <div className="camera-feed-video-container-player">
                                                        <video
                                                            controls
                                                            width="100%"
                                                            height="auto"
                                                            className="camera-feed-video"
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
                                                    <div className="camera-feed-video-actions">
                                                        <Button
                                                            variant="success"
                                                            onClick={() => {
                                                                const link =
                                                                    document.createElement(
                                                                        "a"
                                                                    );
                                                                link.href =
                                                                    videoUrl;
                                                                link.download = `camera_${camera_id}_video.mp4`;
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

            {/* Loading Overlay */}
            {loading && (
                <div className="camera-feed-loading-overlay">
                    <div className="camera-feed-loading-content">
                        <Spinner animation="border" variant="primary" />
                        <span>Loading camera details...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="camera-feed-error-state">
                    <div className="camera-feed-error-content">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <h3>Error Loading Camera</h3>
                        <p>{error}</p>
                        <Button
                            variant="primary"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraFeed;
