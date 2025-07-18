import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./AssetList.css";

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssets();
    }, [user]);

    const fetchAssets = async () => {
        if (!user?.user_id || !user?.org_id) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            console.log("User object:", user); // Debug log
            console.log("Using user_id:", user.user_id, "org_id:", user.org_id); // Debug log

            const response = await axios.get(
                `http://localhost:8000/dashboard/assets/${user.org_id}/user/${user.user_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("API Response:", response.data); // Debug log
            setAssets(response.data || []);
        } catch (error) {
            console.error("Error fetching assets:", error);
            setError("Failed to load assets. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAssetClick = (assetId) => {
        const route =
            user.role === "Super Admin" || user.role === "Admin"
                ? `/admin/asset/${assetId}`
                : `/user/asset/${assetId}`;
        navigate(route);
    };

    const filteredAssets = assets.filter((asset) => {
        const matchesSearch =
            asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "" || asset.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter dropdown
    const uniqueCategories = [
        ...new Set(assets.map((asset) => asset.category).filter(Boolean)),
    ];

    if (loading) {
        return (
            <div className="asset-list-container">
                <div className="asset-list-header">
                    <h2>Asset Management</h2>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading assets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="asset-list-container">
                <div className="asset-list-header">
                    <h2>Asset Management</h2>
                </div>
                <div className="error-container">
                    <div className="error-icon">
                        <svg
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                        </svg>
                    </div>
                    <p>{error}</p>
                    <button onClick={fetchAssets} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="asset-list-container">
            <div className="asset-list-header">
                <h2>Asset Management</h2>
                <div className="asset-controls">
                    <div className="asset-search">
                        <div className="search-input-container">
                            <svg
                                className="search-icon"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search assets by name or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                    <div className="category-filter">
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="category-select"
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="asset-count">
                        <span className="count-number">
                            {filteredAssets.length}
                        </span>
                        <span className="count-label">Assets</span>
                    </div>
                </div>
            </div>

            {filteredAssets.length === 0 ? (
                <div className="no-assets">
                    <div className="no-assets-icon">
                        <svg
                            width="48"
                            height="48"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 5v5h6V5H1zm8 0v5h6V5H9zm1 1h4v3h-4V6z" />
                        </svg>
                    </div>
                    <h3>No Assets Found</h3>
                    <p>
                        {searchTerm
                            ? "No assets match your search criteria. Try adjusting your search terms."
                            : "No assets have been assigned to you yet. Contact your administrator for more information."}
                    </p>
                </div>
            ) : (
                <div className="asset-list">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.asset_id}
                            className="asset-row"
                            onClick={() => handleAssetClick(asset.asset_id)}
                        >
                            <div className="asset-image">
                                {asset.image_link ? (
                                    <img
                                        src={asset.image_link}
                                        alt={asset.name}
                                    />
                                ) : (
                                    <div className="asset-placeholder">
                                        <svg
                                            width="40"
                                            height="40"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 5v5h6V5H1zm8 0v5h6V5H9zm1 1h4v3h-4V6z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="asset-info">
                                <h3 className="asset-name">
                                    {asset.name || "Unnamed Asset"}
                                </h3>
                                <div className="asset-details">
                                    <span className="asset-category">
                                        <svg
                                            width="14"
                                            height="14"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1z" />
                                        </svg>
                                        {asset.category || "No Category"}
                                    </span>
                                    <span className="asset-id">
                                        ID: {asset.asset_id}
                                    </span>
                                </div>
                            </div>
                            <div className="asset-actions">
                                <svg
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssetList;
