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
                    <img src="https://i.imgur.com/N42HUc8.jpeg" alt="AssetLens Dashboard" />
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