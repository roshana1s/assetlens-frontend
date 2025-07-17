import React, { useEffect, useState, useRef } from "react";
import Combobox from "react-widgets/Combobox";
import axios from "axios";
import "./OnlineTracking.css";
import DrawMapWithAssets from "../../components/DrawMapWithAssets/DrawMapWithAssets";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FetchingData from "../../components/FetchingData/FetchingData";

const OnlineTracking = () => {
    const org_id = 1;
    const user_id = "u0002";

    const [floorId, setFloorId] = useState("");
    const [zoneId, setZoneId] = useState("ALL");
    const [assetId, setAssetId] = useState("ALL");
    const [initialFilterDetails, setInitialFilterDetails] = useState({});
    const [mapDetails, setMapDetails] = useState([]);
    const [liveLocations, setLiveLocations] = useState({});
    const [initialDataLoad, setInitialDataLoad] = useState(true);

    const ws = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const mapRes = await axios.get(
                    `http://localhost:8000/maps/1/get-map`
                );
                setMapDetails(mapRes.data);

                const filterRes = await axios.get(
                    `http://localhost:8000/online-tracking/1/u0002/get-online-tracking-filters-initial`
                );
                setInitialFilterDetails(filterRes.data);
                setInitialDataLoad(false);
            } catch (err) {
                console.error("Error fetching initial data", err);
                toast.error("Failed to load filters or map data");
                setInitialDataLoad(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const socketUrl = `ws://localhost:8000/ws/online-tracking/${org_id}/${user_id}`;
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLiveLocations(data);
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed:", event);
        };
    }, []);

    const matchedFloor = (initialFilterDetails.floors || []).find(
        (floor) => floor.floor_id === floorId
    );

    const filteredLocations =
        floorId !== ""
            ? (liveLocations.locations || []).filter((loc) => {
                  const zoneMatch = zoneId === "ALL" || loc.zone_id === zoneId;
                  const assetMatch =
                      assetId === "ALL" || loc.asset_id === assetId;
                  return zoneMatch && assetMatch;
              })
            : [];

    return (
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
                    <span className="ms-2">Online Tracking</span>
                </span>

                {!initialDataLoad ? (
                    <div className="scrollable-content">
                        {/* Floor Combobox */}
                        <div className="form-group">
                            <label htmlFor="floor-select">Select Floor</label>
                            <Combobox
                                placeholder="Select Floor"
                                id="floor-select"
                                data={(initialFilterDetails.floors || []).map(
                                    (floor) => floor.floorName
                                )}
                                onChange={(value) =>
                                    setFloorId(
                                        initialFilterDetails.floors?.find(
                                            (floor) => floor.floorName === value
                                        )?.floor_id
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
                                disabled={!floorId}
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
                                disabled={!floorId}
                            />
                        </div>
                    </div>
                ) : (
                    <FetchingData />
                )}
            </div>

            <DrawMapWithAssets
                zones={
                    floorId !== ""
                        ? mapDetails.find((floor) => floor.floor_id === floorId)
                              ?.zones || []
                        : []
                }
                assetLocations={filteredLocations}
            />
        </div>
    );
};

export default OnlineTracking;
