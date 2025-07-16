import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./AssetDetails.css";
import { Button, Spinner } from "react-bootstrap";

const DUMMY_FRAME =
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80";

const AssetDetails = () => {
    const { asset_id } = useParams();
    const org_id = 1;
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAsset = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8000/dashboard/assets/${org_id}/${asset_id}`
                );
                const data = await res.json();
                setAsset(data);
            } catch (err) {
                setAsset(null);
            }
            setLoading(false);
        };
        fetchAsset();
    }, [asset_id]);

    if (loading) {
        return (
            <div className="assetdetails-loading">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="assetdetails-error">
                <h4>Asset not found</h4>
            </div>
        );
    }

    return (
        <div className="assetdetails-root">
            <div className="assetdetails-main">
                <div className="assetdetails-header">
                    <div className="assetdetails-title">
                        <i className="bi bi-box-seam"></i>
                        <span>{asset.name}</span>
                        <span className="assetdetails-id">
                            #{asset.asset_id}
                        </span>
                    </div>
                    <div className="assetdetails-category">
                        <span className="assetdetails-category-chip">
                            {asset.category}
                        </span>
                        {asset.geofencing && (
                            <span className="assetdetails-geofence-chip">
                                <i className="bi bi-geo-alt-fill"></i>{" "}
                                Geofencing Enabled
                            </span>
                        )}
                    </div>
                </div>
                <div className="assetdetails-content">
                    <div className="assetdetails-info">
                        <div className="assetdetails-imgbox">
                            <img
                                src={
                                    asset.image_link
                                        ? asset.image_link
                                        : "https://cdn-icons-png.flaticon.com/512/2991/2991108.png"
                                }
                                alt={asset.name}
                                className="assetdetails-img"
                            />
                        </div>
                        <div className="assetdetails-fields">
                            <div>
                                <span className="assetdetails-label">
                                    RFID:
                                </span>
                                <span className="assetdetails-value">
                                    {asset.RFID}
                                </span>
                            </div>
                            <div>
                                <span className="assetdetails-label">
                                    Assigned To:
                                </span>
                                <span className="assetdetails-value">
                                    {asset.assigned_to &&
                                    asset.assigned_to.length
                                        ? asset.assigned_to.join(" / ")
                                        : "-"}
                                </span>
                            </div>
                            <div>
                                <span className="assetdetails-label">
                                    Floors:
                                </span>
                                <span className="assetdetails-value">
                                    {asset.floors && asset.floors.length
                                        ? asset.floors.join(", ")
                                        : "-"}
                                </span>
                            </div>
                            <div>
                                <span className="assetdetails-label">
                                    Zones:
                                </span>
                                <span className="assetdetails-value">
                                    {asset.zones && asset.zones.length
                                        ? asset.zones.join(", ")
                                        : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="assetdetails-side">
                <div className="assetdetails-side-section">
                    <div className="assetdetails-side-title">
                        <i className="bi bi-geo-alt"></i> Real-time Location
                    </div>
                    <div className="assetdetails-side-map">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/024/553/687/non_2x/isometric-location-map-pin-navigation-gps-icon-3d-illustration-png.png"
                            alt="location"
                            className="assetdetails-side-mapimg"
                        />
                    </div>
                </div>
                <div className="assetdetails-side-section">
                    <div className="assetdetails-side-title">
                        <i className="bi bi-camera-video"></i> Camera Frame
                    </div>
                    <div className="assetdetails-side-frame">
                        <img
                            src={DUMMY_FRAME}
                            alt="Camera Frame"
                            className="assetdetails-side-frameimg"
                        />
                    </div>
                    <div className="assetdetails-side-location">
                        <span className="assetdetails-side-label">
                            Latest Location:
                        </span>
                        <span className="assetdetails-side-value">
                            {asset.floors?.[0] || "Floor"} ,{" "}
                            {asset.zones?.[0] || "Zone"} , (X: 120, Y: 80)
                        </span>
                    </div>
                    <Button
                        className="assetdetails-download-btn"
                        variant="outline-primary"
                        size="sm"
                    >
                        <i className="bi bi-download"></i> Download Footage
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AssetDetails;
