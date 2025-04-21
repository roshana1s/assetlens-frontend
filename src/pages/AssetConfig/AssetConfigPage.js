import React, { useEffect, useState } from "react";
import axios from "axios";
import AssetList from "../../components/Asset/AssetList";
import AddAssetButton from "../../components/Asset/AddAssetButton";
import AddAssetForm from "../../components/Asset/AddAssetForm";
import "./AssetConfig.css";

const AssetConfigPage = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const orgId = 1;

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetRes = await axios.get(`http://localhost:8000/assets/${orgId}`);
        setAssets(assetRes.data);
        setFilteredAssets(assetRes.data);
      } catch (err) {
        console.error("Error loading assets:", err);
      }
    };

    const fetchData = async () => {
      try {
        await fetchAssets();
        const categoryRes = await axios.get(`http://localhost:8000/categories/${orgId}`);
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
      const assetRes = await axios.get(`http://localhost:8000/assets/${orgId}`);
      setAssets(assetRes.data);

      if (selectedCategories.length === 0) {
        setFilteredAssets(assetRes.data);
      } else {
        const filtered = assetRes.data.filter((asset) =>
          selectedCategories.includes(asset.category?.category_id)
        );
        setFilteredAssets(filtered);
      }
    } catch (err) {
      console.error("Error refreshing assets:", err);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const updatedSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedSelection);

    if (updatedSelection.length === 0) {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter((asset) =>
        updatedSelection.includes(asset.category?.category_id)
      );
      setFilteredAssets(filtered);
    }
  };

  return (
    <div className="asset-config-container">
      {/* Left Content assets */}
      <div className="asset-list-content">
        <div className="asset-list-header">
          <h1>Asset Configuration</h1>
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
        <h3>Filter by Category</h3>
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

      {/* Floating Add Asset Button */}
      <AddAssetButton onClick={() => setShowAddForm(true)} />

      {/* Add Asset Form Modal */}
      {showAddForm && (
        <AddAssetForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            refreshAssets();
          }}
        />
      )}
    </div>
  );
};

export default AssetConfigPage;