import React, { useState } from "react";
import "./Popup.css";

const DeleteConfirmationPopup = ({ asset, onCancel, onConfirm }) => {
  const [input, setInput] = useState("");

  const handleConfirm = () => {
    if (input === asset.name) {
      onConfirm();
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onCancel}>×</button>
        <h3>Type “{asset.name}” below to confirm deletion</h3>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter asset name"
        />
        <div className="popup-buttons">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={handleConfirm} disabled={input !== asset.name}>
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
