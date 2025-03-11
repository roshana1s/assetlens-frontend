// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import { FaEye, FaEyeSlash } from "react-icons/fa"; 
// import "./LoginPage.css";

// const LoginPage = () => {
//   const [identifier, setIdentifier] = useState(""); 
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false); 
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new URLSearchParams();
//       formData.append("username", identifier); 
//       formData.append("password", password);

//       const response = await axios.post("http://127.0.0.1:8000/auth/token", formData, {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       });

//       console.log("Login successful:", response.data);

//       login(response.data.access_token);

//       if (response.data.dashboard_url) {
//         navigate(response.data.dashboard_url); 
//       } else {
//         navigate("/"); 
//       }
//     } catch (err) {
//       setError(err.response?.data?.detail || "Login failed. Please check your credentials and try again.");
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Login</h2>
//       <form className="login-form" onSubmit={handleLogin}>
//         <div className="input-group">
//           <label>Username or Email:</label>
//           <input
//             type="text"
//             value={identifier}
//             onChange={(e) => setIdentifier(e.target.value)}
//             required
//           />
//         </div>
//         <div className="input-group password-container">
//           <label>Password:</label>
//           <div className="password-wrapper">
//             <input
//               type={showPassword ? "text" : "password"} 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
//               {showPassword ? <FaEye /> : <FaEyeSlash />}
//             </span>
//           </div>
//         </div>
//         {error && <p className="error-message">{error}</p>}
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import "./LoginPage.css";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", identifier); 
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/auth/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      login(response.data.access_token);

      if (response.data.dashboard_url) {
        navigate(response.data.dashboard_url); 
      } else {
        navigate("/"); 
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label>Username or Email:</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="input-group password-container">
          <label>Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
        Forgot Password?
      </p>
    </div>
  );
};

export default LoginPage;
