import React, { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    Polygon,
    Tooltip,
    Polyline,
    Marker,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ResetViewButton from "../ResetViewButton/ResetViewButton";
import GridToggleButton from "../GridToggleButton/GridToggleButton";

// Camera icon SVG as Leaflet icon
const cameraIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/747/747314.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

function getCornerCoords(coords, cornerIdx) {
    // 0: Top Left, 1: Top Right, 2: Bottom Right, 3: Bottom Left
    // Assume coords are ordered [TL, TR, BR, BL] or polygon
    if (coords.length === 4) return coords[cornerIdx];
    // If not, fallback to first point
    return coords[cornerIdx % coords.length];
}

const DrawMapWithCam = ({ zones, cameras }) => {
    const [gridSize, setGridSize] = useState({ width: 1000, height: 320 });
    const [showGrid, setShowGrid] = useState(false);
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
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridLines = createGridLines(gridSize.width, gridSize.height, 10);

    const StaticZoomMap = () => {
        const map = useMap();
        useEffect(() => {
            map.setZoom(1);
        }, [map]);
        return null;
    };

    return (
        <div
            style={{
                margin: "8px",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                overflow: "hidden",
                height: "calc(100vh - 86px)",
                width: "75%",
                position: "relative",
            }}
            ref={mapDivRef}
        >
            <MapContainer
                key={JSON.stringify(zones) + JSON.stringify(cameras)}
                center={[20, 20]}
                zoom={1}
                style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#F5F8FB",
                }}
                crs={L.CRS.Simple}
                maxBounds={[
                    [-gridSize.width, -gridSize.height],
                    [gridSize.width, gridSize.height],
                ]}
                minZoom={0}
                maxZoom={4}
            >
                <StaticZoomMap />
                <GridToggleButton showGrid={showGrid} setShowGrid={setShowGrid} />
                <ResetViewButton />
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
                        key={zone.zone_id || index}
                        positions={zone.coordinates}
                        color="#000057"
                        fillColor={zone.color}
                        fillOpacity={0.2}
                        weight={2}
                    >
                        <Tooltip direction="center" permanent>
                            <span
                                style={{
                                    color: "#000057",
                                    backgroundColor: "transparent",
                                    border: "none",
                                }}
                            >
                                {zone.name}
                            </span>
                        </Tooltip>
                    </Polygon>
                ))}
                {cameras.map((cam, idx) => {
                    const zone = zones.find((z) => z.zone_id === cam.zone_id);
                    if (!zone) return null;
                    const pos = getCornerCoords(zone.coordinates, cam.cam_position);
                    return (
                        <Marker
                            key={cam.zone_id}
                            position={pos}
                            icon={cameraIcon}
                            opacity={cam.working ? 1 : 0.4}
                        >
                            <Tooltip direction="top" permanent>
                                <span>
                                    Camera {cam.working ? "On" : "Off"}
                                </span>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default DrawMapWithCam;
