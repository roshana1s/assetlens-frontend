import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import AddZone from "../../../components/AddZone/AddZone";
import DrawMap from "../../../components/DrawMap/DrawMap";
import axios from "axios";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddFloor.css";
import { useAuth } from "../../../context/AuthContext";

const AddFloor = () => {
    const { user } = useAuth();
    const [zoneName, setZoneName] = useState("");
    const [zoneColor, setZoneColor] = useState("#000000");
    const [coordinates, setCoordinates] = useState([]);
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [newFloorName, setNewFloorName] = useState("");
    const [newZones, setNewZones] = useState([]);
    const [selectedZoneIndex, setSelectedZoneIndex] = useState(null); // Track selected zone for editing
    const [showZoneModal, setShowZoneModal] = useState(false); // Modal visibility for Add/Edit Zone

    const handleAddCoordinate = () => {
        if (!x || !y) {
            toast.error("X and Y coordinates are required.");
            return;
        }
        setCoordinates([...coordinates, [parseFloat(x), parseFloat(y)]]);
        setX("");
        setY("");
        toast.success("Coordinate added successfully!");
    };

    const handleAddZone = () => {
        if (!zoneName.trim()) {
            toast.error("Zone name cannot be empty.");
            return;
        }

        if (coordinates.length < 3) {
            toast.error("A zone must have at least 3 coordinate pairs.");
            return;
        }

        const newZone = { name: zoneName, color: zoneColor, coordinates };

        if (selectedZoneIndex !== null) {
            // Edit existing zone
            const updatedZones = [...newZones];
            updatedZones[selectedZoneIndex] = newZone;
            setNewZones(updatedZones);
            setSelectedZoneIndex(null); // Clear selection after editing
            toast.success("Zone updated successfully!");
        } else {
            // Add new zone
            setNewZones([...newZones, newZone]);
            toast.success("Zone added successfully!");
        }

        // Reset inputs
        handleReset();
        setShowZoneModal(false); // Close modal
    };

    const handleReset = () => {
        setZoneName("");
        setZoneColor("#000000");
        setCoordinates([]);
        setSelectedZoneIndex(null); // Clear selection
    };

    const handleCloseModal = () => {
        handleReset(); // Clear data when modal is closed
        setShowZoneModal(false);
    };

    const onRemoveCoordinate = (index) => {
        setCoordinates(coordinates.filter((_, i) => i !== index));
        toast.info("Coordinate removed.");
    };

    const handleCreateNewFloor = async () => {
        if (!newFloorName.trim()) {
            toast.error("Floor name cannot be empty.");
            return;
        }

        const newFloor = {
            floorName: newFloorName,
            zones: newZones,
        };

        try {
            if (!user || !user.org_id) return;
            const response = await axios.post(
                `http://localhost:8000/maps/${user.org_id}/save-floor`,
                newFloor
            );
            console.log(response.data);
            toast.success("Floor added successfully!");
        } catch (err) {
            if (err.response && err.response.status === 400) {
                toast.error(
                    "A zone with the same name already exists. Please use a different name."
                );
            } else {
                toast.error("An error occurred while saving the floor.");
                console.log(err.message);
            }
        }

        setNewFloorName("");
        setNewZones([]);

        setTimeout(() => {
            window.location.href = "/admin/config/map"; // Redirect to map configuration page
        }, 1500);
    };

    const handleEditZone = (index) => {
        const zoneToEdit = newZones[index];
        setZoneName(zoneToEdit.name);
        setZoneColor(zoneToEdit.color);
        setCoordinates(zoneToEdit.coordinates);
        setSelectedZoneIndex(index); // Set the selected zone index for editing
        setShowZoneModal(true); // Open modal for editing
    };

    const handleDeleteZone = (index) => {
        setNewZones(newZones.filter((_, i) => i !== index));
        if (selectedZoneIndex === index) {
            handleReset(); // Reset inputs if the selected zone is deleted
        }
        toast.success("Zone deleted successfully!");
    };

    return (
        <div style={{ display: "flex" }}>
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Left Panel */}
            <div className="floor-details-panel">
                {/* Header (static) */}
                <span className="header-text">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-map"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
                        />
                    </svg>
                    <span className="ms-2">Map Configuration - Add Floor</span>
                </span>

                {/* Scrollable Content */}
                <div className="scrollable-content">
                    <Card className="mb-4 floor-card">
                        <Card.Body>
                            <Card.Title className="floor-card-title">
                                Floor Details
                            </Card.Title>
                            <Form.Control
                                type="text"
                                value={newFloorName}
                                onChange={(e) =>
                                    setNewFloorName(e.target.value)
                                }
                                placeholder="Enter Floor Name"
                                className="mb-3 floor-input"
                            />
                        </Card.Body>
                    </Card>

                    <Card className="floor-card">
                        <Card.Body>
                            <Card.Title className="floor-card-title">
                                Zones
                            </Card.Title>
                            <Accordion>
                                {newZones.map((zone, index) => (
                                    <Accordion.Item
                                        eventKey={index.toString()}
                                        key={index}
                                    >
                                        <Accordion.Header>
                                            {zone.name}
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <p>
                                                <strong>Color:</strong>
                                                <span
                                                    className="zone-color-box"
                                                    style={{
                                                        backgroundColor:
                                                            zone.color,
                                                    }}
                                                ></span>
                                            </p>
                                            <p>
                                                <strong>Coordinates:</strong>
                                            </p>
                                            <ul className="zone-coordinates-list">
                                                {zone.coordinates.map(
                                                    (coord, i) => (
                                                        <li key={i}>
                                                            {coord[0]},{" "}
                                                            {coord[1]}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    handleEditZone(index)
                                                }
                                                className="me-2 zone-edit-btn"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    handleDeleteZone(index)
                                                }
                                                className="zone-delete-btn"
                                            >
                                                Delete
                                            </Button>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                            <Button
                                variant="info"
                                className="mt-3 w-100 add-zone-btn"
                                onClick={() => setShowZoneModal(true)}
                            >
                                Add New Zone
                            </Button>
                        </Card.Body>
                    </Card>
                </div>

                {/* Buttons (static) */}
                <div className="floor-action-buttons">
                    <Button
                        variant="success"
                        onClick={handleCreateNewFloor}
                        className="create-floor-btn"
                    >
                        Create Floor
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.location.href="/admin/config/map"}
                        className="cancel-btn"
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            <DrawMap zones={newZones} />

            {/* Add/Edit Zone Modal */}
            <Modal show={showZoneModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedZoneIndex !== null
                            ? "Edit Zone"
                            : "Add New Zone"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddZone
                        onAddCoordinate={handleAddCoordinate}
                        onAddZone={handleAddZone}
                        onReset={handleReset}
                        onRemoveCoordinate={onRemoveCoordinate}
                        coordinates={coordinates}
                        zoneName={zoneName}
                        setZoneName={setZoneName}
                        zoneColor={zoneColor}
                        setZoneColor={setZoneColor}
                        x={x}
                        setX={setX}
                        y={y}
                        setY={setY}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AddFloor;
