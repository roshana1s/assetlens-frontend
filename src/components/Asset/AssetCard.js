import React, { useState } from "react";
import axios from "axios";
import "./AssetCard.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";
import DeleteSuccessPopup from "./DeleteSuccessPopup";
import EditAssetForm from "./EditAssetForm";

const AssetCard = ({ asset, onGeofencingUpdate, refreshAssets }) => {
  const [geofencing, setGeofencing] = useState(asset.geofencing);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleToggle = async () => {
    const newStatus = !geofencing;
    setGeofencing(newStatus);
    try {
      await axios.put(`http://localhost:8000/assets/1/${asset.asset_id}`, {
        geofencing: newStatus,
      });
      onGeofencingUpdate(asset.asset_id, newStatus);
    } catch (error) {
      console.error("Error updating geofencing:", error);
      setGeofencing(!newStatus);
    }
  };

  const handleDelete = () => setShowConfirmPopup(true);
  const handleEdit = () => setShowEditForm(true); // Changed to show modal
  const closeEditForm = () => setShowEditForm(false);

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/assets/1/${asset.asset_id}`);
      setShowConfirmPopup(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Deletion failed", error);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    refreshAssets();
  };

  const handleEditSuccess = () => {
    closeEditForm();
    refreshAssets();
  };

  return (
    <>
      <div className="asset-card">
        <div className="asset-left">
          <div className="asset-avatar-container">
            <img className="asset-avatar" src={asset.image_link} alt={asset.name} />
          </div>
          <div className="asset-info">
            <h3>{asset.name}</h3>
            <p>{asset.category?.name || asset.category?.category_name}</p>
          </div>
        </div>

        <div className="asset-right">
          <div className="asset-icons">
            <button className="edit-icon-btn" onClick={handleEdit}>
              <FaEdit />
            </button>
            <button className="delete-icon-btn" onClick={handleDelete}>
              <FaTrash />
            </button>
          </div>

          <div className="toggle-container">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={geofencing}
                onChange={handleToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Edit Asset Form as Popup */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditAssetForm 
              asset={asset} 
              onClose={handleEditSuccess} 
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}

      {/* delete popups */}
      {showConfirmPopup && (
        <DeleteConfirmationPopup
          asset={asset}
          onCancel={() => setShowConfirmPopup(false)}
          onConfirm={confirmDelete}
        />
      )}
      {showSuccessPopup && (
        <DeleteSuccessPopup onClose={handleSuccessClose} />
      )}
    </>
  );
};

export default AssetCard;