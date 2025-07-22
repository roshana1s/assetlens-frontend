import React, { useState } from "react";
import LogoutButton from "../../components/Logout/LogoutButton";
import ManageOrganizationPage from "../mangeOrganizationPage/organization";
import ProfilePage from "../ProfilePage/ProfilePage";
import OrdersManagement from "../../components/Orders/OrdersManagement";
import "./AssetLensAdminDashboard.css";

const AssetLensAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("orders");

    const renderContent = () => {
        switch (activeTab) {
            case "orders":
                return (
                    <div className="dashboard-content">
                        <OrdersManagement />
                    </div>
                );
            case "organizations":
                return (
                    <div className="dashboard-content">
                        <ManageOrganizationPage />
                    </div>
                );
            case "profile":
                return (
                    <div className="dashboard-content">
                        <ProfilePage />
                    </div>
                );
            default:
                return (
                    <div className="dashboard-content">
                        <h2>Welcome to AssetLens Admin Dashboard</h2>
                        <div className="placeholder-content">
                            <p>Select a section from the sidebar to begin</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="assetlens-admin-dashboard">
            <div className="dashboard-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h3>AssetLens Admin</h3>
                        <p>System Administration</p>
                    </div>
                    <ul className="sidebar-menu">
                        <li
                            className={activeTab === "orders" ? "active" : ""}
                            onClick={() => setActiveTab("orders")}
                        >
                            <span className="menu-icon">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 4H5v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5z"/>
                                </svg>
                            </span>
                            <span className="menu-text">Orders</span>
                        </li>
                        <li
                            className={activeTab === "organizations" ? "active" : ""}
                            onClick={() => setActiveTab("organizations")}
                        >
                            <span className="menu-icon">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                    <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                                    <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                                </svg>
                            </span>
                            <span className="menu-text">Organizations</span>
                        </li>
                        <li
                            className={activeTab === "profile" ? "active" : ""}
                            onClick={() => setActiveTab("profile")}
                        >
                            <span className="menu-icon">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                                </svg>
                            </span>
                            <span className="menu-text">Profile</span>
                        </li>
                    </ul>
                    <div className="sidebar-footer">
                        <LogoutButton />
                    </div>
                </div>
                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AssetLensAdminDashboard;


