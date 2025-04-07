// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaMapMarkerAlt, FaMap, FaBell, FaSearch, FaFileDownload, FaRobot } from "react-icons/fa";
// import "./LandingPage.css"; 

// const LandingPage = () => {
//     const navigate = useNavigate();
//     const formRef = useRef(null);
//     const [email, setEmail] = useState("");
//     const [message, setMessage] = useState("");

//     const handleBookDemoClick = () => {
//         formRef.current.scrollIntoView({ behavior: "smooth" });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log(`Email: ${email}, Message: ${message}`);
//         alert("Your message has been sent!");
//         setEmail("");
//         setMessage("");
//     };

//     return (
//         <div className="landing-page">
            
//             <nav className="navbar">
//                 <div className="logo">AssetLens</div>
//                 <div className="nav-buttons">
//                     <button onClick={handleBookDemoClick}>Book Demo</button>
//                     <button onClick={() => navigate("/login")}>Login</button>
//                 </div>
//             </nav>

//             <div className="hero-section">
//                 <h1>AssetLens</h1>
//                 <p>Effortlessly Track, Monitor, and Secure Your Assets in Real-Time.</p>
//                 <button onClick={handleBookDemoClick}>Book Demo</button>
//             </div>

//             <div className="contact-form" ref={formRef}>
//                 <h2>Track, Monitor, and Secure Your Assets in Real-Time</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input 
//                         type="email" 
//                         placeholder="Your Email" 
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required 
//                     />
//                     <textarea 
//                         placeholder="Your Message" 
//                         value={message}
//                         onChange={(e) => setMessage(e.target.value)}
//                         required 
//                     />
//                     <button type="submit">Send Message</button>
//                 </form>
//             </div>

//             <section className="who-are-we-section">
//     <div className="container">
//         <h2>Who Are We?</h2>
//         <p>At AssetLens, we are at the forefront of innovation, offering a real-time asset tracking and management solution. By using IoT and AI technologies, we empower businesses to securely monitor, track, and optimize their assets with precision and efficiency. Our mission is to transform asset management into a seamless, transparent, and data-driven process, delivering insights that drive smarter decisions and enhance operational excellence.</p>
//     </div>
// </section>

           
//             <section className="features-section">
//                 <h2>Key Features of AssetLens</h2>
//                 <div className="features-grid">
//                     <div className="feature">
//                         <FaMapMarkerAlt className="feature-icon"/>
//                         <div>
//                             <h4>Real-Time Asset Positioning</h4>
//                             <p>Track the exact location of your assets anytime.</p>
//                         </div>
//                     </div>
//                     <div className="feature">
//                         <FaMap className="feature-icon"/>
//                         <div>
//                             <h4>Floor Map Visualization</h4>
//                             <p>View asset movements on interactive floor maps.</p>
//                         </div>
//                     </div>
//                     <div className="feature">
//                         <FaBell className="feature-icon"/>
//                         <div>
//                             <h4>Geofencing & Alerts</h4>
//                             <p>Receive instant alerts when assets leave designated areas.</p>
//                         </div>
//                     </div>
//                     <div className="feature">
//                         <FaSearch className="feature-icon"/>
//                         <div>
//                             <h4>Asset Search & Filter</h4>
//                             <p>Easily find assets using powerful search and filter options.</p>
//                         </div>
//                     </div>
//                     <div className="feature">
//                         <FaFileDownload className="feature-icon"/>
//                         <div>
//                             <h4>Download Reports & Footages</h4>
//                             <p>Generate detailed reports and retrieve asset tracking data.</p>
//                         </div>
//                     </div>
//                     <div className="feature">
//                         <FaRobot className="feature-icon"/>
//                         <div>
//                             <h4>AI Chatbot Assistance</h4>
//                             <p>Get instant help from our AI-powered assistant.</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>


//         </div>
//     );
// };

// export default LandingPage;


import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaMap, FaBell, FaSearch, FaFileDownload, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import "./LandingPage.css";

const LandingPage = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleBookDemoClick = () => {
        formRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Email: ${email}, Message: ${message}`);
        alert("Thank you for your interest! We'll contact you shortly.");
        setEmail("");
        setMessage("");
    };

    const features = [
        {
            icon: <FaMapMarkerAlt className="feature-icon"/>,
            title: "Real-Time Asset Positioning",
            description: "Track the exact location of your assets anytime, anywhere with precision."
        },
        {
            icon: <FaMap className="feature-icon"/>,
            title: "Floor Map Visualization",
            description: "Interactive floor maps showing asset movements in real-time."
        },
        {
            icon: <FaBell className="feature-icon"/>,
            title: "Geofencing & Alerts",
            description: "Instant notifications when assets leave designated areas."
        },
        {
            icon: <FaSearch className="feature-icon"/>,
            title: "Asset Search & Filter",
            description: "Powerful search tools to quickly locate any asset."
        },
        {
            icon: <FaFileDownload className="feature-icon"/>,
            title: "Download Reports & Footages",
            description: "Generate comprehensive reports with one click."
        },
        {
            icon: <FaRobot className="feature-icon"/>,
            title: "AI Chatbot Assistance",
            description: "24/7 intelligent support for all your asset queries."
        }
    ];

    return (
        <div className="landing-page">
            <div className="deco-circle deco-1"></div>
            <div className="deco-circle deco-2"></div>
            <div className="deco-blur"></div>

            <nav className="navbar">
                <motion.div 
                    className="logo"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="logo-icon">AL</span>
                    <span>AssetLens</span>
                </motion.div>
                <div className="nav-buttons">
                    <motion.button 
                        onClick={handleBookDemoClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Book Demo
                    </motion.button>
                    <motion.button 
                        onClick={() => navigate("/login")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login
                    </motion.button>
                </div>
            </nav>

            <section className="hero-section">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Real Time Asset Tracking <span>Reimagined</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Effortlessly Track, Monitor, and Secure Your Assets with AI-Powered Precision
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <button 
                            onClick={handleBookDemoClick}
                            className="cta-button"
                        >
                            Get Started
                        </button>
                    </motion.div>
                </div>
                <div className="hero-image">
                    {/* <img src="./image.png" alt="AssetLens Dashboard" /> */}
                    <img src="./image.png" alt="AssetLens Dashboard" />
                </div>
            </section>

            <section className="about-section">
                <div className="about-content">
                    <h2>Who We Are</h2>
                    <p className="about-text">
                        At <strong>AssetLens</strong>, we're revolutionizing asset management through cutting-edge IoT and AI technologies. 
                        Our platform transforms how businesses track, monitor, and optimize their valuable assets, delivering 
                        unprecedented visibility and control.
                    </p>
                    <div className="stats-container">
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Monitoring</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="section-header">
                    <h2>AssetLens Features</h2>
                    <p>Everything you need for a seamless asset tracking</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="feature-icon-container">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="contact-section" ref={formRef}>
                <div className="contact-container">
                    <div className="contact-info">
                        <h2>Ready to Transform Your Asset Tracking?</h2>
                        <p>Schedule a demo to see AssetLens in action and discover how we can help your business.</p>
                        <div className="contact-details">
                            <div className="contact-item">
                                <span>Email:</span> assetlensai@gmail.com
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <h3>Contact Us</h3>
                        <div className="form-group">
                            <input 
                                type="email" 
                                placeholder="Your Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <textarea 
                                placeholder="Your Message" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required 
                            />
                        </div>
                        <motion.button 
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Send Message
                        </motion.button>
                    </form>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;