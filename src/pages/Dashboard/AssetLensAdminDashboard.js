import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AssetLensAdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false); 
    }, []);

    if (loading) {
        return <div className="container mt-5 text-center"><h2>Loading...</h2></div>;
    }

    if (!token) {
        return (
            <div className="container mt-5 text-center">
                <h2>Access Denied</h2>
                <p className="text-danger">You are not authorized to view this page.</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/login")}>
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 text-center">
            <h2>AssetLens Admin Dashboard</h2>
            <button className="btn btn-primary mt-3">Add New Organization</button>
        </div>
    );
};

export default AssetLensAdminDashboard;
