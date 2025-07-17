import React from "react";
import AssetCard from "./AssetCard";

const AssetList = ({ assets, onGeofencingUpdate, refreshAssets, onEditAsset }) => {
  return (
    <div className="asset-list">
      {assets.length > 0 ? (
        assets.map((asset) => (
          <AssetCard
            key={asset.asset_id}
            asset={asset}
            onGeofencingUpdate={onGeofencingUpdate}
            refreshAssets={refreshAssets}
            onEditAsset={onEditAsset} 
          />
        ))
      ) : (
        <p>No assets found.</p>
      )}
    </div>
  );
};

export default AssetList;
