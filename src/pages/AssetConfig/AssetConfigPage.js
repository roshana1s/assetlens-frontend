import React, { useEffect, useState } from "react";
import axios from "axios";
import AssetList from "../../components/Asset/AssetList";
import AddAssetButton from "../../components/Asset/AddAssetButton";
import AddAssetForm from "../../components/Asset/AddAssetForm";
import CategoryManager from "../../components/Category/CategoryManager";
import "./AssetConfig.css";

const AssetConfigPage = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
        setFilteredAssets(assetRes.data);
        setCategories(categoryRes.data);
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
      const updatedAssets = res.data;
      setAssets(updatedAssets);

      // Apply current filters
      let filtered = updatedAssets;
      if (selectedCategories.length > 0) {
        filtered = filtered.filter((asset) =>
          selectedCategories.includes(asset.category?.category_id)
        );
      }
      if (searchTerm.trim()) {
        filtered = filtered.filter((asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredAssets(filtered);
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

    let filtered = assets;
    if (updated.length > 0) {
      filtered = filtered.filter((asset) =>
        updated.includes(asset.category?.category_id)
      );
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAssets(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    let filtered = assets;
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((asset) =>
        selectedCategories.includes(asset.category?.category_id)
      );
    }
    if (term.trim()) {
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(term.toLowerCase())
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
          />
        )}
      </div>

      {/* Right Sidebar */}
      <div className="filter-sidebar">
        <div className="category-header">
          <h3>Filter by Category</h3>
          <button className="edit-category-btn" onClick={() => setShowCategoryManager(true)}>
            ✏️
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
      </div>

      {/* Floating Add Button */}
      <AddAssetButton onClick={() => setShowAddForm(true)} />

      {/* Add Asset Popup */}
      {showAddForm && (
        <AddAssetForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            refreshAssets();
          }}
        />
      )}

      {/* Category Manager Popup */}
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
