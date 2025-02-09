import React from "react";

const GridToggleButton = ({ showGrid, setShowGrid }) => {
    const handleToggleGrid = () => {
        setShowGrid(!showGrid);
    };

    return (
        <button
            onClick={handleToggleGrid}
            style={{
                position: "absolute",
                top: "50px",
                right: "10px",
                zIndex: 1000,
                padding: "10px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
            }}
        >
            {showGrid ? "Remove Grid" : "Add Grid"}
        </button>
    );
};

export default GridToggleButton;
