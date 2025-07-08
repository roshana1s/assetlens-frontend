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
                <GridToggleButton
                    showGrid={showGrid}
                    setShowGrid={setShowGrid}
                />
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
                    if (!cam.cam_coordinates) return null;
                    const pos = [cam.cam_coordinates.x, cam.cam_coordinates.y];
                    // Create a custom Leaflet icon using the SVG with dynamic color
                    const svgIcon = (color) =>
                        L.divIcon({
                            className: "",
                            html: `
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="${color}" viewBox="0 0 16 16">
                                  <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                  <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"/>
                                </svg>
                            `,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                        });

                    return (
                        <Marker
                            key={cam.zone_id}
                            position={pos}
                            icon={svgIcon(cam.working ? "#28a745" : "#dc3545")}
                            opacity={1}
                        >
                            <Tooltip direction="top" permanent>
                                <span>Camera {cam.working ? "On" : "Off"}</span>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default DrawMapWithCam;
