import React from "react";
import "./AddZone.css";

const AddZone = ({
    onAddCoordinate,
    onAddZone,
    onReset,
    onRemoveCoordinate,
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
            <form className="zone-form">
                <label className="form-label">
                    Zone Name:
                    <input
                        type="text"
                        value={zoneName}
                        required
                        onChange={(e) => setZoneName(e.target.value)}
                        className="input-field"
                    />
                </label>

                <label className="form-label">
                    Color:
                    <input
                        type="color"
                        value={zoneColor}
                        onChange={(e) => setZoneColor(e.target.value)}
                        className="color-picker"
                    />
                </label>

                <div className="coordinates-section">
                    <h3>Coordinates:</h3>
                    <ul className="coordinates-list">
                        {coordinates.map((coord, index) => (
                            <div className="coordinate-item" key={index}>
                                <li>{coord[0]}, {coord[1]}</li>
                                <button
                                    type="button"
                                    onClick={() => onRemoveCoordinate(index)}
                                    className="remove-btn"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </ul>
                </div>

                <div className="coordinate-inputs">
                    <label className="form-label">
                        X:
                        <input
                            type="number"
                            value={x}
                            required
                            onChange={(e) => setX(e.target.value)}
                            className="input-field"
                        />
                    </label>

                    <label className="form-label">
                        Y:
                        <input
                            type="number"
                            value={y}
                            required
                            onChange={(e) => setY(e.target.value)}
                            className="input-field"
                        />
                    </label>
                </div>

                <button
                    type="button"
                    onClick={onAddCoordinate}
                    className="form-btn w-100"
                >
                    Add Coordinate
                </button>

                <div className="form-buttons">
                    <button
                        type="button"
                        onClick={onAddZone}
                        className="form-btn"
                    >
                        Add Zone
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="form-btn reset-btn"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddZone;
