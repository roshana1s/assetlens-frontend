import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import AddZone from "../../components/AddZone/AddZone";
import DrawMap from "../../components/DrawMap/DrawMap";
import axios from "axios";

const MapConfiguration = () => {
    const [zoneName, setZoneName] = useState("");
    const [zoneColor, setZoneColor] = useState("#000000");
    const [coordinates, setCoordinates] = useState([]);
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const [mapDetails, setMapDetails] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [expandedFloors, setExpandedFloors] = useState({});

    const [newFloor, setNewFloor] = useState({});
    const [newFloorName, setNewFloorName] = useState("");
    const [newZones, setNewZones] = useState([]);

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
        const newZone = { name: zoneName, color: zoneColor, coordinates };
        const updatedMapDetails = [...mapDetails];
        const floorIndex = updatedMapDetails.findIndex(
            (floor) => floor.floorName === selectedFloor
        );
        if (floorIndex !== -1) {
            updatedMapDetails[floorIndex].zones.push(newZone);
            setMapDetails(updatedMapDetails);
        }
        setZoneName("");
        setZoneColor("#000000");
        setCoordinates([]);
    };

    const handleReset = () => {
        setZoneName("");
        setZoneColor("#000000");
        setCoordinates([]);
    };

    const onRemoveCoordinate = (index) => {
        setCoordinates(coordinates.filter((_, i) => i !== index));
    };

    const handleCreateNewFloor = () => {
        if (!newFloorName.trim()) {
            alert("Floor name cannot be empty.");
            return;
        }
        if (mapDetails.some((floor) => floor.floorName === newFloorName)) {
            alert("This floor already exists.");
            return;
        }

        const newFloor = {
            floorName: newFloorName,
            zones: [],
        };

        setMapDetails([...mapDetails, newFloor]);
        setNewFloorName("");
        setSelectedFloor(newFloorName);
    };

    const handleToggleFloor = (floorName) => {
        setExpandedFloors({
            ...expandedFloors,
            [floorName]: !expandedFloors[floorName],
        });
        setSelectedFloor(floorName);
    };

    const handleDeleteZone = (floorName, zoneIndex) => {
        const updatedMapDetails = [...mapDetails];
        const floorIndex = updatedMapDetails.findIndex(
            (floor) => floor.floorName === floorName
        );
        if (floorIndex !== -1) {
            updatedMapDetails[floorIndex].zones = updatedMapDetails[
                floorIndex
            ].zones.filter((_, index) => index !== zoneIndex);
            setMapDetails(updatedMapDetails);
        }
    };

    const handleSave = async (org_id) => {
        try {
            console.log(mapDetails);
            // await axios.post(
            //     `http://localhost:8000/maps/${org_id}/save-floor`,
            //     mapDetails
            // );
            alert("Map saved successfully.");
        } catch (err) {
            console.log("Error:", err.message);
        }
    };

    useEffect(() => {
        const fetchData = async (org_id) => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/maps/${org_id}/get-map`
                );
                console.log(response.data);
                setMapDetails(response.data);
            } catch (err) {
                console.log(err.message);
            }
        };

        fetchData(1); // Pass the organization ID (e.g., 1)
    }, []);

    return (
        <div style={{ display: "flex" }}>
            <div style={{ width: "30%", padding: "10px" }}>
                <h3>Floors</h3>
                <ul>
                    {mapDetails.map((floor, index) => (
                        <li key={index}>
                            <div
                                onClick={() =>
                                    handleToggleFloor(floor.floorName)
                                }
                                style={{
                                    cursor: "pointer",
                                    fontWeight: selectedFloor
                                        ? selectedFloor === floor.floorName
                                            ? "bold"
                                            : "normal"
                                        : index === 0
                                        ? "bold"
                                        : "normal",
                                }}
                            >
                                {floor.floorName}
                            </div>
                            {expandedFloors[floor.floorName] && (
                                <ul>
                                    {floor.zones.map((zone, zoneIndex) => (
                                        <li key={zoneIndex}>
                                            {zone.name}
                                            <button
                                                onClick={() =>
                                                    handleDeleteZone(
                                                        floor.floorName,
                                                        zoneIndex
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                    <li>
                                        <button
                                            onClick={() =>
                                                setSelectedFloor(
                                                    floor.floorName
                                                )
                                            }
                                        >
                                            + New Zone
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                {selectedFloor && expandedFloors[selectedFloor] && (
                    <>
                        <h3>Add Zone to {selectedFloor}</h3>
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
                    </>
                )}
                <h3>Create New Floor</h3>
                <input
                    type="text"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    placeholder="New Floor Name"
                />
                {newZones.map((zone, index) => (
                    <div key={index}>
                        <h3>{zone.name}</h3>
                        <p>{zone.color}</p>
                        <p>Coordinates:</p>
                        <ul>
                            {zone.coordinates.map((coord, index) => (
                                <li key={index}>
                                    {coord[0]}, {coord[1]}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <h3>Add Zones: </h3>
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
                <button onClick={handleCreateNewFloor}>Create Floor</button>
                <button onClick={() => handleSave(1)}>Save Changes</button>
            </div>
            <DrawMap
                zones={
                    selectedFloor
                        ? mapDetails.find(
                              (floor) => floor.floorName === selectedFloor
                          )?.zones || []
                        : mapDetails[0]?.zones || []
                }
            />
        </div>
    );
};

export default MapConfiguration;
