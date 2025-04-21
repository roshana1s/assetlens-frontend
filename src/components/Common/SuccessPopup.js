import React from 'react';
import './SuccessPopup.css';

const SuccessPopup = ({ message, onClose }) => {
  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <button className="close-popup-btn" onClick={onClose}>×</button>
        <div className="success-icon">✓</div>
        <h3>{message}</h3>
      </div>
    </div>
  );
};

export default SuccessPopup;