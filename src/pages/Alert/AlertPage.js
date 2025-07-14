import React, { useEffect, useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AlertPage.css';

const AlertPage = () => {
    const { alerts, fetchAlerts } = useAlerts();
    const { currentOrgId, token } = useAuth();
    const [assets, setAssets] = useState({});
    const [floors, setFloors] = useState({});
    const [zones, setZones] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentOrgId) {
            fetchAllData();
        }
    }, [currentOrgId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await fetchAlerts();
            
            // Fetch assets
            const assetsRes = await axios.get(`http://localhost:8000/assets/${currentOrgId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const assetsMap = {};
            assetsRes.data.forEach(asset => {
                assetsMap[asset.asset_id] = asset;
            });
            setAssets(assetsMap);
            
            const uniqueFloorIds = [...new Set(alerts.map(a => a.floor_id).filter(Boolean))];
            
            const floorPromises = uniqueFloorIds.map(floorId => 
                axios.get(`http://localhost:8000/maps/${currentOrgId}/get-floor/${floorId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );
            
            const floorsData = await Promise.all(floorPromises);
            const floorsMap = {};
            const zonesMap = {};
            
            floorsData.forEach(floor => {
                const floorData = floor.data;
                floorsMap[floorData.floor_id] = floorData.floorName;
                floorData.zones.forEach(zone => {
                    zonesMap[zone.zone_id] = zone.name;
                });
            });
            
            setFloors(floorsMap);
            setZones(zonesMap);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAlertColor = (type) => {
        switch(type) {
            case 'misplaced': return '#ff4444';
            case 'geofence_breach': return '#9c3106';
            case 'potential_geofence_breach': return '#525049'; 
            default: return '#6c757d';
        }
    };

    const formatDescription = (alert) => {
        const assetName = assets[alert.asset_id]?.name || alert.asset_id;
        const floorName = floors[alert.floor_id] || '';
        const zoneName = zones[alert.zone_id] || '';

        switch(alert.type) {
            case 'geofence_breach':
                return `${assetName} left ${zoneName ? `zone ${zoneName}` : 'its assigned zone'}${floorName ? ` on ${floorName}` : ''}`;
            case 'potential_geofence_breach':
                return `${assetName} is approaching ${zoneName ? `the boundary of ${zoneName}` : 'its zone boundary'}${floorName ? ` on ${floorName}` : ''}`;
            case 'misplaced':
                return `${assetName} was placed in ${zoneName || 'an unexpected location'}${floorName ? ` on ${floorName}` : ''}`;
            default:
                return alert.description
                    .replace(alert.asset_id, assetName)
                    .replace(alert.floor_id, floorName)
                    .replace(alert.zone_id, zoneName);
        }
    };

    return (
        <div className="alert-page-container">
            <div className="alert-page-header">
                <h1>Alerts History</h1>
            </div>
            
            {loading ? (
                <div className="alert-loading-state">
                    <div className="spinner"></div>
                    <p>Loading alerts...</p>
                </div>
            ) : (
                <div className="alert-list-container">
                    {alerts.length > 0 ? (
                        <table className="alert-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60%' }}>Alert</th>
                                    <th style={{ width: '20%' }}>Type</th>
                                    <th style={{ width: '20%' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => (
                                    <tr key={alert._id} className="alert-row">
                                        <td>
                                            <div className="alert-message" style={{ borderLeft: `3px solid ${getAlertColor(alert.type)}` }}>
                                                {formatDescription(alert)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="alert-type-badge" style={{ backgroundColor: getAlertColor(alert.type) }}>
                                                {alert.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="alert-time">{formatTime(alert.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-alerts-message">
                            <p>No alerts found in your history</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertPage;