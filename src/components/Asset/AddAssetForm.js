import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddAssetForm.css";
import Select from "react-select";
import { useAuth } from "../../context/AuthContext";

const AddAssetForm = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
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
    const [dragActive, setDragActive] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchMeta = async () => {
            if (!user || !user.org_id) return;

            try {
                const [catRes, userRes, floorsRes] = await Promise.all([
                    axios.get(`http://localhost:8000/categories/${user.org_id}`),
                    axios.get(
                        `http://localhost:8000/users/for-assets/${user.org_id}`
                    ),
                    axios.get(`http://localhost:8000/maps/${user.org_id}`),
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
        processImageFile(file);
    };

    const processImageFile = (file) => {
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

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImageFile(e.dataTransfer.files[0]);
        }
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
        const selectedFloors = selectedOptions.map((opt) => opt.value);

        setFormData((prev) => ({
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
            if (!user || !user.org_id) return;
            const zonesPromises = selectedFloors.map((floorId) =>
                axios.get(`http://localhost:8000/maps/${user.org_id}/${floorId}`)
            );
            const zonesResponses = await Promise.all(zonesPromises);

            const allZones = zonesResponses.flatMap((response, index) => {
                if (!response.data || !Array.isArray(response.data)) {
                    console.error("Invalid zones data:", response.data);
                    return [];
                }
                return response.data.map((zone) => ({
                    zone_id: zone.zone_id,
                    name: zone.name,
                    floor_id: selectedFloors[index], // Add floor reference
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
            if (!user || !user.org_id) return;
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

            await axios.post(`http://localhost:8000/assets/${user.org_id}`, assetData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            onSuccess();
        } catch (err) {
            console.error("Error adding asset:", err);
            setError(
                err.response?.data?.detail ||
                    err.message ||
                    "Failed to add asset"
            );
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
                                <option
                                    key={cat.category_id}
                                    value={cat.category_id}
                                >
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
                                .filter((user) =>
                                    formData.assigned_to.includes(user.user_id)
                                )
                                .map((user) => ({
                                    value: user.user_id,
                                    label: user.name,
                                }))}
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
                                .filter((floor) =>
                                    (formData.bound_to_floor || []).includes(
                                        floor.floor_id
                                    )
                                )
                                .map((floor) => ({
                                    value: floor.floor_id,
                                    label: floor.floorName,
                                }))}
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
                                .filter((zone) =>
                                    (formData.bound_to_zone || []).includes(
                                        zone.zone_id
                                    )
                                )
                                .map((zone) => ({
                                    value: zone.zone_id,
                                    label: `${zone.name}`,
                                }))}
                            onChange={handleZoneSelect}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder={
                                isFetchingZones
                                    ? "Loading zones..."
                                    : "Select zones..."
                            }
                            isDisabled={
                                formData.bound_to_floor.length === 0 ||
                                isFetchingZones
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Asset Image (Optional)</label>
                        <div
                            className={`image-upload-container ${
                                dragActive ? "drag-active" : ""
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {!imagePreview ? (
                                <div className="upload-zone">
                                    <div className="upload-icon">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="48"
                                            height="48"
                                            fill="currentColor"
                                            className="bi bi-cloud-upload"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="upload-text">
                                        <strong>
                                            Drag & drop an image here
                                        </strong>
                                        <br />
                                        or click to browse
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file-input-hidden"
                                    />
                                </div>
                            ) : (
                                <div className="image-preview-container">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="image-preview"
                                    />
                                    <div className="image-actions">
                                        <button
                                            type="button"
                                            className="change-image-btn"
                                            onClick={() =>
                                                document
                                                    .querySelector(
                                                        ".file-input-hidden"
                                                    )
                                                    .click()
                                            }
                                        >
                                            Change Image
                                        </button>
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="image-upload-note">
                            Max file size: 5MB. Supported formats: JPEG, PNG,
                            GIF
                        </p>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Asset"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetForm;
