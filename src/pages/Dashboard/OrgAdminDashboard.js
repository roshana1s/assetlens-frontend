// import React, { useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import LogoutButton from "../../components/Logout/LogoutButton";
// import NavBarOrgAdmin from "../../components/NavBarOrgAdmin/NavBarOrgAdmin";
// import HeatmapPage from "../Dashboard/Heatmap/HeatmapPage";
// import ProfilePage from "../../pages/ProfilePage/ProfilePage";
// import AssetDetails from "../../pages/AssetDetails/AssetDetails";
// import ChatBot from "../../components/ChatBot/ChatBot";
// import "./OrgAdminDashboard.css";

// const OrgAdminDashboard = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState("analytics");

//   const icons = {
//     analytics: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 7 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
//       </svg>
//     ),
//     reports: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm2 5.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-.245S4 12 8 12s5 1.755 5 1.755z"/>
//       </svg>
//     ),
//     assets: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 5v5h6V5H1zm8 0v5h6V5H9zm1 1h4v3h-4V6z"/>
//       </svg>
//     ),
//     camera: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
//       </svg>
//     ),
//     profile: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
//       </svg>
//     ),
//     dashboard: (
//       <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//         <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
//         <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
//       </svg>
//     )
//   };

//   const renderContent = () => {
//     switch (activeTab) {      case "analytics":
//         return (
//           <div className="dashboard-content">
//                   <div className="analytics-grid">
//               <div className="analytics-card heatmap-card">
//                 <h3>
//                   <span className="stats-icon">
//                     <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
//                       <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
//                       <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
//                     </svg>
//                   </span>
//                   Asset Movement Heatmap
//                 </h3>
//                 <div className="heatmap-container">
//                   <HeatmapPage />
//                 </div>
//               </div>
//               <div className="stats-row">
//                 <div className="stats-card">
//                   <div className="stats-header">
//                     <span className="stats-icon">
//                       <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
//                         <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
//                       </svg>
//                     </span>
//                     <h4 className="stats-title">Most Active Assets</h4>
//                   </div>
//                   <div className="stats-content">
//                     <div className="placeholder-content">
//                       <p>Most used assets data will be displayed here</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="stats-card">
//                   <div className="stats-header">
//                     <span className="stats-icon">
//                       <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
//                         <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
//                         <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
//                       </svg>
//                     </span>
//                     <h4 className="stats-title">Least Active Assets</h4>
//                   </div>
//                   <div className="stats-content">
//                     <div className="placeholder-content">
//                       <p>Least used assets data will be displayed here</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case "reports":
//         return (
//           <div className="dashboard-content">
//             <h2>Reports</h2>
//             <div className="placeholder-content">
//               <p>Reports functionality will be implemented here</p>
//             </div>
//           </div>
//         );
//       case "assets":
//         return (
//           <div className="dashboard-content">
//             <h2>Asset Management</h2>
//             <div className="placeholder-content">
              
//               <AssetDetails />
//             </div>
//           </div>
//         );
//       case "camera":
//         return (
//           <div className="dashboard-content">
//             <h2>Camera Feed</h2>
//             <div className="placeholder-content">
//               <p>Camera feed and controls will be implemented here</p>
//             </div>
//           </div>
//         );
//       case "profile":
//         return (
//           <div className="dashboard-content">
//             <ProfilePage />
//           </div>
//         );
//       default:
//         return (
//           <div className="dashboard-content">
//             <h2>Welcome to Organization Admin Dashboard</h2>
//             <div className="placeholder-content">
//               <p>Select a section from the sidebar to begin</p>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="org-admin-dashboard">
//       <NavBarOrgAdmin />
//       <div className="dashboard-container">
//         <div className="sidebar">
//           <div className="sidebar-header">
//             <span className="sidebar-brand-icon">{icons.dashboard}</span>
//             <h3>AssetLens</h3>
//             <p>Organization Admin</p>
//           </div>
//           <ul className="sidebar-menu">
//             <li
//               className={activeTab === "analytics" ? "active" : ""}
//               onClick={() => setActiveTab("analytics")}
//             >
//               <span className="menu-icon">{icons.analytics}</span>
//               <span className="menu-text">Analytics</span>
//             </li>
//             <li
//               className={activeTab === "reports" ? "active" : ""}
//               onClick={() => setActiveTab("reports")}
//             >
//               <span className="menu-icon">{icons.reports}</span>
//               <span className="menu-text">Reports</span>
//             </li>
//             <li
//               className={activeTab === "assets" ? "active" : ""}
//               onClick={() => setActiveTab("assets")}
//             >
//               <span className="menu-icon">{icons.assets}</span>
//               <span className="menu-text">Assets</span>
//             </li>
//             <li
//               className={activeTab === "camera" ? "active" : ""}
//               onClick={() => setActiveTab("camera")}
//             >
//               <span className="menu-icon">{icons.camera}</span>
//               <span className="menu-text">Camera</span>
//             </li>
//             <li
//               className={activeTab === "profile" ? "active" : ""}
//               onClick={() => setActiveTab("profile")}
//             >
//               <span className="menu-icon">{icons.profile}</span>
//               <span className="menu-text">User Profile</span>
//             </li>
//           </ul>
//           <div className="sidebar-footer">
//             <LogoutButton />
//           </div>
//         </div>
//         <div className="main-content">
//           {renderContent()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrgAdminDashboard;

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/Logout/LogoutButton";
import NavBarOrgAdmin from "../../components/NavBarOrgAdmin/NavBarOrgAdmin";
import HeatmapPage from "../Dashboard/Heatmap/HeatmapPage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import AssetDetails from "../../pages/AssetDetails/AssetDetails";
import ChatBot from "../../components/ChatBot/ChatBot";
import "./OrgAdminDashboard.css";

const OrgAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const [showChatbot, setShowChatbot] = useState(false);

  const icons = {
    analytics: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 7 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
      </svg>
    ),
    reports: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm2 5.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-.245S4 12 8 12s5 1.755 5 1.755z"/>
      </svg>
    ),
    assets: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 5v5h6V5H1zm8 0v5h6V5H9zm1 1h4v3h-4V6z"/>
      </svg>
    ),
    camera: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
      </svg>
    ),
    profile: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
      </svg>
    ),
    dashboard: (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
      </svg>
    )
  };

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="dashboard-content">
            <div className="analytics-grid">
              <div className="analytics-card heatmap-card">
                <h3>
                  <span className="stats-icon">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                  </span>
                  Asset Movement Heatmap
                </h3>
                <div className="heatmap-container">
                  <HeatmapPage />
                </div>
              </div>
              <div className="stats-row">
                <div className="stats-card">
                  <div className="stats-header">
                    <span className="stats-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </span>
                    <h4 className="stats-title">Most Active Assets</h4>
                  </div>
                  <div className="stats-content">
                    <div className="placeholder-content">
                      <p>Most used assets data will be displayed here</p>
                    </div>
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-header">
                    <span className="stats-icon">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                      </svg>
                    </span>
                    <h4 className="stats-title">Least Active Assets</h4>
                  </div>
                  <div className="stats-content">
                    <div className="placeholder-content">
                      <p>Least used assets data will be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="dashboard-content">
            <h2>Reports</h2>
            <div className="placeholder-content">
              <p>Reports functionality will be implemented here</p>
            </div>
          </div>
        );
      case "assets":
        return (
          <div className="dashboard-content">
            <h2>Asset Management</h2>
            <div className="placeholder-content">
              <AssetDetails />
            </div>
          </div>
        );
      case "camera":
        return (
          <div className="dashboard-content">
            <h2>Camera Feed</h2>
            <div className="placeholder-content">
              <p>Camera feed and controls will be implemented here</p>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="dashboard-content">
            <ProfilePage />
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h2>Welcome to Organization Admin Dashboard</h2>
            <div className="placeholder-content">
              <p>Select a section from the sidebar to begin</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="org-admin-dashboard">
      <NavBarOrgAdmin />
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-brand-icon">{icons.dashboard}</span>
            <h3>AssetLens</h3>
            <p>Organization Admin</p>
          </div>
          <ul className="sidebar-menu">
            <li
              className={activeTab === "analytics" ? "active" : ""}
              onClick={() => setActiveTab("analytics")}
            >
              <span className="menu-icon">{icons.analytics}</span>
              <span className="menu-text">Analytics</span>
            </li>
            <li
              className={activeTab === "reports" ? "active" : ""}
              onClick={() => setActiveTab("reports")}
            >
              <span className="menu-icon">{icons.reports}</span>
              <span className="menu-text">Reports</span>
            </li>
            <li
              className={activeTab === "assets" ? "active" : ""}
              onClick={() => setActiveTab("assets")}
            >
              <span className="menu-icon">{icons.assets}</span>
              <span className="menu-text">Assets</span>
            </li>
            <li
              className={activeTab === "camera" ? "active" : ""}
              onClick={() => setActiveTab("camera")}
            >
              <span className="menu-icon">{icons.camera}</span>
              <span className="menu-text">Camera</span>
            </li>
            <li
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <span className="menu-icon">{icons.profile}</span>
              <span className="menu-text">User Profile</span>
            </li>
          </ul>
          <div className="sidebar-footer">
            <LogoutButton />
          </div>
        </div>
        <div className="main-content">
          {renderContent()}
        </div>
      </div>

      {/* Chatbot Implementation */}
      <div className={`chatbot-container ${showChatbot ? "visible" : ""}`}>
        {showChatbot && <ChatBot />}
        <button 
          className="chatbot-toggle-btn"
          onClick={() => setShowChatbot(!showChatbot)}
        >
          {showChatbot ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12H16M12 8V16M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;