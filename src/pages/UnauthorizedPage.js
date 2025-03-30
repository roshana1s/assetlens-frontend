import React from "react";
import { useNavigate } from "react-router-dom";
import "./UnauthorizedPage.css"; 

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <div className="error-icon">⚠️</div>
                <h1>403 - Access Denied</h1>
                <p className="error-message">
                    You don't have permission to access this page.
                </p>
                <p className="error-details">
                    Please contact your administrator if you believe this is an error.
                </p>
                <div className="action-buttons">
                    <button 
                        className="btn back-btn"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </button>
                    <button 
                        className="btn home-btn"
                        onClick={() => navigate("/")}
                    >
                        Home Page
                    </button>
                    <button 
                        
                        onClick={() => navigate("/login")}
                    >
                        Login Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;