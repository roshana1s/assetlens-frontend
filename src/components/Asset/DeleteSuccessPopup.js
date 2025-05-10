import React from "react";
import "./Popup.css";

const DeleteSuccessPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Asset removed</h3>
      </div>
    </div>
  );
};

export default DeleteSuccessPopup;
