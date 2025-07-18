import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import "./LoginPage.css";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && user.dashboard_url) {
      navigate(user.dashboard_url);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const formData = new URLSearchParams();
      formData.append("username", identifier);
      formData.append("password", password);

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/token",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      await login(response.data.access_token, {
        username: response.data.username,
        role: response.data.role,
        org_id: response.data.org_id,
      });

      navigate(response.data.dashboard_url || "/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-blur"></div>
      </div>

      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-box">
          <div className="back-btn" onClick={() => navigate("/")}>
            <FaArrowLeft />
          </div>

          <div className="login-header">
            {/* <img src="/logo.svg" alt="AssetLens Logo" className="logo" /> */}
            <h2>Welcome to AssetLens</h2>
            <p>Secure access to your digital assets</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username or Email</label>
              <input
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-container">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-footer">
              <motion.button 
                type="submit" 
                className="login-btn" 
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  "Login"
                )}
              </motion.button>

              <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </p>
            </div>
          </form>
  
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;