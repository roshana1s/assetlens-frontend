import React, { useState } from 'react';
import AddAssetForm from './AddAssetForm';
import SuccessPopup from '../Common/SuccessPopup';

const AddAssetButton = ({ refreshAssets }) => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    setShowSuccess(true);
    refreshAssets();
  };

  return (
    <>
      <button 
      className="add-asset-btn"
      onClick={() => setShowForm(true)}
      >
      </button>

      {showForm && (
        <AddAssetForm 
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showSuccess && (
        <SuccessPopup 
          message="Asset added successfully"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
};

export default AddAssetButton;