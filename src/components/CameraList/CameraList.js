import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./CameraList.css";

const CameraList = () => {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCameras();
    }, [user]);

    const fetchCameras = async () => {
        if (!user?.org_id) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            console.log("Fetching cameras for org_id:", user.org_id); // Debug log

            const response = await axios.get(
                `http://localhost:8000/cameras/${user.org_id}/get-all-cameras`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("Camera API Response:", response.data); // Debug log
            setCameras(response.data || []);
        } catch (error) {
            console.error("Error fetching cameras:", error);
            setError("Failed to load cameras. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCameraClick = (cameraId) => {
        const route =
            user.role === "Super Admin" || user.role === "Admin"
                ? `/admin/camera/${cameraId}`
                : `/user/camera/${cameraId}`;
        navigate(route);
    };

    // Filter cameras based on search term and selected floor
    const filteredCameras = cameras.filter((camera) => {
        const matchesSearch =
            camera.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            camera.floor_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            camera.zone_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFloor =
            selectedFloor === "" || camera.floor_name === selectedFloor;

        return matchesSearch && matchesFloor;
    });

    // Get unique floor names for the filter dropdown
    const uniqueFloors = [
        ...new Set(cameras.map((camera) => camera.floor_name)),
    ];

    if (loading) {
        return (
            <div className="camera-list-container">
                <div className="camera-list-header">
                    <h2>Camera Management</h2>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading cameras...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="camera-list-container">
                <div className="camera-list-header">
                    <h2>Camera Management</h2>
                </div>
                <div className="error-container">
                    <div className="error-icon">
                        <svg
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                        </svg>
                    </div>
                    <p>{error}</p>
                    <button onClick={fetchCameras} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="camera-list-container">
            <div className="camera-list-header">
                <h2>Camera Management</h2>
                <div className="camera-controls">
                    <div className="camera-search">
                        <div className="search-input-container">
                            <svg
                                className="search-icon"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search cameras by ID, floor, or zone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                    <div className="floor-filter">
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="floor-select"
                        >
                            <option value="">All Floors</option>
                            {uniqueFloors.map((floor) => (
                                <option key={floor} value={floor}>
                                    {floor}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="camera-count">
                        <span className="count-number">
                            {filteredCameras.length}
                        </span>
                        <span className="count-label">Cameras</span>
                    </div>
                </div>
            </div>

            {filteredCameras.length === 0 ? (
                <div className="no-cameras">
                    <div className="no-cameras-icon">
                        <svg
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z" />
                        </svg>
                    </div>
                    <h3>No cameras found</h3>
                    <p>
                        {searchTerm || selectedFloor
                            ? "No cameras match your current search criteria."
                            : "No cameras are currently configured for this organization."}
                    </p>
                </div>
            ) : (
                <div className="camera-list">
                    {filteredCameras.map((camera) => (
                        <div
                            key={camera.camera_id}
                            className="camera-row"
                            onClick={() => handleCameraClick(camera.camera_id)}
                        >
                            <div className="camera-icon">
                                <svg
                                    width="32"
                                    height="32"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                    className={
                                        camera.working ? "working" : "offline"
                                    }
                                >
                                    <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z" />
                                </svg>
                            </div>
                            <div className="camera-info">
                                <h3 className="camera-id">
                                    {camera.camera_id}
                                </h3>
                                <div className="camera-details">
                                    <div className="camera-location">
                                        <svg
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                                        </svg>
                                        <span>
                                            {camera.floor_name} -{" "}
                                            {camera.zone_name}
                                        </span>
                                    </div>
                                    <div
                                        className={`camera-status ${
                                            camera.working
                                                ? "working"
                                                : "offline"
                                        }`}
                                    >
                                        <div className="status-indicator"></div>
                                        <span>
                                            {camera.working
                                                ? "Working"
                                                : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="camera-actions">
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CameraList;
