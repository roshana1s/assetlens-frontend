import React, { useState, useRef, useEffect } from "react";
import {
    MapContainer,
    Polygon,
    Tooltip,
    Polyline,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ResetViewButton from "../../components/ResetViewButton/ResetViewButton";
import GridToggleButton from "../../components/GridToggleButton/GridToggleButton";
import AddZone from "../../components/AddZone/AddZone";

const MapConfigureToolPage = () => {
    const [gridSize, setGridSize] = useState({ width: 1000, height: 320 });
    const [showGrid, setShowGrid] = useState(true);
    const [zones, setZones] = useState([]);
    const [zoneName, setZoneName] = useState("");
    const [zoneColor, setZoneColor] = useState("#000000");
    const [coordinates, setCoordinates] = useState([]);
    const [x, setX] = useState("");
    const [y, setY] = useState("");
    const mapDivRef = useRef(null);

    const createGridLines = (width, height, step) => {
        const lines = [];
        for (let i = 0; i <= width; i += step) {
            lines.push([
                [i, -height],
                [i, height],
            ]);
            lines.push([
                [-i, -height],
                [-i, height],
            ]);
        }
        for (let i = 0; i <= height; i += step) {
            lines.push([
                [-width, i],
                [width, i],
            ]);
            lines.push([
                [-width, -i],
                [width, -i],
            ]);
        }
        return lines;
    };

    useEffect(() => {
        const handleResize = () => {
            if (mapDivRef.current) {
                const { clientWidth, clientHeight } = mapDivRef.current;
                setGridSize({ width: clientWidth, height: clientHeight });
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const gridLines = createGridLines(gridSize.width, gridSize.height, 10);

    const StaticZoomMap = () => {
        const map = useMap();
        useEffect(() => {
            map.setZoom(1); // Set the initial zoom level
        }, [map]);
        return null;
    };

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

    return (
        <div style={{ display: "flex" }}>
            <div style={{ width: "30%" }}>
                <AddZone
                    onAddCoordinate={handleAddCoordinate}
                    onAddZone={handleAddZone}
                    onReset={handleReset}
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
            <div
                style={{
                    height: "100vh",
                    width: "70%",
                    backgroundColor: "#f0f0f0",
                    position: "relative",
                }}
                ref={mapDivRef}
            >
                <MapContainer
                    center={[0, 0]} // Center the map at the origin
                    zoom={1}
                    style={{ height: "100%", width: "100%" }}
                    crs={L.CRS.Simple} // Use Simple CRS for pixel-based coordinates
                    maxBounds={[
                        [-gridSize.width, -gridSize.height],
                        [gridSize.width, gridSize.height],
                    ]}
                    minZoom={0} // Min zoom to prevent zooming out too far
                    maxZoom={4} // Max zoom to prevent zooming in too much
                >
                    <StaticZoomMap />
                    <ResetViewButton />
                    <GridToggleButton
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                    />
                    {showGrid &&
                        gridLines.map((line, index) => (
                            <Polyline
                                key={index}
                                positions={line}
                                color="#ccc"
                                weight={1}
                            />
                        ))}
                    {zones.map((zone, index) => (
                        <Polygon
                            key={index}
                            positions={zone.coordinates}
                            color={zone.color}
                            fillOpacity={0.2}
                        >
                            <Tooltip direction="center">{zone.name}</Tooltip>
                        </Polygon>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapConfigureToolPage;
