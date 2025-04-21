import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAssetForm.css";

const AddAssetForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    RFID: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8000/categories/1');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    
    setImageFile(file);
    setError(null);
  };

  const uploadToImgur = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        'https://api.imgur.com/3/image',
        formData,
        {
          headers: {
            'Authorization': `Client-ID YOUR_IMGUR_CLIENT_ID`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data.data.link;
    } catch (err) {
      console.error("Imgur upload failed:", err);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Asset name is required");
      }
      if (!formData.category_id) {
        throw new Error("Category is required");
      }

      let imageUrl = '';
      
      // Upload image if exists
      if (imageFile) {
        imageUrl = await uploadToImgur(imageFile);
      }

      // Prepare the asset data
      const assetData = {
        name: formData.name,
        category_id: formData.category_id,
        ...(formData.RFID && { RFID: formData.RFID }), // Only include if exists
        ...(imageUrl && { image_link: imageUrl }) // Only include if image exists
      };

      // Create the asset
      await axios.post('http://localhost:8000/assets/1', assetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error adding asset:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="add-asset-modal">
      <div className="add-asset-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Add New Asset</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>RFID (Optional)</label>
            <input
              name="RFID"
              value={formData.RFID}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          
          <div className="form-group">
            <label>Asset Image (Optional)</label>
            <div className="image-upload-container">
              <label className="file-upload-btn">
                {imageFile ? imageFile.name : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              {imageFile && (
                <div className="image-preview-container">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="image-preview" 
                  />
                </div>
              )}
            </div>
            <p className="image-upload-note">
              Max file size: 5MB. Supported formats: JPEG, PNG, GIF
            </p>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetForm;