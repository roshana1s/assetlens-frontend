import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './HeatmapPage.css';

const HeatmapPage = () => {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [availableAssets, setAvailableAssets] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState({
    assets: false,
    heatmap: false,
    dateRange: false
  });
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(null);


const ZONES = {
    "z0001": { name: "1LH02A", min_x: 0, max_x: 150, min_y: 0, max_y: 150, color: "red" },
    "z0002": { name: "Entrance", min_x: 0, max_x: 100, min_y: -100, max_y: 0, color: "blue" },
    "z0003": { name: "Corridor", min_x: -50, max_x: 0, min_y: -40, max_y: 150, color: "green" }
};


  

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(prev => ({ ...prev, assets: true }));
        setError('');

        const response = await axios.get('http://localhost:8000/available-assets', {
          params: { org_id: user?.org_id }
        });

        setAvailableAssets(response.data.available_assets);
      } catch (err) {
        console.error('Error fetching assets:', err.response?.data || err.message);
        setError('Failed to load available assets');
      } finally {
        setLoading(prev => ({ ...prev, assets: false }));
      }
    };

    if (user?.org_id) {
      fetchAssets();
    }
  }, [user?.org_id]);

  useEffect(() => {
    const fetchDateRange = async () => {
      if (!selectedAsset) {
        setDateRange(null);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, dateRange: true }));
        const response = await axios.get('http://localhost:8000/asset-date-range', {
          params: {
            org_id: user.org_id,
            asset_name: selectedAsset
          }
        });
        setDateRange({
          min: new Date(response.data.min_date),
          max: new Date(response.data.max_date)
        });
        setError('');
      } catch (err) {
        console.error('Failed to fetch date range:', err.response?.data || err.message);
        setDateRange(null);
        setError('No Records Found');
      } finally {
        setLoading(prev => ({ ...prev, dateRange: false }));
      }
    };

    if (user?.org_id && selectedAsset) {
      fetchDateRange();
    }
  }, [selectedAsset, user?.org_id]);

  const generateHeatmap = async () => {
    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, heatmap: true }));
      setError('');
      setHeatmapData(null);

      const params = new URLSearchParams({
        org_id: user.org_id,
        asset_name: selectedAsset
      });

      if (startDate) {
        const startDateTime = new Date(startDate);
        const [startHours, startMinutes] = startTime.split(':');
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
        params.append('start_date', startDateTime.toISOString());
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        const [endHours, endMinutes] = endTime.split(':');
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));
        params.append('end_date', endDateTime.toISOString());
      }

      if (!startDate && !endDate && (startTime !== '00:00' || endTime !== '23:59')) {
        const today = new Date();
        const startDateTime = new Date(today);
        const [startHours, startMinutes] = startTime.split(':');
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

        const endDateTime = new Date(today);
        const [endHours, endMinutes] = endTime.split(':');
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 59, 999);

        params.append('start_date', startDateTime.toISOString());
        params.append('end_date', endDateTime.toISOString());
      }

      const response = await axios.get(`http://localhost:8000/heatmap-data`, {
        params: Object.fromEntries(params)
      });


      const plotData = processHeatmapData(response.data);
      setHeatmapData(plotData);
    } catch (err) {
      console.error('Failed to generate heatmap:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'No Data Records available! Please try another range');
    } finally {
      setLoading(prev => ({ ...prev, heatmap: false }));
    }
  };



  const processHeatmapData = (data) => {

    const heatmapTrace = {
        x: data.x_coords,
        y: data.y_coords,
        z: data.density,
        type: 'heatmap',
        colorscale: 'Turbo',
        showscale: true,
        hoverinfo: 'x+y+z',
        name: 'Movement Density',
        zmin: 0,
        zauto: false,
        connectgaps: false
    };

    const shapes = data.zone_boundaries.map((zone, index) => {
        const zoneInfo = Object.values(ZONES)[index];
        return {
            type: 'rect',
            x0: zone.min_x,
            x1: zone.max_x,
            y0: zone.min_y,
            y1: zone.max_y,
            line: {
                color: zoneInfo.color,
                width: 2,
                dash: 'dash'
            },
            fillcolor: 'rgba(0,0,0,0)',
            layer: 'above'
        };
    });

    const annotations = Object.values(ZONES).map(zone => ({
        x: (zone.min_x + zone.max_x) / 2,
        y: (zone.min_y + zone.max_y) / 2,
        text: zone.name,
        showarrow: false,
        font: {
            color: zone.color,
            size: 12
        },
        bgcolor: 'rgba(255,255,255,0.7)',
        bordercolor: zone.color
    }));


    return {
        data: [heatmapTrace],
        layout: {
            title: {
                text: `Heatmap of ${selectedAsset}`,
                font: { size: 24 }
            },
            xaxis: {
                title: {
                    text: 'X Coordinate',
                    font: { size: 14 }
                },
                range: [data.x_min - 10, data.x_max + 10],
                constrain: 'domain',
                fixedrange: false,
                scaleanchor: 'y'
            },
            yaxis: {
                title: {
                    text: 'Y Coordinate',
                    font: { size: 14 }
                },
                range: [data.y_min - 10, data.y_max + 10],
                constrain: 'domain',
                fixedrange: false,
                scaleanchor: 'x'
            },
            shapes,
            annotations,
            hovermode: 'closest',
            dragmode: 'pan',
            plot_bgcolor: 'rgba(240,240,240,0.8)',
            paper_bgcolor: 'rgba(255,255,255,0.9)',
            showlegend: true
        },
        config: {
            scrollZoom: true,
            displayModeBar: true,
            responsive: true
        }
    };
};

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const pad = num => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  return (
    <div className="heatmap-container">

      <div className="heatmap-controls">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="asset-select">Select Asset:</label>
            <select
              id="asset-select"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              disabled={loading.assets}
            >
              <option value="">Choose asset...</option>
              {availableAssets.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>
          </div>

          <div className="date-time-controls">
            <div className="control-group">
              <label>From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={dateRange ? formatDateForInput(dateRange.min) : ''}
                max={dateRange ? formatDateForInput(dateRange.max) : ''}
                disabled={!selectedAsset || loading.dateRange}
              />
              <label>Time:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!selectedAsset}
              />
            </div>

            <div className="control-group">
              <label>To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || (dateRange ? formatDateForInput(dateRange.min) : '')}
                max={dateRange ? formatDateForInput(dateRange.max) : ''}
                disabled={!selectedAsset || loading.dateRange}
              />
              <label>Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!selectedAsset}
              />
            </div>
          </div>
        </div>
        
        <div className="actions-row">
          <button
            onClick={generateHeatmap}
            disabled={!selectedAsset || loading.heatmap}
            className="generate-button"
          >
            {loading.heatmap ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : 'Generate'}
          </button>

          {dateRange && (
            <div className="date-range-hint">
              Available data: {dateRange.min.toLocaleDateString()} - {dateRange.max.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="heatmap-display">
        {loading.heatmap ? (
          <div className="loading-spinner"></div>
        ) : heatmapData ? (
          <>            <div className="plotly-container">
              <Plot
                data={heatmapData.data}
                layout={{
                  ...heatmapData.layout,
                  autosize: true,
                  margin: { t: 50, b: 50, l: 50, r: 50 },
                  height: 700, // Increased height
                  width: undefined 
                }}
                config={{
                  ...heatmapData.config,
                  responsive: true,
                  displayModeBar: 'hover'
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%', minHeight: '700px' }}
              />
            </div>
            <div className="heatmap-meta">
              <p><strong>Asset:</strong> {selectedAsset}</p>
              {(startDate || endDate) && (
                <p>
                  <strong>Date Range:</strong> {startDate || 'Beginning'} to {endDate || 'Now'}
                </p>
              )}
              {(startTime || endTime) && (
                <p>
                  <strong>Time Range:</strong> {startTime} to {endTime}
                </p>
              )}
            </div>
          </>
        ) : (          <div className="empty-state">
            <div className="placeholder-heatmap">
              <div className="placeholder-overlay">
                <p>Select an asset and generate movement heatmap</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapPage;