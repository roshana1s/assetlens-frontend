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
        filterAssets(assetRes.data, selectedCategories, searchTerm, availability);
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
      const res = await axios.get(`http://localhost:8000/assets/${orgId}`);
      setAssets(res.data);
      filterAssets(res.data, selectedCategories, searchTerm, availability);
    } catch (err) {
      console.error("Error refreshing assets:", err);
    }
  };

  const refreshCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/categories/${orgId}`);
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

  const filterAssets = (assetsList, selectedCats, term, availabilityStatus) => {
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
      filtered = filtered.filter((asset) =>
        !asset.assigned_to || asset.assigned_to.length === 0
      );
    } else if (availabilityStatus === "not_available") {
      filtered = filtered.filter((asset) =>
        asset.assigned_to && asset.assigned_to.length > 0
      );
    }

    setFilteredAssets(filtered);
  };

  return (
    <div className="asset-config-container">
      {/* Left Content */}
      <div className="asset-list-content">
        <div className="asset-list-header">
          <h1>Asset Configuration</h1>
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

      {/* Right Sidebar */}
      <div className="filter-sidebar">
        <div className="category-header">
          <h3>Filter by Category</h3>
          <button className="edit-category-btn" onClick={() => setShowCategoryManager(true)}>
            <FaEdit />
          </button>
        </div>
        {categories.map((cat) => (
          <label key={cat.category_id} className="checkbox-item">
            <input
              type="checkbox"
              value={cat.category_id}
              onChange={() => handleCategoryToggle(cat.category_id)}
              checked={selectedCategories.includes(cat.category_id)}
            />
            {cat.name}
          </label>
        ))}

        <div style={{ marginTop: "20px" }}>
          <h3>Availability</h3>
          <select value={availability} onChange={handleAvailabilityChange} className="availability-dropdown">
            <option value="ALL">All</option>
            <option value="available">Available</option>
            <option value="not_available">Not Available</option>
          </select>
        </div>
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
