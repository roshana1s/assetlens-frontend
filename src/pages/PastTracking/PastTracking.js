// import React, { useEffect, useState } from "react";
// import Combobox from "react-widgets/Combobox";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";
// import "./PastTracking.css";
// import Button from "react-bootstrap/Button";
// import DrawMapWithAssets from "../../components/DrawMapWithAssets/DrawMapWithAssets";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//     BsSkipStartFill,
//     BsChevronLeft,
//     BsPlayFill,
//     BsPauseFill,
//     BsChevronRight,
//     BsSkipEndFill,
// } from "react-icons/bs";
// import FetchingData from "../../components/FetchingData/FetchingData";
// import NavBarOrgAdmin from "../../components/NavBarOrgAdmin/NavBarOrgAdmin";

// const PastTracking = () => {
//     const [floorId, setFloorId] = useState("");
//     const [zoneId, setZoneId] = useState("ALL");
//     const [assetId, setAssetId] = useState("ALL");
//     const [startDate, setStartDate] = useState(null);
//     const [startTime, setStartTime] = useState("00:00");
//     const [endDate, setEndDate] = useState(null);
//     const [endTime, setEndTime] = useState("23:59");

//     const [initialFilterDetails, setInitialFilterDetails] = useState({});
//     const [timelineFrames, setTimelineFrames] = useState([]);
//     const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [mapDetails, setMapDetails] = useState({});

//     const [initialDataLoad, setInitialDataLoad] = useState(true);
//     const [getData, setGetData] = useState(false);

//     const user_id = 'u0002';
    
//     useEffect(() => {
//         const fetchDataAndFilters = async (org_id) => {
//             try {
//                 const mapResponse = await axios.get(
//                     `http://localhost:8000/maps/${org_id}/get-map`
//                 );
//                 setMapDetails(mapResponse.data);

//                 const filterResponse = await axios.get(
//                     `http://localhost:8000/past-tracking/1/u0003/get-past-tracking-filters-initial`
//                 );
//                 setInitialFilterDetails(filterResponse.data);
//                 setInitialDataLoad(false);
//             } catch (err) {
//                 console.error("Error fetching data:", err.message);
//             }
//         };

//         fetchDataAndFilters(1);
//     }, []);

//     useEffect(() => {
//         let interval;
//         if (isPlaying) {
//             interval = setInterval(() => {
//                 setCurrentFrameIndex((prev) => {
//                     if (prev >= timelineFrames.length - 1) {
//                         setIsPlaying(false);
//                         return prev;
//                     }
//                     return prev + 1;
//                 });
//             }, 2000);
//         }
//         return () => clearInterval(interval);
//     }, [isPlaying, timelineFrames.length]);

//     const fetchLocations = async (filters) => {
//         try {
//             setGetData(true);
//             const response = await axios.post(
//                 `http://localhost:8000/past-tracking/1/past-tracking-locations`,
//                 filters
//             );
//             const sortedFrames = response.data.sort(
//                 (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
//             );
//             setTimelineFrames(sortedFrames);
//             setCurrentFrameIndex(0);
//             setIsPlaying(false);
//             setGetData(false);
//         } catch (error) {
//             console.error("Error fetching locations:", error);
//         }
//     };

//     const handleSubmit = () => {
//         if (!floorId) {
//             toast.error("Please select a floor");
//             return;
//         }

//         const filterData = {
//             user_id: user_id,
//             floor_id: floorId,
//             zone_id: zoneId,
//             asset_id: assetId,
//             start_date: startDate
//                 ? new Date(startDate).toISOString().split("T")[0]
//                 : null,
//             start_time: startTime ? `${startTime}:00` : null,
//             end_date: endDate
//                 ? new Date(endDate).toISOString().split("T")[0]
//                 : null,
//             end_time: endTime ? `${endTime}:00` : null,
//         };

//         fetchLocations(filterData);
//     };

//     const matchedFloor = (initialFilterDetails.floors || []).find(
//         (floor) => floor.floor_id === floorId
//     );

//     const currentFrame = timelineFrames[currentFrameIndex] || {};
//     const currentTimestamp = currentFrame.timestamp
//         ? new Date(currentFrame.timestamp).toLocaleString()
//         : "No data available";

//     return (
//         <div className="past-tracking-container">
//             <NavBarOrgAdmin />
//             <div style={{ display: "flex" }}>
//                 <ToastContainer position="top-right" autoClose={3000} />
//                 <div className="floor-details-panel">
//                     <span className="header-text">
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             width="16"
//                             height="16"
//                             fill="currentColor"
//                             className="bi bi-map"
//                             viewBox="0 0 16 16"
//                         >
//                             <path
//                                 fillRule="evenodd"
//                                 d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"
//                             />
//                         </svg>
//                         <span className="ms-2">Past Tracking</span>
//                     </span>
//                     {!initialDataLoad ? (
//                         <>
//                             <div className="scrollable-content">
//                                 {/* Scrollable Content */}
//                                 <div className="scrollable-content">
//                                     <div className="form-group">
//                                         <label htmlFor="floor-select">
//                                             Select Floor
//                                         </label>
//                                         <Combobox
//                                             placeholder="Select Floor"
//                                             id="floor-select"
//                                             data={[
//                                                 ...(
//                                                     initialFilterDetails.floors ||
//                                                     []
//                                                 ).map((floor) => floor.floorName),
//                                             ]}
//                                             onChange={(value) =>
//                                                 setFloorId(
//                                                     initialFilterDetails.floors?.find(
//                                                         (floor) =>
//                                                             floor.floorName ===
//                                                             value
//                                                     )?.floor_id
//                                                 )
//                                             }
//                                         />
//                                     </div>

//                                     {/* Zone Combobox */}
//                                     <div className="form-group">
//                                         <label htmlFor="zone-select">
//                                             Select Zone
//                                         </label>

//                                         <Combobox
//                                             id="zone-select"
//                                             defaultValue={"ALL"}
//                                             data={[
//                                                 "ALL",
//                                                 ...(matchedFloor?.zones || []).map(
//                                                     (zone) => zone.name
//                                                 ),
//                                             ]}
//                                             onChange={(value) =>
//                                                 setZoneId(
//                                                     matchedFloor?.zones?.find(
//                                                         (zone) =>
//                                                             zone.name === value
//                                                     )?.zone_id || "ALL"
//                                                 )
//                                             }
//                                             disabled={!floorId}
//                                         />
//                                     </div>

//                                     {/* Asset Combobox */}
//                                     <div className="form-group">
//                                         <label htmlFor="asset-select">
//                                             Select Asset
//                                         </label>
//                                         <Combobox
//                                             id="asset-select"
//                                             defaultValue={"ALL"}
//                                             data={[
//                                                 "ALL",
//                                                 ...(
//                                                     initialFilterDetails.assets ||
//                                                     []
//                                                 ).map((asset) => asset.name),
//                                             ]}
//                                             onChange={(value) =>
//                                                 setAssetId(
//                                                     initialFilterDetails.assets?.find(
//                                                         (asset) =>
//                                                             asset.name === value
//                                                     )?.asset_id || "ALL"
//                                                 )
//                                             }
//                                             disabled={!floorId}
//                                         />
//                                     </div>

//                                     {/* Start Date and Time */}
//                                     <div className="form-group date-time-group">
//                                         <div>
//                                             <label htmlFor="start-date">
//                                                 Start Date
//                                             </label>
//                                             <input
//                                                 type="date"
//                                                 value={startDate}
//                                                 className="form-control"
//                                                 onChange={(e) =>
//                                                     setStartDate(e.target.value)
//                                                 }
//                                                 disabled={!floorId}
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="start-time">
//                                                 Start Time
//                                             </label>
//                                             <input
//                                                 id="start-time"
//                                                 type="time"
//                                                 className="form-control"
//                                                 value={startTime || ""}
//                                                 onChange={(e) =>
//                                                     setStartTime(e.target.value)
//                                                 }
//                                                 disabled={!floorId}
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* End Date and Time */}
//                                     <div className="form-group date-time-group">
//                                         <div>
//                                             <label htmlFor="end-date">
//                                                 End Date
//                                             </label>
//                                             <input
//                                                 type="date"
//                                                 value={endDate}
//                                                 className="form-control"
//                                                 onChange={(e) =>
//                                                     setEndDate(e.target.value)
//                                                 }
//                                                 disabled={!floorId}
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="end-time">
//                                                 End Time
//                                             </label>
//                                             <input
//                                                 id="end-time"
//                                                 type="time"
//                                                 className="form-control"
//                                                 value={endTime || ""}
//                                                 onChange={(e) =>
//                                                     setEndTime(e.target.value)
//                                                 }
//                                                 disabled={!floorId}
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {!getData ? (
//                                 <div className="timeline-controls">
//                                     <div className="current-time mb-3">
//                                         {currentTimestamp}
//                                     </div>

//                                     <div className="controls-group">
//                                         <Button
//                                             variant="outline-primary"
//                                             onClick={() => setCurrentFrameIndex(0)}
//                                             disabled={currentFrameIndex === 0}
//                                         >
//                                             <BsSkipStartFill />
//                                         </Button>
//                                         <Button
//                                             variant="outline-primary"
//                                             onClick={() =>
//                                                 setCurrentFrameIndex(
//                                                     Math.max(
//                                                         currentFrameIndex - 1,
//                                                         0
//                                                     )
//                                                 )
//                                             }
//                                             disabled={currentFrameIndex === 0}
//                                         >
//                                             <BsChevronLeft />
//                                         </Button>
//                                         <Button
//                                             variant={
//                                                 isPlaying ? "danger" : "success"
//                                             }
//                                             onClick={() => setIsPlaying(!isPlaying)}
//                                             disabled={
//                                                 timelineFrames.length === 0 ||
//                                                 currentFrameIndex >=
//                                                     timelineFrames.length - 1
//                                             }
//                                         >
//                                             {isPlaying ? (
//                                                 <BsPauseFill />
//                                             ) : (
//                                                 <BsPlayFill />
//                                             )}
//                                         </Button>
//                                         <Button
//                                             variant="outline-primary"
//                                             onClick={() =>
//                                                 setCurrentFrameIndex(
//                                                     Math.min(
//                                                         currentFrameIndex + 1,
//                                                         timelineFrames.length - 1
//                                                     )
//                                                 )
//                                             }
//                                             disabled={
//                                                 currentFrameIndex >=
//                                                 timelineFrames.length - 1
//                                             }
//                                         >
//                                             <BsChevronRight />
//                                         </Button>
//                                         <Button
//                                             variant="outline-primary"
//                                             onClick={() =>
//                                                 setCurrentFrameIndex(
//                                                     timelineFrames.length - 1
//                                                 )
//                                             }
//                                             disabled={
//                                                 currentFrameIndex >=
//                                                 timelineFrames.length - 1
//                                             }
//                                         >
//                                             <BsSkipEndFill />
//                                         </Button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <FetchingData />
//                             )}

//                             <Button
//                                 variant="primary"
//                                 className="apply-filters-btn"
//                                 onClick={handleSubmit}
//                             >
//                                 Apply Filters
//                             </Button>
//                         </>
//                     ) : (
//                         <div className="loading-container">
//                             <div className="loading-content">
//                                 <div
//                                     className="spinner-border text-primary loading-spinner"
//                                     role="status"
//                                 >
//                                     <span className="visually-hidden">
//                                         Fetching data...
//                                     </span>
//                                 </div>
//                                 <div className="loading-text mt-3">
//                                     <span className="text-primary fs-5 fw-semibold">
//                                         Fetching data...
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <DrawMapWithAssets
//                     zones={
//                         floorId !== ""
//                             ? mapDetails.find((floor) => floor.floor_id === floorId)
//                                   ?.zones || []
//                             : []
//                     }
//                     assetLocations={currentFrame.locations || []}
//                 />
//             </div>
//         </div>
//     );
// };

// export default PastTracking;


import React, { useEffect, useState } from "react";
import Combobox from "react-widgets/Combobox";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "./PastTracking.css";
import Button from "react-bootstrap/Button";
import DrawMapWithAssets from "../../components/DrawMapWithAssets/DrawMapWithAssets";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    BsSkipStartFill,
    BsChevronLeft,
    BsPlayFill,
    BsPauseFill,
    BsChevronRight,
    BsSkipEndFill,
} from "react-icons/bs";
import FetchingData from "../../components/FetchingData/FetchingData";
import NavBarOrgAdmin from "../../components/NavBarOrgAdmin/NavBarOrgAdmin";
import { useAuth } from "../../context/AuthContext"; // Import auth context

const PastTracking = () => {
    const { currentOrgId, user } = useAuth(); // Get org and user from auth context
    const [floorId, setFloorId] = useState("");
    const [zoneId, setZoneId] = useState("ALL");
    const [assetId, setAssetId] = useState("ALL");
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState("00:00");
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState("23:59");

    const [initialFilterDetails, setInitialFilterDetails] = useState({});
    const [timelineFrames, setTimelineFrames] = useState([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mapDetails, setMapDetails] = useState({});

    const [initialDataLoad, setInitialDataLoad] = useState(true);
    const [getData, setGetData] = useState(false);

    useEffect(() => {
        if (!currentOrgId || !user?.user_id) return; // Wait until IDs are available

        const fetchDataAndFilters = async () => {
            try {
                const mapResponse = await axios.get(
                    `http://localhost:8000/maps/${currentOrgId}/get-map`
                );
                setMapDetails(mapResponse.data);

                const filterResponse = await axios.get(
                    `http://localhost:8000/past-tracking/${currentOrgId}/${user.user_id}/get-past-tracking-filters-initial`
                );
                setInitialFilterDetails(filterResponse.data);
                setInitialDataLoad(false);
            } catch (err) {
                console.error("Error fetching data:", err.message);
                toast.error("Failed to load initial data");
            }
        };

        fetchDataAndFilters();
    }, [currentOrgId, user]); // Add dependencies

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentFrameIndex((prev) => {
                    if (prev >= timelineFrames.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timelineFrames.length]);

    const fetchLocations = async (filters) => {
        try {
            setGetData(true);
            const response = await axios.post(
                `http://localhost:8000/past-tracking/${currentOrgId}/past-tracking-locations`,
                {
                    ...filters,
                    user_id: user.user_id // Include user_id in the request body
                }
            );
            const sortedFrames = response.data.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
            setTimelineFrames(sortedFrames);
            setCurrentFrameIndex(0);
            setIsPlaying(false);
            setGetData(false);
        } catch (error) {
            console.error("Error fetching locations:", error);
            toast.error("Failed to fetch location data");
            setGetData(false);
        }
    };

    const handleSubmit = () => {
        if (!floorId) {
            toast.error("Please select a floor");
            return;
        }

        const filterData = {
            floor_id: floorId,
            zone_id: zoneId,
            asset_id: assetId,
            start_date: startDate
                ? new Date(startDate).toISOString().split("T")[0]
                : null,
            start_time: startTime ? `${startTime}:00` : null,
            end_date: endDate
                ? new Date(endDate).toISOString().split("T")[0]
                : null,
            end_time: endTime ? `${endTime}:00` : null,
        };

        fetchLocations(filterData);
    };

    const matchedFloor = (initialFilterDetails.floors || []).find(
        (floor) => floor.floor_id === floorId
    );

    const currentFrame = timelineFrames[currentFrameIndex] || {};
    const currentTimestamp = currentFrame.timestamp
        ? new Date(currentFrame.timestamp).toLocaleString()
        : "No data available";

    return (
        <div className="past-tracking-container">
            <NavBarOrgAdmin />
            <div style={{ display: "flex" }}>
                <ToastContainer position="top-right" autoClose={3000} />
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
                    {!initialDataLoad ? (
                        <>
                            <div className="scrollable-content">
                                {/* Scrollable Content */}
                                <div className="scrollable-content">
                                    <div className="form-group">
                                        <label htmlFor="floor-select">
                                            Select Floor
                                        </label>
                                        <Combobox
                                            placeholder="Select Floor"
                                            id="floor-select"
                                            data={[
                                                ...(
                                                    initialFilterDetails.floors ||
                                                    []
                                                ).map((floor) => floor.floorName),
                                            ]}
                                            onChange={(value) =>
                                                setFloorId(
                                                    initialFilterDetails.floors?.find(
                                                        (floor) =>
                                                            floor.floorName ===
                                                            value
                                                    )?.floor_id
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Zone Combobox */}
                                    <div className="form-group">
                                        <label htmlFor="zone-select">
                                            Select Zone
                                        </label>

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
                                                        (zone) =>
                                                            zone.name === value
                                                    )?.zone_id || "ALL"
                                                )
                                            }
                                            disabled={!floorId}
                                        />
                                    </div>

                                    {/* Asset Combobox */}
                                    <div className="form-group">
                                        <label htmlFor="asset-select">
                                            Select Asset
                                        </label>
                                        <Combobox
                                            id="asset-select"
                                            defaultValue={"ALL"}
                                            data={[
                                                "ALL",
                                                ...(
                                                    initialFilterDetails.assets ||
                                                    []
                                                ).map((asset) => asset.name),
                                            ]}
                                            onChange={(value) =>
                                                setAssetId(
                                                    initialFilterDetails.assets?.find(
                                                        (asset) =>
                                                            asset.name === value
                                                    )?.asset_id || "ALL"
                                                )
                                            }
                                            disabled={!floorId}
                                        />
                                    </div>

                                    {/* Start Date and Time */}
                                    <div className="form-group date-time-group">
                                        <div>
                                            <label htmlFor="start-date">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                className="form-control"
                                                onChange={(e) =>
                                                    setStartDate(e.target.value)
                                                }
                                                disabled={!floorId}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="start-time">
                                                Start Time
                                            </label>
                                            <input
                                                id="start-time"
                                                type="time"
                                                className="form-control"
                                                value={startTime || ""}
                                                onChange={(e) =>
                                                    setStartTime(e.target.value)
                                                }
                                                disabled={!floorId}
                                            />
                                        </div>
                                    </div>

                                    {/* End Date and Time */}
                                    <div className="form-group date-time-group">
                                        <div>
                                            <label htmlFor="end-date">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                className="form-control"
                                                onChange={(e) =>
                                                    setEndDate(e.target.value)
                                                }
                                                disabled={!floorId}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="end-time">
                                                End Time
                                            </label>
                                            <input
                                                id="end-time"
                                                type="time"
                                                className="form-control"
                                                value={endTime || ""}
                                                onChange={(e) =>
                                                    setEndTime(e.target.value)
                                                }
                                                disabled={!floorId}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!getData ? (
                                <div className="timeline-controls">
                                    <div className="current-time mb-3">
                                        {currentTimestamp}
                                    </div>

                                    <div className="controls-group">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setCurrentFrameIndex(0)}
                                            disabled={currentFrameIndex === 0}
                                        >
                                            <BsSkipStartFill />
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() =>
                                                setCurrentFrameIndex(
                                                    Math.max(
                                                        currentFrameIndex - 1,
                                                        0
                                                    )
                                                )
                                            }
                                            disabled={currentFrameIndex === 0}
                                        >
                                            <BsChevronLeft />
                                        </Button>
                                        <Button
                                            variant={
                                                isPlaying ? "danger" : "success"
                                            }
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            disabled={
                                                timelineFrames.length === 0 ||
                                                currentFrameIndex >=
                                                    timelineFrames.length - 1
                                            }
                                        >
                                            {isPlaying ? (
                                                <BsPauseFill />
                                            ) : (
                                                <BsPlayFill />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() =>
                                                setCurrentFrameIndex(
                                                    Math.min(
                                                        currentFrameIndex + 1,
                                                        timelineFrames.length - 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentFrameIndex >=
                                                timelineFrames.length - 1
                                            }
                                        >
                                            <BsChevronRight />
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() =>
                                                setCurrentFrameIndex(
                                                    timelineFrames.length - 1
                                                )
                                            }
                                            disabled={
                                                currentFrameIndex >=
                                                timelineFrames.length - 1
                                            }
                                        >
                                            <BsSkipEndFill />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <FetchingData />
                            )}

                            <Button
                                variant="primary"
                                className="apply-filters-btn"
                                onClick={handleSubmit}
                            >
                                Apply Filters
                            </Button>
                        </>
                    ) : (
                        <div className="loading-container">
                            <div className="loading-content">
                                <div
                                    className="spinner-border text-primary loading-spinner"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Fetching data...
                                    </span>
                                </div>
                                <div className="loading-text mt-3">
                                    <span className="text-primary fs-5 fw-semibold">
                                        Fetching data...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DrawMapWithAssets
                    zones={
                        floorId !== ""
                            ? mapDetails.find((floor) => floor.floor_id === floorId)
                                  ?.zones || []
                            : []
                    }
                    assetLocations={currentFrame.locations || []}
                />
            </div>
        </div>
    );
};

export default PastTracking;