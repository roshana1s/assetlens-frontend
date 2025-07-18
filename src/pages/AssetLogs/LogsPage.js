import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFilter, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Logs.css';
import { useAuth } from '../../context/AuthContext';

const AssetLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    floors: [],
    zones: [],
    assets: [],
    availability: []
  });
  const [filters, setFilters] = useState({
    floor: 'All',
    zone: 'All',
    asset: 'All',
    availability: 'All',
    fromDate: null,
    toDate: null
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.skip]);

  const fetchFilterOptions = async () => {
    try {
      if (!user?.org_id) return;
      const response = await axios.get(`http://localhost:8000/logs/filter-options/${user.org_id}`);
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        fromDate: filters.fromDate ? filters.fromDate.toISOString() : null,
        toDate: filters.toDate ? filters.toDate.toISOString() : null,
        skip: pagination.skip,
        limit: pagination.limit
      };
      if (!user?.org_id) return;
      const response = await axios.get(`http://localhost:8000/logs/${user.org_id}`, { params });
      console.log('API Response:', response.data); // Debug log
      setLogs(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        hasMore: response.data.has_more
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPagination({ ...pagination, skip: 0 });
  };

  const handleDateChange = (date, field) => {
    setFilters({
      ...filters,
      [field]: date
    });
    setPagination({ ...pagination, skip: 0 });
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      floor: 'All',
      zone: 'All',
      asset: 'All',
      availability: 'All',
      fromDate: null,
      toDate: null
    });
    setPagination({ ...pagination, skip: 0 });
  };

  const handlePageChange = (direction) => {
    const newSkip = direction === 'next' 
      ? pagination.skip + pagination.limit
      : pagination.skip - pagination.limit;
    
    setPagination({
      ...pagination,
      skip: Math.max(0, Math.min(newSkip, pagination.total - pagination.limit))
    });
  };

  return (
    <div className="asset-logs-container">
      <div className="logs-header">
        <h1>Asset Location Logs</h1>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Floor</label>
            <select 
              name="floor" 
              value={filters.floor} 
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="First floor">First floor</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Zone</label>
            <select 
              name="zone" 
              value={filters.zone} 
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {filterOptions.zones.map(zone => (
                <option key={zone.value} value={zone.value}>{zone.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Asset</label>
            <select 
              name="asset" 
              value={filters.asset} 
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {filterOptions.assets.map(asset => (
                <option key={asset.value} value={asset.value}>{asset.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Geofencing</label>
            <select 
              name="availability" 
              value={filters.availability} 
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {filterOptions.availability.map(avail => (
                <option key={avail.value} value={avail.value}>{avail.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group date-filter">
            <label>From</label>
            <div className="date-picker">
              <FaCalendarAlt className="calendar-icon" />
              <DatePicker
                selected={filters.fromDate}
                onChange={(date) => handleDateChange(date, 'fromDate')}
                selectsStart
                startDate={filters.fromDate}
                endDate={filters.toDate}
                placeholderText="DD-MM-YYYY"
                dateFormat="dd-MM-yyyy"
                className="date-input"
              />
            </div>
          </div>

          <div className="filter-group date-filter">
            <label>To</label>
            <div className="date-picker">
              <FaCalendarAlt className="calendar-icon" />
              <DatePicker
                selected={filters.toDate}
                onChange={(date) => handleDateChange(date, 'toDate')}
                selectsEnd
                startDate={filters.fromDate}
                endDate={filters.toDate}
                minDate={filters.fromDate}
                placeholderText="DD-MM-YYYY"
                dateFormat="dd-MM-yyyy"
                className="date-input"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="apply-button" onClick={applyFilters}>Apply</button>
            <button className="reset-button" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Floor</th>
                  <th>Zone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Access Frame</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const assetId = log.asset_id || (log._id ? log._id.split('-')[1] : '-');
                    return (
                    <tr key={`${log._id}-${index}`}>
                      <td>{assetId}</td>
                      <td>{log.asset_name || '-'}</td>
                      <td>{log.locations?.[0]?.category_name || '-'}</td>
                      <td>{log.floor_name || '-'}</td>
                      <td>{log.zone_name || '-'}</td>
                      <td>{log.date || '-'}</td>
                      <td>{log.time || '-'}</td>
                      <td>
                      {log.frame_link ? (
                        <a
                        href={log.frame_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="access-frame-btn"
                        >
                        Access frame here
                        </a>
                      ) : (
                        '-'
                      )}
                      </td>
                    </tr>
                    );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange('prev')} 
              disabled={pagination.skip === 0}
              className="pagination-button"
            >
              <FaChevronLeft /> Previous
            </button>
  
            <span className="page-info">
              Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
            </span>
  
            <button 
              onClick={() => handlePageChange('next')} 
              disabled={!pagination.hasMore}
              className="pagination-button next-button"
            >
              Next <FaChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetLogsPage;