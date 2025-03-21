import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); 

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [role, setRole] = useState(() => localStorage.getItem("role")); // NEW: Store role
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     const storedRole = localStorage.getItem("role");

//     if (storedToken) {
//       setToken(storedToken);
//       setRole(storedRole); // Retrieve stored role
//     }

//     setLoading(false);
//   }, []);

//   const login = (newToken, userRole) => {
//     localStorage.setItem("token", newToken);
//     localStorage.setItem("role", userRole); // Store role
//     setToken(newToken);
//     setRole(userRole);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role"); // Remove role
//     setToken(null);
//     setRole(null);
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, login, logout, isAuthenticated: !!token, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



