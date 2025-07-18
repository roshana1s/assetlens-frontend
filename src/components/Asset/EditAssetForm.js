import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./EditAssetForm.css";
import { useAuth } from "../../context/AuthContext";

const EditAssetForm = ({ asset, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: asset.name || "",
        category_id: asset.category?.category_id || "",
        RFID: asset.RFID || "",
        assigned_to: asset.assigned_to?.map((u) => u.user_id) || [],
        bound_to_floor:
            [...new Set(asset.bound_to_zone?.map((z) => z.floor_id))] || [],
        bound_to_zone: asset.bound_to_zone?.map((z) => z.zone_id) || [],
        image_link: asset.image_link || "",
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
    const [imagePreview, setImagePreview] = useState(asset.image_link || null);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                if (!user || !user.org_id) return;
                const orgId = user.org_id;
                const [catRes, userRes, floorsRes] = await Promise.all([
                    axios.get(`http://localhost:8000/categories/${orgId}`),
                    axios.get(
                        `http://localhost:8000/users/for-assets/${orgId}`
                    ),
                    axios.get(`http://localhost:8000/maps/${orgId}`),
                ]);

                setCategories(catRes.data);
                setUsers(userRes.data.data || userRes.data);
                setFloors(floorsRes.data);

                // Load existing zones if asset has bound zones
                if (asset.bound_to_zone?.length > 0) {
                    const floorIds = [
                        ...new Set(asset.bound_to_zone.map((z) => z.floor_id)),
                    ];
                    loadZonesForFloors(floorIds);
                }
            } catch (err) {
                console.error("Failed loading metadata:", err);
                setError("Failed to load form data");
            }
        };

        const loadZonesForFloors = async (floorIds) => {
            setIsFetchingZones(true);
            try {
                if (!user || !user.org_id) return;
                const orgId = user.org_id;
                const zonesPromises = floorIds.map((floorId) =>
                    axios.get(`http://localhost:8000/maps/${orgId}/${floorId}`)
                );
                const zonesResponses = await Promise.all(zonesPromises);

                const allZones = zonesResponses.flatMap((response, index) =>
                    response.data.map((zone) => ({
                        ...zone,
                        floor_id: floorIds[index],
                    }))
                );
                setFilteredZones(allZones);
            } catch (err) {
                console.error("Error loading zones:", err);
                setError("Failed to load existing zones");
            } finally {
                setIsFetchingZones(false);
            }
        };

        fetchMeta();
    }, [asset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        processImageFile(file);
    };

    const processImageFile = (file) => {
        if (!file.type.match("image.*")) {
            setError("Only image files are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                image_link: reader.result,
            }));
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setImageFile(file);
        setError(null);
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

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            image_link: "",
        }));
        setImageFile(null);
        setImagePreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFloorSelect = async (selectedOptions) => {
        const selectedFloors = selectedOptions.map((opt) => opt.value);

        setFormData((prev) => ({
            ...prev,
            bound_to_floor: selectedFloors,
            bound_to_zone: [], // Clear zones when floors change
        }));

        if (selectedFloors.length === 0) {
            setFilteredZones([]);
            return;
        }

        setIsFetchingZones(true);
        try {
            if (!user || !user.org_id) return;
            const orgId = user.org_id;
            const zonesPromises = selectedFloors.map((floorId) =>
                axios.get(`http://localhost:8000/maps/${orgId}/${floorId}`)
            );
            const zonesResponses = await Promise.all(zonesPromises);

            const allZones = zonesResponses.flatMap((response, index) =>
                response.data.map((zone) => ({
                    ...zone,
                    floor_id: selectedFloors[index],
                }))
            );
            setFilteredZones(allZones);
        } catch (err) {
            console.error("Error fetching zones:", err);
            setError("Failed to load zones for selected floors");
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

    const handleUserSelect = (selectedOptions) => {
        setFormData((prev) => ({
            ...prev,
            assigned_to: selectedOptions.map((option) => option.value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                category_id: formData.category_id,
                RFID: formData.RFID,
                assigned_to: formData.assigned_to,
                bound_to_zone: formData.bound_to_zone,
                image_link: formData.image_link,
            };

            if (!user || !user.org_id) return;
            const orgId = user.org_id;
            await axios.put(
                `http://localhost:8000/assets/${orgId}/${asset.asset_id}`,
                payload
            );

            onSuccess ? onSuccess() : onClose();
        } catch (err) {
            console.error("Update error:", err);
            setError(
                err.response?.data?.detail ||
                    err.message ||
                    "Failed to update asset"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-asset-modal">
            <div className="edit-asset-content">
                <h2>Edit Asset</h2>

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
                                label: user.name || user.username,
                            }))}
                            value={users
                                .filter((user) =>
                                    formData.assigned_to.includes(user.user_id)
                                )
                                .map((user) => ({
                                    value: user.user_id,
                                    label: user.name || user.username,
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
                                    formData.bound_to_floor.includes(
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
                                label: `${zone.name} (Floor: ${zone.floor_id})`,
                            }))}
                            value={filteredZones
                                .filter((zone) =>
                                    formData.bound_to_zone.includes(
                                        zone.zone_id
                                    )
                                )
                                .map((zone) => ({
                                    value: zone.zone_id,
                                    label: `${zone.name} (Floor: ${zone.floor_id})`,
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
                                            onClick={removeImage}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAssetForm;
