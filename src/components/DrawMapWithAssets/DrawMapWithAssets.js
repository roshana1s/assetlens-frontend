import React, { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    Polygon,
    Tooltip,
    Polyline,
    useMap,
    CircleMarker,
    Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ResetViewButton from "../ResetViewButton/ResetViewButton";
import GridToggleButton from "../GridToggleButton/GridToggleButton";

const DrawMapWithAssets = ({ zones, assetLocations }) => {
    const [gridSize, setGridSize] = useState({ width: 1000, height: 320 });
    const [showGrid, setShowGrid] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

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
                key={JSON.stringify(zones)} // Add key to force re-render
                center={[20, 20]} // Center the map at (20, 20)
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
                {assetLocations.map((asset, index) => (
                    <CircleMarker
                        key={index}
                        center={[asset.coordinate.x, asset.coordinate.y]}
                        radius={6}
                        color="#FF0000"
                        fillColor="#FF0000"
                        fillOpacity={0.8}
                        eventHandlers={{
                            click: () => {
                                setShowPopup(true);
                            },
                        }}
                    >
                        <Tooltip direction="bottom" permanent>
                            <span
                                style={{
                                    color: "#FF0000",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                }}
                            >
                                {asset.name}
                            </span>
                        </Tooltip>

                        {showPopup && (
                            <Popup
                                position={[
                                    asset.coordinate.x,
                                    asset.coordinate.y,
                                ]}
                                onClose={() => setShowPopup(false)}
                                autoPan={true}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <h6>{asset.name || asset.asset_id}</h6>
                                    <button
                                        className="btn btn-sm btn-primary mt-2"
                                        onClick={() =>
                                            (window.location.href = `/asset/${asset.asset_id}`)
                                        }
                                    >
                                        Show more details
                                    </button>
                                </div>
                            </Popup>
                        )}
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default DrawMapWithAssets;
