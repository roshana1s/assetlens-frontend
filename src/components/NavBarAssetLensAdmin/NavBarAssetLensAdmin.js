import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NavBarAssetLensAdmin.css";

const NavBarAssetLensAdmin = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navbarRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActiveTab = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="navbar-assetlens-admin" ref={navbarRef}>
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand">
                    <h3>AssetLens Admin</h3>
                </div>
            </div>
        </nav>
    );
};

export default NavBarAssetLensAdmin;
