import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiHome, FiLogIn } from "react-icons/fi";
import "./UnauthorizedPage.css";

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-page">
            <div className="deco-circle deco-1"></div>
            <div className="deco-circle deco-2"></div>
            
            <div className="unauthorized-container">
                <div className="unauthorized-content">
                    <div className="error-icon">
                        <FiAlertTriangle />
                    </div>
                    <h1 className="error-title">403 Access Restricted</h1>
                    <p className="error-message">
                        You don't have permission to view this page
                    </p>
                    <p className="error-details">
                        Please contact your administrator or try signing in with different credentials
                    </p>
                    
                    <div className="action-buttons">
                        <button 
                            className="btn back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <FiArrowLeft className="btn-icon" />
                            Go Back
                        </button>
                        <button 
                            className="btn home-btn"
                            onClick={() => navigate("/")}
                        >
                            <FiHome className="btn-icon" />
                            Home Page
                        </button>
                    </div>
                    
                    <div 
                        className="login-again"
                        onClick={() => navigate("/login")}
                    >
                        <FiLogIn className="btn-icon" />
                        Login Again
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;