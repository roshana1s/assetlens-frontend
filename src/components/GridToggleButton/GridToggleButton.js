import React from "react";
import { Button } from "react-bootstrap";

const GridToggleButton = ({ showGrid, setShowGrid }) => {
    const handleToggleGrid = () => {
        setShowGrid(!showGrid);
    };

    return (
        <Button
            onClick={handleToggleGrid}
            className="btn btn-success" // Bootstrap button classes
            style={{
                position: "absolute",
                top: "50px",
                right: "10px",
                zIndex: 1000,
                padding: "8px 10px",
                fontSize: "14px",
                margin: "6px 0",
            }}
        >
            {showGrid ? "Remove Grid" : "Add Grid"}
        </Button>
    );
};

export default GridToggleButton;
