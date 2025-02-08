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
import ResetViewButton from "../../components/ResetViewButton";
import GridToggleButton from "../../components/GridToggleButton";

const MapConfigureToolPage = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [gridSize, setGridSize] = useState({ width: 1000, height: 320 });
    const [showGrid, setShowGrid] = useState(true);
    const mapDivRef = useRef(null);

    const roomCoordinates = [
        [0, 0],
        [10, 10],
        [90, 10],
        [90, 90],
        [10, 90],
    ];

    const roomCoordinates2 = [
        [0, 100],
        [10, 10],
        [90, 10],
        [90, 90],
        [10, 90],
    ];

    const handleRoomClick = () => {
        setSelectedRoom("Room 1");
    };

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
      <div style={{display:"flex"}}>
        <div style={{width:"30%"}}>
          test
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

                {/* Selectable Room Polygon */}
                <Polygon
                    positions={roomCoordinates}
                    color={selectedRoom === "Room 1" ? "green" : "blue"}
                    fillOpacity={0.2}
                    eventHandlers={{
                        click: handleRoomClick,
                    }}
                >
                    <Tooltip direction="center">
                        {selectedRoom === "Room 1"
                            ? "Room 1 (Selected)"
                            : "Room 1"}
                    </Tooltip>
                </Polygon>
                <Polygon
                    positions={roomCoordinates2}
                    color={selectedRoom === "Room 1" ? "green" : "red"}
                    fillOpacity={0.2}
                    eventHandlers={{
                        click: handleRoomClick,
                    }}
                >
                    <Tooltip direction="center">
                        {selectedRoom === "Room 1"
                            ? "Room 1 (Selected)"
                            : "Room 1"}
                    </Tooltip>
                </Polygon>
            </MapContainer>
        </div>
        </div>
    );
};

export default MapConfigureToolPage;
