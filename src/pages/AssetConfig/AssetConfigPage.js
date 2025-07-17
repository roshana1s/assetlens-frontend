import React, { useEffect, useState } from "react";
import axios from "axios";
import AssetList from "../../components/Asset/AssetList";
import AddAssetForm from "../../components/Asset/AddAssetForm";
import EditAssetForm from "../../components/Asset/EditAssetForm";
import CategoryManager from "../../components/Category/CategoryManager";
import FetchingData from "../../components/FetchingData/FetchingData";
import "./AssetConfig.css";
import {
    FaEdit,
    FaPlus,
    FaSearch,
    FaCog,
    FaFilter,
    FaLayerGroup,
    FaCheckCircle,
} from "react-icons/fa";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssetConfigPage = () => {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [availability, setAvailability] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    const orgId = 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetRes, categoryRes] = await Promise.all([
                    axios.get(`http://localhost:8000/assets/${orgId}`),
                    axios.get(`http://localhost:8000/categories/${orgId}`),
                ]);
                setAssets(assetRes.data);
                setCategories(categoryRes.data);
                filterAssets(
                    assetRes.data,
                    selectedCategories,
                    searchTerm,
                    availability
                );
            } catch (err) {
                console.error("Error loading data:", err);
                toast.error("Failed to load asset data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const refreshAssets = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8000/assets/${orgId}`
            );
            setAssets(res.data);
            filterAssets(
                res.data,
                selectedCategories,
                searchTerm,
                availability
            );
        } catch (err) {
            console.error("Error refreshing assets:", err);
            toast.error("Failed to refresh assets");
        }
    };

    const refreshCategories = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8000/categories/${orgId}`
            );
            setCategories(res.data);
        } catch (err) {
            console.error("Error refreshing categories:", err);
            toast.error("Failed to refresh categories");
        }
    };

    const handleCategoryToggle = (categoryId) => {
        const updated = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(updated);
        filterAssets(assets, updated, searchTerm, availability);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        filterAssets(assets, selectedCategories, term, availability);
    };

    const handleAvailabilityChange = (e) => {
        const value = e.target.value;
        setAvailability(value);
        filterAssets(assets, selectedCategories, searchTerm, value);
    };

    const filterAssets = (
        assetsList,
        selectedCats,
        term,
        availabilityStatus
    ) => {
        let filtered = assetsList;

        if (selectedCats.length > 0) {
            filtered = filtered.filter((asset) =>
                selectedCats.includes(asset.category?.category_id)
            );
        }

        if (term.trim()) {
            filtered = filtered.filter((asset) =>
                asset.name.toLowerCase().includes(term.toLowerCase())
            );
        }

        if (availabilityStatus === "available") {
            filtered = filtered.filter(
                (asset) => !asset.assigned_to || asset.assigned_to.length === 0
            );
        } else if (availabilityStatus === "not_available") {
            filtered = filtered.filter(
                (asset) => asset.assigned_to && asset.assigned_to.length > 0
            );
        }

        setFilteredAssets(filtered);
    };

    return (
        <div className="asset-config-container">
            {loading ? (
                <FetchingData />
            ) : (
                <>
                    {/* Left Sidebar - 25% width */}
                    <div className="filter-sidebar">
                        {/* Asset Configuration Section */}
                        <div className="category-header">
                            <h3>
                                <FaCog style={{ marginRight: "8px" }} />
                                Asset Configuration
                            </h3>
                        </div>

                        <div className="scrollable-content">
                            {/* Search Bar */}
                            <div className="form-group">
                                <label>
                                    <FaSearch style={{ marginRight: "8px" }} />
                                    Search Assets
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="search-bar"
                                />
                            </div>

                            {/* Filters Section Header */}
                            <div className="filters-section-divider"></div>
                            <div
                                className="category-header"
                                style={{
                                    marginTop: "24px",
                                    marginBottom: "16px",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        marginBottom: "0",
                                    }}
                                >
                                    <FaFilter style={{ marginRight: "8px" }} />
                                    Filters
                                </h3>
                            </div>

                            {/* Category Filter */}
                            <div className="form-group">
                                <div className="filter-label-with-edit">
                                    <label>
                                        <FaLayerGroup
                                            style={{ marginRight: "8px" }}
                                        />
                                        Filter by Category
                                    </label>
                                    <button
                                        className="edit-category-btn"
                                        onClick={() =>
                                            setShowCategoryManager(true)
                                        }
                                        title="Edit Categories"
                                    >
                                        <FaEdit />
                                    </button>
                                </div>
                                {categories.map((cat) => (
                                    <label
                                        key={cat.category_id}
                                        className="checkbox-item"
                                    >
                                        <input
                                            type="checkbox"
                                            value={cat.category_id}
                                            onChange={() =>
                                                handleCategoryToggle(
                                                    cat.category_id
                                                )
                                            }
                                            checked={selectedCategories.includes(
                                                cat.category_id
                                            )}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>

                            {/* Availability Filter */}
                            <div className="form-group">
                                <label htmlFor="availability">
                                    <FaCheckCircle
                                        style={{ marginRight: "8px" }}
                                    />
                                    Filter by Availability
                                </label>
                                <select
                                    id="availability"
                                    value={availability}
                                    onChange={handleAvailabilityChange}
                                    className="availability-dropdown"
                                >
                                    <option value="ALL">All</option>
                                    <option value="available">Available</option>
                                    <option value="not_available">
                                        Not Available
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Add Asset Button - Fixed at Bottom */}
                        <Button
                            variant="primary"
                            className="asset-config-add-asset-btn"
                            onClick={() => setShowAddForm(true)}
                        >
                            <FaPlus style={{ marginRight: "8px" }} />
                            Add New Asset
                        </Button>
                    </div>

                    {/* Right Content - 75% width */}
                    <div className="asset-list-content">
                        <AssetList
                            assets={filteredAssets}
                            onGeofencingUpdate={(assetId, enabled) => {
                                // Update geofencing for specific asset
                                const updatedAssets = assets.map((asset) =>
                                    asset.asset_id === assetId
                                        ? { ...asset, geofencing: enabled }
                                        : asset
                                );
                                setAssets(updatedAssets);
                                filterAssets(
                                    updatedAssets,
                                    selectedCategories,
                                    searchTerm,
                                    availability
                                );
                                toast.success(
                                    `Geofencing ${
                                        enabled ? "enabled" : "disabled"
                                    } for asset`
                                );
                            }}
                            refreshAssets={refreshAssets}
                            onEditAsset={(asset) => {
                                setEditingAsset(asset);
                                setShowEditForm(true);
                            }}
                        />
                    </div>
                </>
            )}

            {/* Add/Edit Bootstrap Modals */}
            <Modal
                show={showAddForm}
                onHide={() => setShowAddForm(false)}
                size="xl"
                centered
                backdrop="static"
                keyboard={false}
                animation={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Asset</Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: "20px",
                    }}
                >
                    <AddAssetForm
                        onClose={() => setShowAddForm(false)}
                        onSuccess={() => {
                            refreshAssets();
                            setShowAddForm(false);
                            toast.success("Asset added successfully!");
                        }}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                show={showEditForm && editingAsset}
                onHide={() => {
                    setShowEditForm(false);
                    setEditingAsset(null);
                }}
                size="xl"
                centered
                backdrop="static"
                keyboard={false}
                animation={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Asset</Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: "20px",
                    }}
                >
                    {editingAsset && (
                        <EditAssetForm
                            asset={editingAsset}
                            onClose={() => {
                                setShowEditForm(false);
                                setEditingAsset(null);
                            }}
                            onSuccess={() => {
                                refreshAssets();
                                setShowEditForm(false);
                                setEditingAsset(null);
                                toast.success("Asset updated successfully!");
                            }}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                show={showCategoryManager}
                onHide={() => setShowCategoryManager(false)}
                size="lg"
                centered
                backdrop="static"
                keyboard={false}
                animation={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Manage Categories</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <CategoryManager
                        onClose={() => setShowCategoryManager(false)}
                        onCategoryChange={() => {
                            refreshCategories();
                            toast.success("Categories updated successfully!");
                        }}
                    />
                </Modal.Body>
            </Modal>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default AssetConfigPage;
