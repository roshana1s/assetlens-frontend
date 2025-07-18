import React, { useEffect, useState } from "react";
import Combobox from "react-widgets/Combobox";
import axios from "axios";
import DrawMapWithCam from "../../components/DrawMapWithCam/DrawMapWithCam";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CameraConfiguration.css";
import { useAuth } from "../../context/AuthContext";

const CameraConfiguration = () => {
    const { user } = useAuth();
    const [floors, setFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [zones, setZones] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalZone, setModalZone] = useState(null);
    const [camX, setCamX] = useState("");
    const [camY, setCamY] = useState("");

    // Fetch floors and zones
    useEffect(() => {
        const fetchFloors = async () => {
            if (!user?.org_id) return;
            const res = await axios.get(
                `http://localhost:8000/maps/${user.org_id}/get-map`
            );
            setFloors(res.data);
        };
        fetchFloors();
    }, []);

    useEffect(() => {
        if (!selectedFloor) return;
        if (!user?.org_id) return;
        const floor = floors.find((f) => f.floor_id === selectedFloor);
        setZones(floor?.zones || []);
        // Fetch cameras for this floor
        axios
            .get(
                `http://localhost:8000/cameras/${user.org_id}/get-cameras/${selectedFloor}`
            )
            .then((res) => setCameras(res.data.cameras || []))
            .catch(() => setCameras([]));
    }, [selectedFloor, floors]);

    // Add or edit camera
    const handleAddCamera = (zone_id) => {
        setModalZone(zone_id);
        setShowModal(true);
        setCamX("");
        setCamY("");
    };

    // Point-in-polygon utility (ray-casting algorithm)
    function isPointInPolygon(point, polygon) {
        let [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i][0],
                yi = polygon[i][1];
            let xj = polygon[j][0],
                yj = polygon[j][1];
            let intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    const handleSaveCamera = async () => {
        if (!camX || !camY) {
            toast.error("Please enter X and Y coordinates.");
            return;
        }
        const zone = zones.find((z) => z.zone_id === modalZone);
        if (!zone) {
            toast.error("Zone not found.");
            return;
        }
        const point = [parseFloat(camX), parseFloat(camY)];
        if (!isPointInPolygon(point, zone.coordinates)) {
            toast.error("Camera must be inside the zone polygon!");
            return;
        }
        const newCameras = cameras.filter((c) => c.zone_id !== modalZone);
        newCameras.push({
            zone_id: modalZone,
            cam_coordinates: {
                x: parseFloat(point[0]),
                y: parseFloat(point[1]),
            },
            working: true,
        });
        setCameras(newCameras);

        console.log("Saving cameras:", newCameras);
        if (!user?.org_id) return;
        await axios.post(
            `http://localhost:8000/cameras/${user.org_id}/set-cameras/${selectedFloor}`,
            { cameras: newCameras }
        );

        setShowModal(false);
        toast.success("Camera added/updated!");
    };

    const handleRemoveCamera = async (zone_id) => {
        const updatedCameras = cameras.filter((c) => c.zone_id !== zone_id);
        setCameras(updatedCameras);
        if (!user?.org_id) return;
        await axios.post(
            `http://localhost:8000/cameras/${user.org_id}/set-cameras/${selectedFloor}`,
            { cameras: updatedCameras }
        );
        toast.info("Camera removed!");
    };

    const handleToggleCamera = async (zone_id) => {
        const updatedCameras = cameras.map((c) =>
            c.zone_id === zone_id ? { ...c, working: !c.working } : c
        );
        setCameras(updatedCameras);
        if (!user?.org_id) return;
        await axios.post(
            `http://localhost:8000/cameras/${user.org_id}/set-cameras/${selectedFloor}`,
            { cameras: updatedCameras }
        );
        const cam = updatedCameras.find((c) => c.zone_id === zone_id);
        toast.info(`Camera switched ${cam && cam.working ? "on" : "off"}!`);
    };

    return (
        <div style={{ display: "flex" }}>
            <ToastContainer position="top-right" autoClose={2000} />
            <div className="map-config-container">
                <span className="header-text">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-camera"
                        viewBox="0 0 16 16"
                    >
                        <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
                        <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
                    </svg>
                    <span className="ms-2">Camera Configuration</span>
                </span>
                <Combobox
                    placeholder="Select Floor"
                    id="floor-select"
                    data={floors.map((f) => f.floorName)}
                    onChange={(value) =>
                        setSelectedFloor(
                            floors.find((f) => f.floorName === value)?.floor_id
                        )
                    }
                    className="mb-3"
                />
                <ul className="camconfig-zone-list">
                    {zones.map((z) => {
                        const cam = cameras.find(
                            (c) => c.zone_id === z.zone_id
                        );
                        return (
                            <li
                                key={z.zone_id}
                                className="camconfig-zone-list-item"
                            >
                                <div className="camconfig-zone-info">
                                    <span className="camconfig-zone-name">
                                        {z.name}
                                    </span>
                                    {cam && (
                                        <span
                                            className={`camconfig-zone-status ${
                                                cam.working ? "on" : "off"
                                            }`}
                                        >
                                            {cam.working ? "● On" : "● Off"}
                                        </span>
                                    )}
                                </div>
                                {cam && (
                                    <div className="camconfig-zone-coords">
                                        <span>
                                            <b>X:</b> {cam.cam_coordinates.x},{" "}
                                            <b>Y:</b> {cam.cam_coordinates.y}
                                        </span>
                                    </div>
                                )}
                                <div className="camconfig-zone-actions">
                                    {cam ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant={
                                                    cam.working
                                                        ? "outline-success"
                                                        : "outline-secondary"
                                                }
                                                className="camconfig-zone-btn"
                                                onClick={() =>
                                                    handleToggleCamera(
                                                        z.zone_id
                                                    )
                                                }
                                            >
                                                {cam.working ? (
                                                    <>
                                                        
                                                        Switch Off
                                                    </>
                                                ) : (
                                                    <>
                                                        
                                                        Switch On
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                className="camconfig-zone-btn"
                                                onClick={() =>
                                                    handleRemoveCamera(
                                                        z.zone_id
                                                    )
                                                }
                                            >
                                                
                                                Remove
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="camconfig-zone-btn"
                                                onClick={() =>
                                                    handleAddCamera(z.zone_id)
                                                }
                                            >
                                                
                                                Change Position
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="camconfig-zone-btn"
                                            onClick={() =>
                                                handleAddCamera(z.zone_id)
                                            }
                                        >
                                            
                                            Add Camera
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <DrawMapWithCam zones={zones} cameras={cameras} />
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Set Camera Coordinates</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {(() => {
                        const zone = zones.find((z) => z.zone_id === modalZone);
                        if (!zone) return null;
                        return (
                            <div style={{ marginBottom: 10 }}>
                                <b>Zone:</b> {zone.name}
                                <br />
                                <b>Zone Coordinates:</b>
                                <ul
                                    style={{
                                        fontSize: "0.95em",
                                        marginBottom: 0,
                                    }}
                                >
                                    {zone.coordinates.map((c, idx) => (
                                        <li key={idx}>
                                            [{c[0]}, {c[1]}]
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}
                    <Form.Group className="mb-3">
                        <Form.Label>X Coordinate</Form.Label>
                        <Form.Control
                            type="number"
                            value={camX}
                            onChange={(e) => setCamX(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Y Coordinate</Form.Label>
                        <Form.Control
                            type="number"
                            value={camY}
                            onChange={(e) => setCamY(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveCamera}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CameraConfiguration;
