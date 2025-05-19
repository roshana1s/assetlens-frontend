import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import DrawMap from "../../components/DrawMap/DrawMap";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MapConfiguration.css";
import FetchingData from "../../components/FetchingData/FetchingData";

const MapConfiguration = () => {
    const org_id = 1;

    const [mapDetails, setMapDetails] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [show, setShow] = useState(false);
    const [floorToDelete, setFloorToDelete] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDeleteConfirm = async (org_id, floor_id) => {
        try {
            const response = await axios.delete(
                `http://localhost:8000/maps/${org_id}/delete-floor/${floor_id}`
            );
            console.log(response.data);
            setMapDetails((prev) =>
                prev.filter((floor) => floor.floor_id !== floor_id)
            );
            toast.success("Floor deleted successfully!");
        } catch (err) {
            console.error(err.message);
            toast.error("Failed to delete the floor. Please try again.");
        }
    };

    const handleDeleteFloor = (floor_id) => {
        setFloorToDelete(floor_id);
        setShow(true); // Show confirmation modal
    };

    useEffect(() => {
        if (mapDetails.length > 0 && !selectedFloor) {
            setSelectedFloor(mapDetails[0].floor_id);
        }
    }, [mapDetails, selectedFloor]);

    useEffect(() => {
        const fetchData = async (org_id) => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8000/maps/${org_id}/get-map`
                );
                console.log(response.data);
                setMapDetails(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err.message);
                toast.error("Failed to load map details. Please try again.");
                setLoading(false);
            }
        };

        fetchData(org_id); // Pass the organization ID (e.g., 1)
    }, []);

    return (
        <>
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ display: "flex" }}>
                <div className="map-config-container">
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
                        <span className="ms-2">Map Configuration</span>
                    </span>
                    {!loading ? (
                        <>
                            <span className="text-available">
                                Available Floors:{" "}
                            </span>
                            <ul className="map-floor-list">
                                {mapDetails.length === 0 ? (
                                    <li className="text-muted">
                                        No floors available
                                    </li>
                                ) : (
                                    mapDetails.map((floor, index) => (
                                        <li className="floor-item" key={index}>
                                            <div
                                                className={`floor-name ${
                                                    selectedFloor ===
                                                    floor.floor_id
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedFloor(
                                                        floor.floor_id
                                                    )
                                                }
                                            >
                                                {floor.floorName}
                                            </div>
                                            <div className="floor-actions">
                                                <a
                                                    href={`/admin/config/map/editfloor/${floor.floor_id}`}
                                                    className="text-primary"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="16"
                                                        height="16"
                                                        fill="currentColor"
                                                        className="bi bi-pencil-square"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                        />
                                                    </svg>
                                                </a>
                                                <i
                                                    title="Delete"
                                                    className="text-danger delete-icon"
                                                    onClick={() => {
                                                        handleDeleteFloor(
                                                            floor.floor_id
                                                        );
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill="currentColor"
                                                        className="bi bi-trash3"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                                    </svg>
                                                </i>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                            <a
                                className="add-floor-btn"
                                href={"/admin/config/map/addfloor"}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    className="bi bi-plus-circle"
                                    viewBox="0 0 16 16"
                                    style={{ marginRight: "8px" }}
                                >
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3H4a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                </svg>
                                Add New Floor
                            </a>
                        </>
                    ) : (
                        <FetchingData />
                    )}
                </div>
                <DrawMap
                    zones={
                        selectedFloor
                            ? mapDetails.find(
                                  (floor) => floor.floor_id === selectedFloor
                              )?.zones || []
                            : mapDetails[0]?.zones || []
                    }
                />
            </div>
            {floorToDelete && (
                <Modal
                    show={show}
                    onHide={() => setShow(false)}
                    size="lg" // Increase modal size
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Are you sure you want to delete{" "}
                            {
                                mapDetails.find(
                                    (floor) => floor.floor_id === floorToDelete
                                )?.floorName
                            }
                            ?
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        This action cannot be undone. Deleting{" "}
                        {
                            mapDetails.find(
                                (floor) => floor.floor_id === floorToDelete
                            )?.floorName
                        }{" "}
                        will permanently remove all associated data. Please
                        confirm if you wish to proceed.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShow(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                handleDeleteConfirm(org_id, floorToDelete);
                                setShow(false);
                            }}
                        >
                            Delete floor
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default MapConfiguration;
