import React from "react";
import AssetCard from "./AssetCard";

const AssetList = ({ assets, onGeofencingUpdate, refreshAssets }) => {
  return (
    <div className="asset-list">
      {assets.length > 0 ? (
        assets.map((asset) => (
          <AssetCard
            key={asset.asset_id}
            asset={asset}
            onGeofencingUpdate={onGeofencingUpdate}
            refreshAssets={refreshAssets}
          />
        ))
      ) : (
        <p>No assets found.</p>
      )}
    </div>
  );
};

export default AssetList;
