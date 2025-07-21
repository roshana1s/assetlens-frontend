import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBarOrgUser.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";

const NavBarOrgUser = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [assets, setAssets] = useState({});
    const [floors, setFloors] = useState({});
    const [zones, setZones] = useState({});
    const [loadingAssets, setLoadingAssets] = useState(false);

    const { user, isGlobalAdmin, currentOrgId, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/user/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                setProfileData(response.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        if (showProfile) {
            fetchProfileData();
        }
    }, [showProfile]);

    useEffect(() => {
        const fetchAssetAndLocationData = async () => {
            if (showAlerts && currentOrgId) {
            }
        };

        fetchAssetAndLocationData();
    }, [currentOrgId]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const toggleProfile = () => {
        setShowAlerts(false);
        setShowProfile(!showProfile);
    };
    const toggleAlerts = () => {
        setShowAlerts(!showAlerts);
        setShowProfile(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="layout-container">
            <nav className="navbar-custom">
                <div className="brand">
                    <span className="brand-name">AssetLens</span>
                </div>
                <div className="nav-links">
                    <NavLink
                        to="/user/online-tracking"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-geo-alt"
                            viewBox="0 0 16 16"
                        >
                            <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                            <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                        </svg>
                        &nbsp;Online tracking
                    </NavLink>

                    <NavLink
                        to="/user/past-tracking"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-clock-history"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
                        </svg>
                        &nbsp;Past tracking
                    </NavLink>

                    <NavLink
                        to="/user/logs"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-journal-text"
                            viewBox="0 0 16 16"
                        >
                            <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                            <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                            <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
                        </svg>
                        &nbsp;Logs
                    </NavLink>

                    <NavLink
                        to="/user/dashboard"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-grid"
                            viewBox="0 0 16 16"
                        >
                            <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                        </svg>
                        &nbsp;Dashboard
                    </NavLink>
                </div>

                <div className="nav-icons">
                    <div className="icon-wrapper" onClick={toggleAlerts}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="alert-icon"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                        </svg>
                        {showAlerts && (
                            <div className="popup-box">No new alerts</div>
                        )}
                    </div>

                    <NotificationDropdown
                        userId={user?.id || user?._id}
                        orgId={currentOrgId}
                        userRole="user"
                    />

                    <div className="icon-wrapper" onClick={toggleProfile}>
                        {user?.image_link ? (
                            <img
                                src={user.image_link}
                                alt="Profile"
                                className="profile-image-navbar"
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid #2f6fed",
                                }}
                            />
                        ) : (
                            <div
                                className="profile-image-placeholder-navbar"
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "#e5e9fb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    color: "#2f6fed",
                                    border: "2px solid #2f6fed",
                                    fontSize: "12px",
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() ||
                                    user?.username?.charAt(0).toUpperCase() ||
                                    "U"}
                            </div>
                        )}
                        {showProfile && (
                            <div
                                className="profile-popup-box"
                                style={{ zIndex: 9999 }}
                            >
                                <div
                                    className="profile-header"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    {user?.image_link ? (
                                        <img
                                            src={
                                                user.image_link ||
                                                "https://firebasestorage.googleapis.com/v0/b/assetlens-b9f76.firebasestorage.app/o/default.png?alt=media&token=25cd23ac-7bf7-4b68-bdc6-76772f7361e1"
                                            }
                                            alt="Profile"
                                            className="profile-image"
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="profile-image-placeholder"
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                background: "#e5e9fb",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                color: "#2f6fed",
                                                fontSize: "18px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {user?.name
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div
                                        className="profile-info"
                                        style={{ flex: 1 }}
                                    >
                                        <p
                                            className="profile-greeting"
                                            style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                color: "#2f6fed",
                                            }}
                                        >
                                            Hi,{" "}
                                            {user?.name ||
                                                user?.username ||
                                                "User"}
                                            !
                                        </p>
                                        <h5
                                            className="profile-name"
                                            style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                                color: "#333",
                                            }}
                                        >
                                            {user?.name ||
                                                user?.username ||
                                                "User"}
                                        </h5>
                                        <p
                                            className="profile-role"
                                            style={{
                                                margin: "0 0 4px 0",
                                                fontSize: "12px",
                                                color: "#666",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {user?.role || "User"}
                                        </p>
                                        <p
                                            className="profile-email"
                                            style={{
                                                margin: "0",
                                                fontSize: "12px",
                                                color: "#888",
                                            }}
                                        >
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="profile-links">
                                    <NavLink
                                        to={
                                            user?.role === "user"
                                                ? "/user/profile"
                                                : "/admin/profile"
                                        }
                                        className="profile-link"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-person"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z" />
                                        </svg>
                                        &nbsp; My Profile
                                    </NavLink>
                                    <button
                                        className="profile-link logout-btn"
                                        onClick={handleLogout}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-box-arrow-right"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                                            />
                                        </svg>
                                        &nbsp; Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default NavBarOrgUser;
