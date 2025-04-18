import React, { useEffect, useState } from "react";
import Combobox from "react-widgets/Combobox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "./PastTracking.css";
import Button from "react-bootstrap/Button";
import DrawMap from "../../components/DrawMap/DrawMap";

const PastTracking = () => {
    const [floorId, setFloorId] = useState("ALL");
    const [zoneId, setZoneId] = useState("ALL");
    const [assetId, setAssetId] = useState("ALL");
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const [initialFilterDetails, setInitialFilterDetails] = useState({});

    const [locations, setLocations] = useState([]);

    useEffect(() => {
        // Fetch initial filter details from the API
        const fetchInitialFilterDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/past-tracking/1/u0003/get-past-tracking-filters-initial`
                );
                setInitialFilterDetails(response.data);

                // Make the first API call with default filters
                const defaultFilters = {
                    floor_id: "ALL",
                    zone_id: "ALL",
                    asset_id: "ALL",
                    start_date: null,
                    start_time: null,
                    end_date: null,
                    end_time: null,
                };
                
                fetchLocations(defaultFilters);
        } catch (error) {
            console.error("Error fetching initial filter details:", error);
        }
    };

    fetchInitialFilterDetails();
}, []);

// Fetch locations based on filters
const fetchLocations = async (filters) => {
    try {
        const response = await axios.post(
            `http://localhost:8000/past-tracking/1/past-tracking-locations`,
            filters
        );
        setLocations(response.data);
        console.log("Locations:", response.data);
    } catch (error) {
        console.error("Error fetching locations:", error);
    }
};

const handleSubmit = () => {
    const filterData = {
        floor_id: floorId,
        zone_id: zoneId,
        asset_id: assetId,
        start_date: startDate ? startDate.toISOString().split("T")[0] : null, // Convert to 'YYYY-MM-DD'
        start_time: startTime ? `${startTime}:00` : null, // Append seconds for Python time object
        end_date: endDate ? endDate.toISOString().split("T")[0] : null, // Convert to 'YYYY-MM-DD'
        end_time: endTime ? `${endTime}:00` : null, // Append seconds for Python time object
    };

    console.log("Filter Data:", filterData);

    // Call the API with the filter data
    fetchLocations(filterData);
};

    const matchedFloor = (initialFilterDetails.floors || []).find(
        (floor) => floor.floor_id === floorId
    );

    console.log(zoneId);
    return (
        <div style={{ display: "flex" }}>
            {/* Left Panel */}
            <div className="floor-details-panel">
                <span className="header-text">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-map"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
                        />
                    </svg>
                    <span className="ms-2">Past Tracking</span>
                </span>

                {/* Scrollable Content */}
                <div className="scrollable-content">
                    <div className="form-group">
                        <label htmlFor="floor-select">Select Floor</label>
                        <Combobox
                            id="floor-select"
                            defaultValue={"ALL"}
                            data={[
                                "ALL",
                                ...(initialFilterDetails.floors || []).map(
                                    (floor) => floor.floorName
                                ),
                            ]}
                            onChange={(value) =>
                                setFloorId(
                                    initialFilterDetails.floors?.find(
                                        (floor) => floor.floorName === value
                                    )?.floor_id || "ALL"
                                )
                            }
                        />
                    </div>

                    {/* Zone Combobox */}
                    <div className="form-group">
                        <label htmlFor="zone-select">Select Zone</label>

                        <Combobox
                            id="zone-select"
                            defaultValue={"ALL"}
                            data={[
                                "ALL",
                                ...(matchedFloor?.zones || []).map(
                                    (zone) => zone.name
                                ),
                            ]}
                            onChange={(value) =>
                                setZoneId(
                                    matchedFloor?.zones?.find(
                                        (zone) => zone.name === value
                                    )?.zone_id || "ALL"
                                )
                            }
                        />
                    </div>

                    {/* Asset Combobox */}
                    <div className="form-group">
                        <label htmlFor="asset-select">Select Asset</label>
                        <Combobox
                            id="asset-select"
                            defaultValue={"ALL"}
                            data={[
                                "ALL",
                                ...(initialFilterDetails.assets || []).map(
                                    (asset) => asset.name
                                ),
                            ]}
                            onChange={(value) =>
                                setAssetId(
                                    initialFilterDetails.assets?.find(
                                        (asset) => asset.name === value
                                    )?.asset_id || "ALL"
                                )
                            }
                        />
                    </div>

                    {/* Start Date and Time */}
                    <div className="form-group date-time-group">
                        <div>
                            <label htmlFor="start-date">Start Date</label>
                            <DatePicker
                                id="start-date"
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                className="form-control"
                                placeholderText="Select Start Date"
                            />
                        </div>
                        <div>
                            <label htmlFor="start-time">Start Time</label>
                            <input
                                id="start-time"
                                type="time"
                                className="form-control"
                                value={startTime || ""}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* End Date and Time */}
                    <div className="form-group date-time-group">
                        <div>
                            <label htmlFor="end-date">End Date</label>
                            <DatePicker
                                id="end-date"
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                className="form-control"
                                placeholderText="Select End Date"
                            />
                        </div>
                        <div>
                            <label htmlFor="end-time">End Time</label>
                            <input
                                id="end-time"
                                type="time"
                                className="form-control"
                                value={endTime || ""}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {/* Submit Button */}
                <Button
                    variant="primary"
                    className="apply-filters-btn"
                    onClick={handleSubmit}
                >
                    Apply Filters
                </Button>
            </div>
            <DrawMap zones={[]} />
        </div>
    );
};

export default PastTracking;
