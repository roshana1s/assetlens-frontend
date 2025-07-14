import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 20px",
        backgroundColor: "#DBE0F5", 
        color: "#3674B5", 
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(54, 116, 181, 0.1)",
      }}
      onClick={handleLogout}
      whileHover={{
        scale: 1.05,
        backgroundColor: "#3674B5", 
        color: "#FFFFFF", 
        boxShadow: "0 4px 12px rgba(54, 116, 181, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <FiLogOut style={{ marginRight: "8px", fontSize: "16px", transition: "all 0.3s ease" }} />
      Logout
    </motion.button>
  );
};

export default LogoutButton;