import React, { useEffect, useState } from "react";
import axios from "axios";
import AssetList from "../../components/Asset/AssetList";
import AddAssetButton from "../../components/Asset/AddAssetButton";
import AddAssetForm from "../../components/Asset/AddAssetForm";
import EditAssetForm from "../../components/Asset/EditAssetForm";
import CategoryManager from "../../components/Category/CategoryManager";
import "./AssetConfig.css";
import { FaEdit } from "react-icons/fa";

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
            {/* Left Sidebar - 25% width */}
            <div className="filter-sidebar">
                <div className="category-header">
                    <h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-gear"
                            viewBox="0 0 16 16"
                            style={{ marginRight: "8px" }}
                        >
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.292-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.292-.159a1.873 1.873 0 0 0-2.692 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.292A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                        </svg>
                        Filter Assets
                    </h3>
                    <button
                        className="edit-category-btn"
                        onClick={() => setShowCategoryManager(true)}
                    >
                        <FaEdit />
                    </button>
                </div>

                <div className="scrollable-content">
                    <div className="form-group">
                        <label>Filter by Category</label>
                        {categories.map((cat) => (
                            <label
                                key={cat.category_id}
                                className="checkbox-item"
                            >
                                <input
                                    type="checkbox"
                                    value={cat.category_id}
                                    onChange={() =>
                                        handleCategoryToggle(cat.category_id)
                                    }
                                    checked={selectedCategories.includes(
                                        cat.category_id
                                    )}
                                />
                                {cat.name}
                            </label>
                        ))}
                    </div>

                    <div className="form-group">
                        <label htmlFor="availability">
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
                            <option value="not_available">Not Available</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Right Content - 75% width */}
            <div className="asset-list-content">
                <div className="asset-list-header">
                    <h1>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-box"
                            viewBox="0 0 16 16"
                            style={{ marginRight: "8px" }}
                        >
                            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.239zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.629 13.09a1 1 0 0 1-.629-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
                        </svg>
                        Asset Configuration
                    </h1>
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-bar"
                    />
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <AssetList
                        assets={filteredAssets}
                        onGeofencingUpdate={() => {}}
                        refreshAssets={refreshAssets}
                        onEditAsset={(asset) => {
                            setEditingAsset(asset);
                            setShowEditForm(true);
                        }}
                    />
                )}
            </div>

            {/* Floating Add Button */}
            <AddAssetButton onClick={() => setShowAddForm(true)} />

            {/* Add/Edit Popups */}
            {showAddForm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <AddAssetForm
                            onClose={() => setShowAddForm(false)}
                            onSuccess={() => {
                                refreshAssets();
                                setTimeout(() => setShowAddForm(false), 100);
                            }}
                        />
                    </div>
                </div>
            )}

            {showEditForm && editingAsset && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <EditAssetForm
                            asset={editingAsset}
                            onClose={() => {
                                setShowEditForm(false);
                                setEditingAsset(null);
                            }}
                            onSuccess={() => {
                                refreshAssets();
                                setTimeout(() => {
                                    setShowEditForm(false);
                                    setEditingAsset(null);
                                }, 100);
                            }}
                        />
                    </div>
                </div>
            )}

            {showCategoryManager && (
                <CategoryManager
                    onClose={() => setShowCategoryManager(false)}
                    onCategoryChange={refreshCategories}
                />
            )}
        </div>
    );
};

export default AssetConfigPage;
