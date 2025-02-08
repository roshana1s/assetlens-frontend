import React from "react";
import { useMap } from "react-leaflet";

const ResetViewButton = () => {
    const map = useMap();
    const handleResetView = () => {
        map.setView([0, 0], 1); // Reset the view to the initial center and zoom level
    };
    return (
        <button
            onClick={handleResetView}
            style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1000,
                padding: "10px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
            }}
        >
            Reset View
        </button>
    );
};

export default ResetViewButton;
