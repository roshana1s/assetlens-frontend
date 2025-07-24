import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import "./ChatBot.css";
import { Button, Card, Spinner } from "react-bootstrap";
import * as Babel from "@babel/standalone";
import { useAuth } from "../../context/AuthContext";

const ChatBot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesContainerRef = useRef(null);

    function sanitizeJSX(input) {
        return input
            .replace(/<(?=\s|$)/g, "")
            .replace(/<\/?([a-zA-Z0-9.]+)(\s*[^>]*)>/g, (match, tag, rest) => {
                if (match.startsWith("</")) return `</${tag}>`;
                return `<${tag}${rest}>`;
            })
            .replace(/<\/([a-zA-Z0-9.]+)\s+>/g, "</$1>")
            .replace(
                /(<(br|hr|img|input|meta|link|source)[^>]*)(?<!\/)>/g,
                "$1 />"
            )
            .replace(/&nbsp;/g, " ")
            .replace(/<([a-z.]+)([^>]*)>(\s*)<\/\1>/gi, "")
            .replace(/<[^>]*$/, "")
            .trim();
    }

    function compileJSX(jsxString) {
        const trimmed = jsxString.trim();
        const isJSX =
            trimmed.startsWith("<") ||
            trimmed.startsWith("(") ||
            trimmed.startsWith("<>") ||
            trimmed.includes("<") ||
            trimmed.includes("</");

        if (!isJSX) {
            return trimmed;
        }

        jsxString = sanitizeJSX(jsxString);
        try {
            const code = Babel.transform(`(${jsxString})`, {
                presets: ["react"],
            }).code;
            // eslint-disable-next-line no-new-func
            return new Function("React", "Card", "Button", `return ${code}`)(
                React,
                Card,
                Button
            );
        } catch (err) {
            console.error("JSX Compilation Error:", err);
            return "⚠️ Error rendering message";
        }
    }

    useEffect(() => {
        // get chat history
        const getChatHistory = async (user_id) => {
            try {
                if (!user || !user.org_id) return;
                const response = await axios.get(
                    `http://localhost:8000/chat/${user.org_id}/chat-history/${user_id}`
                );
                if (response.data && response.data.length > 0) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        };
        getChatHistory("u0003");
    }, []);

    // Auto-scroll to bottom when messages change or chat opens
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        // Add user message
        const userMsg = {
            type: "user",
            message: newMessage,
        };
        setMessages([...messages, userMsg]);

        // Send message to the agent
        const sendMessage = async (message) => {
            setLoading(true);
            try {
                if (!user || !user.org_id) return;
                console.log(message);
                const response = await axios.post(
                    `http://localhost:8000/chat/${user.org_id}/chatbot/${user.user_id}`,
                    {
                        user_query: message,
                    }
                );
                const botMsg = {
                    type: "AssetLens Virtual Assistant",
                    message: response.data.answer,
                };
                setMessages((prev) => [...prev, botMsg]);
            } catch (error) {
                console.error("Error sending message:", error);
            } finally {
                setLoading(false);
            }
        };

        sendMessage(newMessage);
        setNewMessage("");
    };

    return (
        <div className="chatbot-container">
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <FaRobot className="chatbot-icon" />
                            <span>AssetLens Virtual Assistant</span>
                        </div>
                        <button
                            className="chatbot-close-btn"
                            onClick={toggleChat}
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div
                        className="chatbot-messages"
                        ref={messagesContainerRef}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${
                                    message.type === "user"
                                        ? "chatbot-user-message"
                                        : "chatbot-bot-message"
                                }`}
                            >
                                <div className="chatbot-message-content">
                                    {compileJSX(message.message)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-message chatbot-bot-message">
                                <div className="chatbot-message-content">
                                    <Spinner animation="border" size="sm" />{" "}
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>
                    <form
                        onSubmit={handleSendMessage}
                        className="chatbot-input"
                    >
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit" className="chatbot-send-btn">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            ) : (
                <button className="chatbot-toggle" onClick={toggleChat}>
                    <FaRobot className="chatbot-icon" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
