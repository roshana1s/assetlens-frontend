import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import DrawMap from "../../../components/DrawMap/DrawMap";
import AddZone from "../../../components/AddZone/AddZone";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const EditFloor = () => {
    const { floor_id } = useParams(); // Get floor_id from the URL
    const [floorName, setFloorName] = useState("");
    const [zones, setZones] = useState([]);
    const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [zoneName, setZoneName] = useState("");
    const [zoneColor, setZoneColor] = useState("#000000");
    const [coordinates, setCoordinates] = useState([]);
    const [x, setX] = useState("");
    const [y, setY] = useState("");

    useEffect(() => {
        // Fetch floor details using floor_id
        const fetchFloorDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/maps/1/get-floor/${floor_id}`
                );
                const data = response.data;
                setFloorName(data.floorName);
                setZones(data.zones);
            } catch (err) {
                console.error("Error fetching floor details:", err.message);
            }
        };

        fetchFloorDetails();
    }, [floor_id]);

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
            const updatedZones = [...zones];
            updatedZones[selectedZoneIndex] = newZone;
            setZones(updatedZones);
            setSelectedZoneIndex(null); // Clear selection after editing
        } else {
            // Add new zone
            setZones([...zones, newZone]);
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

    const handleEditZone = (index) => {
        const zoneToEdit = zones[index];
        setZoneName(zoneToEdit.name);
        setZoneColor(zoneToEdit.color);
        setCoordinates(zoneToEdit.coordinates);
        setSelectedZoneIndex(index); // Set the selected zone index for editing
        setShowZoneModal(true); // Open modal for editing
    };

    const handleDeleteZone = (index) => {
        setZones(zones.filter((_, i) => i !== index));
        if (selectedZoneIndex === index) {
            handleReset(); // Reset inputs if the selected zone is deleted
        }
    };

    const handleSaveFloor = async () => {
        if (!floorName.trim()) {
            alert("Floor name cannot be empty.");
            return;
        }

        const updatedFloor = {
            floorName,
            zones,
        };

        try {
            const response = await axios.put(
                `http://localhost:8000/maps/1/update-floor/${floor_id}`,
                updatedFloor
            );
            console.log("Floor updated successfully:");
            alert("Floor updated successfully!");
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert(
                    "A zone with the same name already exists. Please use a different name."
                );
            } else {
                console.log(err.message);
            }
        }

        window.location.href = "/admin/mapconfig"; // Redirect to map configuration page
    };

    return (
        <div style={{ display: "flex" }}>
            {/* Left Panel */}
            <div style={{ width: "30%" }}>
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Edit Floor</Card.Title>
                        <Form.Control
                            type="text"
                            value={floorName}
                            onChange={(e) => setFloorName(e.target.value)}
                            placeholder="Enter Floor Name"
                            className="mb-3"
                        />
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body>
                        <Card.Title>Zones</Card.Title>
                        <Accordion>
                            {zones.map((zone, index) => (
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
                        onClick={handleSaveFloor}
                        className="me-2 w-50"
                    >
                        Save Floor
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.history.back()}
                        className="w-50"
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            <DrawMap zones={zones} />

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
                        onRemoveCoordinate={(index) =>
                            setCoordinates(
                                coordinates.filter((_, i) => i !== index)
                            )
                        }
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

export default EditFloor;
