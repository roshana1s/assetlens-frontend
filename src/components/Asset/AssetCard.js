import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AssetCard.css";
import {
    FaEdit,
    FaTrash,
    FaMapMarkerAlt,
    FaWifi,
    FaTimes,
    FaCheckCircle,
    FaExclamationCircle,
    FaEye,
} from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import DeleteSuccessPopup from "./DeleteSuccessPopup";
import EditAssetForm from "./EditAssetForm";
import { useAuth } from "../../context/AuthContext";

const AssetCard = ({
    asset,
    onGeofencingUpdate,
    refreshAssets,
    onEditAsset,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [geofencing, setGeofencing] = useState(asset.geofencing);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = async () => {
        const newStatus = !geofencing;
        setGeofencing(newStatus);
        try {
            if (!user || !user.org_id) return;
            await axios.put(
                `http://localhost:8000/assets/${user.org_id}/${asset.asset_id}`,
                {
                    geofencing: newStatus,
                }
            );
            onGeofencingUpdate(asset.asset_id, newStatus);
        } catch (error) {
            console.error("Error updating geofencing:", error);
            setGeofencing(!newStatus);
        }
    };

    const handleDelete = () => {
        setConfirmationInput("");
        setShowConfirmPopup(true);
    };
    const handleEdit = () => {
        if (onEditAsset) {
            onEditAsset(asset);
        } else {
            setShowEditForm(true);
        }
    };

    const handleViewDetails = () => {
        // Check if user role determines the route
        const isUser = user?.role && user.role.toLowerCase() === "user";
        const basePath = isUser ? "user" : "admin";
        navigate(`/${basePath}/asset/${asset.asset_id}`);
    };

    const closeEditForm = () => setShowEditForm(false);

    const confirmDelete = async () => {
        if (confirmationInput !== asset.name) {
            toast.error("Asset name doesn't match!");
            return;
        }

        setIsDeleting(true);
        try {
            if (!user || !user.org_id) return;
            await axios.delete(
                `http://localhost:8000/assets/${user.org_id}/${asset.asset_id}`
            );
            setShowConfirmPopup(false);
            setShowSuccessPopup(true);
            toast.success("Asset deleted successfully!");
        } catch (error) {
            console.error("Deletion failed", error);
            toast.error("Failed to delete asset");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessPopup(false);
        refreshAssets();
    };

    const handleEditSuccess = () => {
        closeEditForm();
        refreshAssets();
    };

    // Helper function to determine availability status
    const getAvailabilityStatus = () => {
        return asset.assigned_to && asset.assigned_to.length > 0
            ? "assigned"
            : "available";
    };

    const availabilityStatus = getAvailabilityStatus();

    return (
        <>
            <div className="asset-card">
                <div className="asset-left">
                    <div className="asset-avatar-container">
                        <img
                            className="asset-avatar"
                            src={asset.image_link}
                            alt={asset.name}
                        />
                    </div>
                    <div className="asset-info">
                        <h3>{asset.name}</h3>
                        <p>
                            {asset.category?.name ||
                                asset.category?.category_name}
                        </p>

                        {/* Status Indicators */}
                        <div className="asset-status-indicators">
                            {/* Availability Status */}
                            <span
                                className={`asset-config-status-${availabilityStatus}`}
                            >
                                {availabilityStatus === "available" ? (
                                    <>
                                        <FaCheckCircle
                                            style={{ marginRight: "4px" }}
                                        />
                                        Available
                                    </>
                                ) : (
                                    <>
                                        <FaExclamationCircle
                                            style={{ marginRight: "4px" }}
                                        />
                                        Assigned
                                    </>
                                )}
                            </span>

                            {/* Geofencing Status */}
                            <span
                                className={`asset-config-status-geofenced ${
                                    geofencing ? "enabled" : "disabled"
                                }`}
                            >
                                {geofencing ? (
                                    <>
                                        <FaMapMarkerAlt
                                            style={{ marginRight: "4px" }}
                                        />
                                        Geofenced
                                    </>
                                ) : (
                                    <>
                                        <FaTimes
                                            style={{ marginRight: "4px" }}
                                        />
                                        No Geofence
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="asset-right">
                    <div className="asset-status-controls">
                        {/* Geofencing Toggle with Label */}
                        <div className="geofencing-control">
                            <label className="geofencing-toggle-label">
                                Geofencing:
                            </label>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={geofencing}
                                    onChange={handleToggle}
                                />
                                <span className="slider"></span>
                            </label>
                            <span className="geofencing-status">
                                {geofencing ? "On" : "Off"}
                            </span>
                        </div>
                    </div>

                    <div className="asset-actions">
                        <button
                            className="user-config-action-btn user-config-view-btn"
                            onClick={handleViewDetails}
                        >
                            <FaEye style={{ marginRight: "4px" }} />
                            View Details
                        </button>
                        <button
                            className="user-config-action-btn user-config-edit-btn"
                            onClick={handleEdit}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-pencil-square"
                                viewBox="0 0 16 16"
                                style={{ marginRight: "4px" }}
                            >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path
                                    fillRule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                />
                            </svg>
                            Edit
                        </button>
                        <button
                            className="user-config-action-btn user-config-delete-btn"
                            onClick={handleDelete}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-trash3"
                                viewBox="0 0 16 16"
                                style={{ marginRight: "4px" }}
                            >
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Bootstrap Modal */}
            <Modal
                show={showConfirmPopup}
                onHide={() => setShowConfirmPopup(false)}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaTrash
                            style={{ marginRight: "8px", color: "#dc3545" }}
                        />
                        Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <p className="mb-3">
                            Are you sure you want to delete the asset{" "}
                            <strong>"{asset.name}"</strong>?
                        </p>
                        <p className="text-muted mb-3">
                            Type <strong>"{asset.name}"</strong> below to
                            confirm deletion:
                        </p>
                        <Form.Control
                            type="text"
                            placeholder={`Enter "${asset.name}" to confirm`}
                            value={confirmationInput}
                            onChange={(e) =>
                                setConfirmationInput(e.target.value)
                            }
                            className="text-center"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowConfirmPopup(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={
                            confirmationInput !== asset.name || isDeleting
                        }
                    >
                        {isDeleting ? "Deleting..." : "Delete Asset"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Bootstrap Modal */}
            <Modal
                show={showSuccessPopup}
                onHide={handleSuccessClose}
                centered
                size="sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaCheckCircle
                            style={{ marginRight: "8px", color: "#28a745" }}
                        />
                        Success
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p className="mb-0">Asset deleted successfully!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleSuccessClose}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AssetCard;
