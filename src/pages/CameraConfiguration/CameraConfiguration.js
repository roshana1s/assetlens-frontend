import React, { useEffect, useState } from "react";
import axios from "axios";
import DrawMapWithCam from "../../components/DrawMapWithCam/DrawMapWithCam";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CAMERA_CORNERS = [
    { label: "Top Left", value: 0 },
    { label: "Top Right", value: 1 },
    { label: "Bottom Right", value: 2 },
    { label: "Bottom Left", value: 3 },
];

const CameraConfiguration = () => {
    const org_id = 1;
    const [floors, setFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [zones, setZones] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalZone, setModalZone] = useState(null);
    const [selectedCorner, setSelectedCorner] = useState(0);

    // Fetch floors and zones
    useEffect(() => {
        const fetchFloors = async () => {
            const res = await axios.get(`http://localhost:8000/maps/${org_id}/get-map`);
            setFloors(res.data);
            if (res.data.length > 0) setSelectedFloor(res.data[0].floor_id);
        };
        fetchFloors();
    }, []);

    useEffect(() => {
        if (!selectedFloor) return;
        const floor = floors.find(f => f.floor_id === selectedFloor);
        setZones(floor?.zones || []);
        // Fetch cameras for this floor
        axios.get(`http://localhost:8000/cameras/${selectedFloor}/get-cameras`)
            .then(res => setCameras(res.data.cameras || []))
            .catch(() => setCameras([]));
    }, [selectedFloor, floors]);

    // Add or edit camera
    const handleAddCamera = (zone_id) => {
        setModalZone(zone_id);
        setShowModal(true);
    };

    const handleSaveCamera = async () => {
        // Only one camera per zone
        const newCameras = cameras.filter(c => c.zone_id !== modalZone);
        newCameras.push({
            zone_id: modalZone,
            cam_position: selectedCorner,
            working: true,
        });
        setCameras(newCameras);
        setShowModal(false);
        toast.success("Camera added/updated!");
        // Save to backend (when ready)
        // await axios.post(...)
    };

    const handleRemoveCamera = (zone_id) => {
        setCameras(cameras.filter(c => c.zone_id !== zone_id));
        toast.info("Camera removed!");
        // Save to backend (when ready)
    };

    const handleToggleCamera = (zone_id) => {
        setCameras(cameras.map(c =>
            c.zone_id === zone_id ? { ...c, working: !c.working } : c
        ));
        // Save to backend (when ready)
    };

    return (
        <div style={{ display: "flex" }}>
            <ToastContainer position="top-right" autoClose={2000} />
            <div style={{ width: "25%", padding: 16 }}>
                <h5>Camera Configuration</h5>
                <Form.Select
                    value={selectedFloor || ""}
                    onChange={e => setSelectedFloor(Number(e.target.value))}
                    className="mb-3"
                >
                    {floors.map(f => (
                        <option key={f.floor_id} value={f.floor_id}>
                            {f.floorName}
                        </option>
                    ))}
                </Form.Select>
                <ul>
                    {zones.map(z => {
                        const cam = cameras.find(c => c.zone_id === z.zone_id);
                        return (
                            <li key={z.zone_id} style={{ marginBottom: 12 }}>
                                <b>{z.name}</b>
                                {cam ? (
                                    <>
                                        <span style={{ marginLeft: 8 }}>
                                            <span style={{ color: cam.working ? "green" : "red" }}>
                                                {cam.working ? "On" : "Off"}
                                            </span>
                                            {" | "}
                                            Corner: {CAMERA_CORNERS[cam.cam_position].label}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="warning"
                                            className="ms-2"
                                            onClick={() => handleToggleCamera(z.zone_id)}
                                        >
                                            {cam.working ? "Switch Off" : "Switch On"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            className="ms-2"
                                            onClick={() => handleRemoveCamera(z.zone_id)}
                                        >
                                            Remove
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="ms-2"
                                            onClick={() => handleAddCamera(z.zone_id)}
                                        >
                                            Change Corner
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="ms-2"
                                        onClick={() => handleAddCamera(z.zone_id)}
                                    >
                                        Add Camera
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <DrawMapWithCam
                zones={zones}
                cameras={cameras}
            />
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Camera Corner</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Select
                        value={selectedCorner}
                        onChange={e => setSelectedCorner(Number(e.target.value))}
                    >
                        {CAMERA_CORNERS.map(c =>
                            <option key={c.value} value={c.value}>{c.label}</option>
                        )}
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
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