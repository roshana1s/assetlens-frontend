import React, { useState } from "react";

const AddFloor = ({ mapDetails, setMapDetails, setSelectedFloor }) => {
    const [newFloorName, setNewFloorName] = useState("");

    const handleCreateNewFloor = () => {
        if (!newFloorName.trim()) {
            alert("Floor name cannot be empty.");
            return;
        }
        if (mapDetails.some((floor) => floor.floorName === newFloorName)) {
            alert("This floor already exists.");
            return;
        }

        const newFloor = {
            floorName: newFloorName,
            zones: [],
        };

        setMapDetails([...mapDetails, newFloor]);
        setNewFloorName("");
        setSelectedFloor(newFloorName);
    };

    return (
        <div>
            <h3>Create New Floor</h3>
            <input
                type="text"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                placeholder="New Floor Name"
            />
            <button onClick={handleCreateNewFloor}>Create Floor</button>
        </div>
    );
};

export default AddFloor;
