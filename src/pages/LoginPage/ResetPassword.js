import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiArrowLeft, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/reset-password", 
        { token, new_password: newPassword }
      );
      setMessage(response.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Please try again.");
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="deco-circle deco-1"></div>
      <div className="deco-circle deco-2"></div>
      
      <motion.div 
        className="reset-password-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="back-button" onClick={() => navigate("/login")}>
          <FiArrowLeft />
        </div>

        <div className="form-header">
          <div className="form-icon">
            <FiLock />
          </div>
          <h2>Create New Password</h2>
          <p>Enter and confirm your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="reset-password-form">
        <div className="input-group">
  <label htmlFor="newPassword">New Password</label>
  <div className="password-input">
    <input
      id="newPassword"
      type={showPassword ? "text" : "password"} 
      placeholder="Enter new password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
    />
    <span onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <FiEye /> : <FiEyeOff />} 
    </span>
  </div>
</div>

<div className="input-group">
  <label htmlFor="confirmPassword">Confirm Password</label>
  <div className="password-input">
    <input
      id="confirmPassword"
      type={showConfirmPassword ? "text" : "password"} 
      placeholder="Confirm new password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
      {showConfirmPassword ? <FiEye /> : <FiEyeOff />} 
    </span>
  </div>
</div>

          {message && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              "Reset Password"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;