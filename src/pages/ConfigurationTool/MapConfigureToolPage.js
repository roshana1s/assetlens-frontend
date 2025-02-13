import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import AddZone from "../../components/AddZone/AddZone";
import DrawMap from "../../components/DrawMap/DrawMap";

const MapConfigureToolPage = () => {
    const [zones, setZones] = useState([]);
    const [zoneName, setZoneName] = useState("");
    const [zoneColor, setZoneColor] = useState("#000000");
    const [coordinates, setCoordinates] = useState([]);
    const [x, setX] = useState("");
    const [y, setY] = useState("");

    const handleAddCoordinate = () => {
        setCoordinates([...coordinates, [parseFloat(x), parseFloat(y)]]);
        setX("");
        setY("");
    };

    const handleAddZone = () => {
        setZones([...zones, { name: zoneName, color: zoneColor, coordinates }]);
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

    return (
        <div style={{ display: "flex" }}>
            <div style={{ width: "30%" }}>
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
            </div>
            <DrawMap zones={zones} />
        </div>
    );
};

export default MapConfigureToolPage;
