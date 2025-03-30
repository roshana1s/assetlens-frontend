import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";


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
          
          setAuthState({
            token,
            user: {
              username: decoded.sub,
              role: decoded.role,
              org_id: decoded.org_id
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

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setAuthState({
      token,
      user: {
        username: decoded.sub,
        role: decoded.role,
        org_id: decoded.org_id,
        ...userData
      },
      isAuthenticated: true,
      loading: false
    });
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
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
