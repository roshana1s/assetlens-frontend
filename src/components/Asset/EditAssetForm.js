import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditAssetForm.css";

const EditAssetForm = ({ asset, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: asset.name || "",
    category_id: asset.category?.category_id || "",
    RFID: asset.RFID || "",
    assigned_to: asset.assigned_to?.map(u => u.user_id) || [],
    bound_to_zone: asset.bound_to_zone?.map(z => z.zone_id) || [],
    image_link: asset.image_link || ""
  });

  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const orgId = 1;
    const fetchMeta = async () => {
      try {
        const [catRes, userRes, mapRes] = await Promise.all([
          axios.get(`http://localhost:8000/categories/${orgId}`),
          axios.get(`http://localhost:8000/users/${orgId}`),
          axios.get(`http://localhost:8000/maps/${orgId}`),
        ]);
        setCategories(catRes.data);
        setUsers(userRes.data.data || userRes.data);
        const zonesData = mapRes.data.data || mapRes.data;
        setZones(Array.isArray(zonesData) ? zonesData.flatMap(floor => floor.zones || []) : []);
      } catch (err) {
        console.error("Failed loading metadata:", err);
      }
    };
    fetchMeta();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
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

  const uploadToImgur = async (file) => {
    try {
      const imgData = new FormData();
      imgData.append("image", file);
      const res = await axios.post("https://api.imgur.com/3/image", imgData, {
        headers: {
          Authorization: "Client-ID YOUR_IMGUR_CLIENT_ID",
        },
      });
      return res.data.data.link;
    } catch (err) {
      console.error("Imgur upload failed:", err);
      throw new Error("Failed to upload image.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (e, fieldName) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData(prev => ({
      ...prev,
      [fieldName]: selected
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_link;
      if (imageFile) {
        imageUrl = await uploadToImgur(imageFile);
      }

      const payload = {};

      if (formData.name && formData.name !== asset.name) payload.name = formData.name;
      if (formData.category_id && formData.category_id !== asset.category?.category_id)
        payload.category_id = formData.category_id;
      if (formData.RFID && formData.RFID !== asset.RFID) payload.RFID = formData.RFID;

      if (
        JSON.stringify(formData.assigned_to) !==
        JSON.stringify(asset.assigned_to?.map(u => u.user_id))
      ) {
        payload.assigned_to = formData.assigned_to;
      }

      if (
        JSON.stringify(formData.bound_to_zone) !==
        JSON.stringify(asset.bound_to_zone?.map(z => z.zone_id))
      ) {
        payload.bound_to_zone = formData.bound_to_zone;
      }

      if (imageFile || imageUrl !== asset.image_link) {
        payload.image_link = imageUrl;
      }

      if (Object.keys(payload).length > 0) {
        await axios.put(
          `http://localhost:8000/assets/1/${asset.asset_id}`,
          payload
        );
      }

      onSuccess ? onSuccess() : onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.detail || err.message || "Failed to update asset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-form">
      <h4>Edit Asset</h4>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Asset Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={asset.name || "Enter name"}
          />
        </div>

        <div className="form-group">
          <label>RFID</label>
          <input
            name="RFID"
            value={formData.RFID}
            onChange={handleChange}
            placeholder={asset.RFID || "Enter RFID"}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">-- Select Category --</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assigned To</label>
          <select
            multiple
            value={formData.assigned_to}
            onChange={(e) => handleMultiSelect(e, "assigned_to")}
            className="multi-select"
          >
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.name || user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Bound To Zones</label>
          <select
            multiple
            value={formData.bound_to_zone}
            onChange={(e) => handleMultiSelect(e, "bound_to_zone")}
            className="multi-select"
          >
            {zones.map(zone => (
              <option key={zone.zone_id} value={zone.zone_id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Asset Image</label>
          <div className="image-upload-container">
            <label className="file-upload-btn">
              {imageFile ? imageFile.name : "Change Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
            {(formData.image_link || imageFile) && (
              <div className="image-preview-container">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_link}
                  alt="Preview"
                  className="image-preview"
                />
                {formData.image_link && !imageFile && (
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData(prev => ({ ...prev, image_link: "" }))}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="image-upload-note">
            Max file size: 5MB. Supported formats: JPEG, PNG, GIF
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAssetForm;
