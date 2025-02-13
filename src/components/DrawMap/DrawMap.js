import React, { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    Polygon,
    Tooltip,
    Polyline,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ResetViewButton from "../ResetViewButton/ResetViewButton";
import GridToggleButton from "../GridToggleButton/GridToggleButton";

const DrawMap = ({ zones }) => {
    const [gridSize, setGridSize] = useState({ width: 1000, height: 320 });
    const [showGrid, setShowGrid] = useState(true);
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

    return (
        <div
            style={{
                height: "100vh",
                width: "70%",
                position: "relative",
            }}
            ref={mapDivRef}
        >
            <MapContainer
                center={[0, 0]} // Center the map at the origin
                zoom={1}
                style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#F5F8FB",
                }}
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
            </MapContainer>
        </div>
    );
};

export default DrawMap;
