import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; 

const LoginPage = () => {
    const [username, setUsername] = useState("");  // Changed from "email" to "username"
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const formData = new URLSearchParams();
            formData.append("username", username);  // Ensure the correct key is used
            formData.append("password", password);

            const response = await axios.post("http://127.0.0.1:8000/auth/token", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            console.log("Login successful:", response.data);

            localStorage.setItem("access_token", response.data.access_token); // Store token

            if (response.data.dashboard_url) {
                navigate(response.data.dashboard_url);
            } else {
                navigate("/dashboard"); // Default redirection
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed. Please check your credentials and try again.");
        }
    };
    

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>  {/* Changed from Email to Username */}
                    <input
                        type="text"  // Changed from email to text
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
