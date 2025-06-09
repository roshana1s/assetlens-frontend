import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Select, DatePicker, Spin, message, Card, Row, Col } from 'antd';
import dayjs from 'dayjs';
import "./Logs.css";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AssetLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    floors: [],
    zones: [],
    assets: [],
    availability: []
  });
  const [filters, setFilters] = useState({
    floor: "First floor",
    zone: "All",
    asset: "All",
    availability: "All",
    dateRange: [dayjs('2025-01-12'), dayjs('2025-03-20')]
  });
  const [loading, setLoading] = useState(false);

  const orgId = 1;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [optionsRes, logsRes] = await Promise.all([
          axios.get(`http://localhost:8000/logs/filter-options/${orgId}`),
          axios.get(`http://localhost:8000/logs/${orgId}`)
        ]);
        
        const formattedFloors = optionsRes.data.floors.map(floor => ({
          value: floor.label,
          label: floor.label
        }));
        
        setFilterOptions({
          ...optionsRes.data,
          floors: formattedFloors,
          availability: [
            { value: "All", label: "All" },
            { value: "Breached", label: "Breached" },
            { value: "Normal", label: "Normal" }
          ]
        });
        
        setLogs(logsRes.data.data || []);
        setFilteredData(logsRes.data.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Failed to load logs data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Automatically filter data when filters change
  useEffect(() => {
    if (logs.length === 0) return;

    const filtered = logs.filter(log => {
      // Filter by floor
      if (filters.floor !== "All" && 
          !log.locations?.[0]?.floor_id?.toLowerCase().includes(filters.floor.toLowerCase().replace(' floor', ''))) {
        return false;
      }
      
      // Filter by zone
      if (filters.zone !== "All" && 
          !log.zone_name?.toLowerCase().includes(filters.zone.toLowerCase())) {
        return false;
      }
      
      // Filter by asset
      if (filters.asset !== "All" && 
          !log.locations?.[0]?.asset_id?.toLowerCase().includes(filters.asset.toLowerCase())) {
        return false;
      }
      
      // Filter by availability
      if (filters.availability !== "All") {
        const isBreached = log.locations?.[0]?.geofencing_breached;
        if (filters.availability === "Breached" && !isBreached) return false;
        if (filters.availability === "Normal" && isBreached) return false;
      }
      
      // Filter by date range
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const logDate = dayjs(log.timestamp);
        if (logDate.isBefore(filters.dateRange[0], 'day')) return false;
        if (logDate.isAfter(filters.dateRange[1], 'day')) return false;
      }
      
      return true;
    });

    setFilteredData(filtered);
  }, [filters, logs]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDateChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const columns = [
    {
      title: 'Log ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id ? id.substring(0, 8) + '...' : 'N/A',
      width: 120
    },
    {
      title: 'Asset ID',
      dataIndex: ['locations', 0, 'asset_id'],
      key: 'asset_id',
      render: (id) => id || 'N/A',
      width: 120
    },
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
      render: (name) => name || 'Unknown',
      width: 150
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category || 'N/A',
      width: 120
    },
    {
      title: 'Floor',
      dataIndex: ['locations', 0, 'floor_id'],
      key: 'floor',
      render: (floor) => floor ? floor.replace("f", "").toUpperCase() + ' floor' : 'N/A',
      width: 120
    },
    {
      title: 'Zone',
      dataIndex: 'zone_name',
      key: 'zone',
      render: (zone) => zone || 'N/A',
      width: 120
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'date',
      render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : 'N/A',
      width: 120
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'time',
      render: (date) => date ? dayjs(date).format('HH:mm:ss') : 'N/A',
      width: 100
    },
    {
    
    }
  ];

  return (
    <div className="asset-logs-container">
      <Card title="Asset Location Logs" bordered={false}>
        <div className="filters-section">
          <Row gutter={16}>
            <Col span={4}>
              <div className="filter-item">
                <div className="filter-label">Floor</div>
                <Select
                  value={filters.floor}
                  onChange={(value) => handleFilterChange('floor', value)}
                  style={{ width: '100%' }}
                  loading={loading}
                >
                  {filterOptions.floors?.map(floor => (
                    <Option key={floor.value} value={floor.value}>
                      {floor.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={4}>
              <div className="filter-item">
                <div className="filter-label">Zone</div>
                <Select
                  value={filters.zone}
                  onChange={(value) => handleFilterChange('zone', value)}
                  style={{ width: '100%' }}
                  loading={loading}
                >
                  {filterOptions.zones?.map(zone => (
                    <Option key={zone.value} value={zone.value}>
                      {zone.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={4}>
              <div className="filter-item">
                <div className="filter-label">Asset</div>
                <Select
                  value={filters.asset}
                  onChange={(value) => handleFilterChange('asset', value)}
                  style={{ width: '100%' }}
                  loading={loading}
                >
                  {filterOptions.assets?.map(asset => (
                    <Option key={asset.value} value={asset.value}>
                      {asset.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={4}>
              <div className="filter-item">
                <div className="filter-label">Availability</div>
                <Select
                  value={filters.availability}
                  onChange={(value) => handleFilterChange('availability', value)}
                  style={{ width: '100%' }}
                  loading={loading}
                >
                  {filterOptions.availability?.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <div className="filter-label">Date Range</div>
                <RangePicker
                  value={filters.dateRange}
                  onChange={handleDateChange}
                  style={{ width: '100%' }}
                  format="DD-MM-YYYY"
                  disabled={loading}
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            bordered
            loading={loading}
            size="middle"
          />
        </div>
      </Card>
    </div>
  );
};

export default AssetLogsPage;