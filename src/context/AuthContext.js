import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    loading: true 
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            return;
          }
          
          const userResponse = await axios.get('http://localhost:8000/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setAuthState({
            token,
            user: {
              id: decoded.sub,
              username: decoded.sub,
              role: decoded.role,
              org_id: decoded.org_id,
              is_global_admin: decoded.is_global_admin || false,
              ...userResponse.data 
            },
            isAuthenticated: true,
            loading: false
          });
        } catch (error) {
          console.error("Invalid token:", error);
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  
  const login = async (token, additionalUserData = {}) => {
  localStorage.setItem("token", token);
  const decoded = jwtDecode(token);
  
  try {
    const userResponse = await axios.get('http://localhost:8000/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setAuthState({
      token,
      user: {
        id: decoded.sub,
        username: decoded.sub,
        role: decoded.role,
        org_id: decoded.org_id,
        is_global_admin: decoded.is_global_admin || false,
        dashboard_url: additionalUserData.dashboard_url, // Add this line
        ...userResponse.data,
        ...additionalUserData // Spread additional data
      },
      isAuthenticated: true,
      loading: false
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    logout();
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout,
      currentOrgId: authState.user?.org_id,
      isGlobalAdmin: authState.user?.is_global_admin || false
    }}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);