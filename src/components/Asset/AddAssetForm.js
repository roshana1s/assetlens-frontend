import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAssetForm.css";
import Select from "react-select";

const AddAssetForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    RFID: "",
    assigned_to: [],
    bound_to_floor: [],
    bound_to_zone: [],
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [isFetchingZones, setIsFetchingZones] = useState(false);

  useEffect(() => {
    const orgId = 1;
    const fetchMeta = async () => {
      try {
        const [catRes, userRes, floorsRes] = await Promise.all([
          axios.get(`http://localhost:8000/categories/${orgId}`),
          axios.get(`http://localhost:8000/users/for-assets/${orgId}`),
          axios.get(`http://localhost:8000/maps/${orgId}`),
        ]);
  
        setCategories(catRes.data);
        setUsers(userRes.data.data || userRes.data);
        setFloors(floorsRes.data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setError("Failed to load asset metadata");
      }
    };
    fetchMeta();
  }, []);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelect = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      assigned_to: selectedOptions.map((option) => option.value),
    }));
  };
  
  const handleFloorSelect = async (selectedOptions) => {
    const selectedFloors = selectedOptions.map(opt => opt.value);
    
    setFormData(prev => ({
      ...prev,
      bound_to_floor: selectedFloors,
      bound_to_zone: [], // clear zones when floor changes
    }));

    if (selectedFloors.length === 0) {
      setFilteredZones([]);
      return;
    }

    setIsFetchingZones(true);
    try {
      const orgId = 1; // Replace with actual orgId if needed
      const zonesPromises = selectedFloors.map(floorId => 
        axios.get(`http://localhost:8000/maps/${orgId}/${floorId}`)
      );
      const zonesResponses = await Promise.all(zonesPromises);
      
      const allZones = zonesResponses.flatMap((response, index) => {
        if (!response.data || !Array.isArray(response.data)) {
          console.error("Invalid zones data:", response.data);
          return [];
        }
        return response.data.map(zone => ({
          zone_id: zone.zone_id,
          name: zone.name,
          floor_id: selectedFloors[index] // Add floor reference
        }));
      });
      
      setFilteredZones(allZones);
      setError(null);
    } catch (err) {
      console.error("Error fetching zones:", err);
      setError("Failed to load zones for selected floors");
      setFilteredZones([]);
    } finally {
      setIsFetchingZones(false);
    }
  };
  
  const handleZoneSelect = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      bound_to_zone: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Asset name is required");
      }
      if (!formData.category_id) {
        throw new Error("Category is required");
      }

      let base64Image = "";
      if (imageFile) {
        base64Image = await toBase64(imageFile);
      }

      const assetData = {
        name: formData.name,
        category_id: formData.category_id,
        RFID: formData.RFID || "",
        assigned_to: formData.assigned_to,
        bound_to_floor: formData.bound_to_floor,
        bound_to_zone: formData.bound_to_zone,
        image_link: base64Image || "",
        geofencing: false,
        is_deleted: false,
      };

      await axios.post("http://localhost:8000/assets/1", assetData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      onSuccess();
    } catch (err) {
      console.error("Error adding asset:", err);
      setError(err.response?.data?.detail || err.message || "Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-asset-modal">
      <div className="add-asset-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Add New Asset</h2>

        {error && (
          <div className="error-message">
            {typeof error === "string"
              ? error
              : Array.isArray(error)
              ? error.map((e, i) => <div key={i}>{e.msg}</div>)
              : JSON.stringify(error)}
          </div>
        )}

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
              {categories.map((cat) => (
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
            <label>Assign Users (Optional)</label>
            <Select
              isMulti
              name="assigned_to"
              options={users.map((user) => ({
                value: user.user_id,
                label: user.name,
              }))}
              value={users
                .filter((user) => formData.assigned_to.includes(user.user_id))
                .map((user) => ({ value: user.user_id, label: user.name }))}
              onChange={handleUserSelect}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select users..."
            />
          </div>

          <div className="form-group">
            <label>Bound to Floor (Optional)</label>
            <Select
              isMulti
              name="bound_to_floor"
              options={floors.map((floor) => ({
                value: floor.floor_id,
                label: floor.floorName,
              }))}
              value={floors
                .filter((floor) => (formData.bound_to_floor || []).includes(floor.floor_id))
                .map((floor) => ({ value: floor.floor_id, label: floor.floorName }))}
              onChange={handleFloorSelect}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select floor(s)..."
            />
          </div>

          <div className="form-group">
            <label>Bound to Zones (Optional)</label>
            <Select
              isMulti
              name="bound_to_zone"
              options={filteredZones.map((zone) => ({
                value: zone.zone_id,
                label: `${zone.name}`,
              }))}
              value={filteredZones
                .filter((zone) => (formData.bound_to_zone || []).includes(zone.zone_id))
                .map((zone) => ({ 
                  value: zone.zone_id, 
                  label: `${zone.name}` 
                }))}
              onChange={handleZoneSelect}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder={isFetchingZones ? "Loading zones..." : "Select zones..."}
              isDisabled={formData.bound_to_floor.length === 0 || isFetchingZones}
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
                  style={{ display: "none" }}
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
              {loading ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetForm;