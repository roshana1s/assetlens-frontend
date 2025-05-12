import React from "react";
import { useMap } from "react-leaflet";

const ResetViewButton = () => {
    const map = useMap();
    const handleResetView = () => {
        map.setView([20, 20], 1); // Reset the view to the initial center and zoom level
    };
    return (
        <button
            onClick={handleResetView}
            className="btn btn-success"
            style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 1000,
                padding: "8px 10px",
                fontSize: "14px",
                margin: "6px 0",
            }}
        >
            Reset View
        </button>
    );
};

export default ResetViewButton;
