import React from "react";
import "./AddZone.css";

const AddZone = ({
    onAddCoordinate,
    onAddZone,
    onReset,
    coordinates,
    zoneName,
    setZoneName,
    zoneColor,
    setZoneColor,
    x,
    setX,
    y,
    setY,
}) => {
    return (
        <div className="form-container">
            <form>
                <label>
                    Zone Name:
                    <input
                        type="text"
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                    />
                </label>
                <label>
                    Color:
                    <input
                        type="color"
                        value={zoneColor}
                        onChange={(e) => setZoneColor(e.target.value)}
                    />
                </label>
                <label>
                    X:
                    <input
                        type="number"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                    />
                </label>
                <label>
                    Y:
                    <input
                        type="number"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                    />
                </label>
                <button type="button" onClick={onAddCoordinate}>
                    Add Coordinate
                </button>
                <button type="button" onClick={onAddZone}>
                    Add Zone
                </button>
                <button type="button" onClick={onReset}>
                    Reset
                </button>
            </form>
            <div>
                <h3>Coordinates:</h3>
                <ul>
                    {coordinates.map((coord, index) => (
                        <li key={index}>
                            {coord[0]}, {coord[1]}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AddZone;
