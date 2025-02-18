import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; 

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1>Welcome to AssetLens</h1>
            <button onClick={() => navigate("/place-order")}>Place Order</button>
            <button onClick={() => navigate("/login")}>Login</button>
        </div>
    );
};

export default LandingPage;
