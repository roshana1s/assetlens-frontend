import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import "./ChatBot.css";
import parse from "html-react-parser";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        // get chat history
        const getChatHistory = async (user_id) => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/chat/1/chat-history/${user_id}`
                );

                setMessages(response.data);
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
            try {
                console.log(message);
                const response = await axios.post(
                    "http://localhost:8000/chat/1/chatbot/u0003",
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
                        <button className="close-btn" onClick={toggleChat}>
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
                                className={`message ${
                                    message.type === "user"
                                        ? "user-message"
                                        : "bot-message"
                                }`}
                            >
                                <div className="message-content">
                                    {parse(message.message)}
                                </div>
                            </div>
                        ))}
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
                        <button type="submit" className="send-btn">
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
