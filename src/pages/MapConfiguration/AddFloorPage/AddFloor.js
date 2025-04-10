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

const AddFloor = () => {
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
            alert("X and Y coordinates are required.");
            return;
        }
        setCoordinates([...coordinates, [parseFloat(x), parseFloat(y)]]);
        setX("");
        setY("");
    };

    const handleAddZone = () => {
        if (!zoneName.trim()) {
            alert("Zone name cannot be empty.");
            return;
        }

        if (coordinates.length < 3) {
            alert("A zone must have at least 3 coordinate pairs.");
            return;
        }

        const newZone = { name: zoneName, color: zoneColor, coordinates };

        if (selectedZoneIndex !== null) {
            // Edit existing zone
            const updatedZones = [...newZones];
            updatedZones[selectedZoneIndex] = newZone;
            setNewZones(updatedZones);
            setSelectedZoneIndex(null); // Clear selection after editing
        } else {
            // Add new zone
            setNewZones([...newZones, newZone]);
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
    };

    const handleCreateNewFloor = async () => {
        if (!newFloorName.trim()) {
            alert("Floor name cannot be empty.");
            return;
        }

        const newFloor = {
            floorName: newFloorName,
            zones: newZones,
        };

        try {
            const response = await axios.post(
                `http://localhost:8000/maps/1/save-floor`, // Replace with your API endpoint
                newFloor
            );
            console.log(response.data);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert("A zone with the same name already exists. Please use a different name.");
            } else {
                console.log(err.message);
            }
        }

        setNewFloorName("");
        setNewZones([]);

        window.location.href = "/admin/config/map"; // Redirect to map configuration page
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
    };

    return (
        <div style={{ display: "flex" }}>
            {/* Left Panel */}
            <div style={{ width: "30%" }}>
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Floor Details</Card.Title>
                        <Form.Control
                            type="text"
                            value={newFloorName}
                            onChange={(e) => setNewFloorName(e.target.value)}
                            placeholder="Enter Floor Name"
                            className="mb-3"
                        />
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body>
                        <Card.Title>Zones</Card.Title>
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
                                            <strong>Color:</strong>{" "}
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: "20px",
                                                    height: "20px",
                                                    backgroundColor: zone.color,
                                                    border: "1px solid #000",
                                                }}
                                            ></span>
                                        </p>
                                        <p>
                                            <strong>Coordinates:</strong>
                                        </p>
                                        <ul>
                                            {zone.coordinates.map(
                                                (coord, i) => (
                                                    <li key={i}>
                                                        {coord[0]}, {coord[1]}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                handleEditZone(index)
                                            }
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                handleDeleteZone(index)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                        <Button
                            variant="info"
                            className="mt-3 w-100"
                            onClick={() => setShowZoneModal(true)}
                        >
                            Add New Zone
                        </Button>
                    </Card.Body>
                </Card>

                <div className="mt-4">
                    <Button
                        variant="success"
                        onClick={handleCreateNewFloor}
                        className="me-2 w-50"
                    >
                        Create Floor
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setNewFloorName("");
                            setNewZones([]);
                            window.location.href = "/admin/config/map";
                        }}
                        className="w-50"
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
