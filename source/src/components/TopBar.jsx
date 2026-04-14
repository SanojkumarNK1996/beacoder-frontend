import { useState, useRef, useEffect, memo } from "react";
import { FaBell, FaUserCircle, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const TopBar = memo(({ userName, onLogout }) => {
    const navigate = useNavigate();
    const popupRef = useRef(null);
    const profilePopupRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const fullText = `Hello ${userName} Welcome Back`;

    const [isLoadingUnread, setIsLoadingUnread] = useState(false);

    useEffect(() => {
        if (!isLoadingUnread) {
            fetchUnreadCount();
        }
    }, []);

    useEffect(() => {
        if (displayedText.length < fullText.length) {
            const timer = setTimeout(() => {
                setDisplayedText(fullText.slice(0, displayedText.length + 1));
            }, 80);
            return () => clearTimeout(timer);
        } else {
            // Reset after 2 seconds to loop animation
            const resetTimer = setTimeout(() => {
                setDisplayedText("");
            }, 2000);
            return () => clearTimeout(resetTimer);
        }
    }, [displayedText, fullText]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowNotificationPopup(false);
            }
        };

        if (showNotificationPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationPopup]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profilePopupRef.current && !profilePopupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };

        if (showPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPopup]);

    const fetchUnreadCount = async () => {
        if (isLoadingUnread) return;

        setIsLoadingUnread(true);
        try {
            const token = localStorage.getItem("authToken");
            const config = {};
            if (token) config.headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/notifications/me/unread-count`, config);
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        } finally {
            setIsLoadingUnread(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const config = {};
            if (token) config.headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/notifications/me`, config);
            const data = response.data;
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notification) => {
        try {
            const token = localStorage.getItem("authToken");
            const config = {};
            if (token) config.headers = { Authorization: `Bearer ${token}` };
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/v1/notifications/me/mark-read`, {
                notificationIds: [notification.id]
            }, config);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            // Redirect if redirectTo is a non-empty string
            if (notification.redirectTo && notification.redirectTo.trim() !== "") {
                setShowNotificationPopup(false); // Close popup before navigating
                navigate(notification.redirectTo);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <>
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "10px 20px", 
            background: "rgba(255, 255, 255, 0.8)", 
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(227, 234, 252, 0.8)",
            gap: "15px",
            position: "relative",
            zIndex: 10010
        }}>
            {/* Minimalist Welcome Chip */}
            <div style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                padding: "12px 28px",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                flex: "0 0 auto",
                maxWidth: "600px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease"
            }}>

                <span style={{ fontSize: "28px", animation: "bounce 2s infinite", position: "relative", zIndex: 1 }}>✨</span>
                <span style={{ fontWeight: "600", color: "#367cfe", fontSize: "20px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0", minHeight: "28px" }}>
                    <span style={{ display: "inline-block", minWidth: "350px", paddingRight: "6px", fontFamily: "'Courier New', monospace", letterSpacing: "0.5px" }}>
                        {displayedText}
                    </span>
                </span>
            </div>

            {/* Spacer to push icons to the right */}
            <div style={{ flex: 1 }}></div>

            {/* Notification Icon */}
            <div style={{ position: "relative", cursor: "pointer", zIndex: 20 }} onClick={() => {
                if (!showNotificationPopup) {
                    fetchNotifications();
                }
                setShowNotificationPopup(!showNotificationPopup);
            }}>
                <FaBell style={{ fontSize: "28px", color: "#64748b", transition: "all 0.3s", zIndex: 10, position: "relative" }} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "20px",
                        height: "20px",
                        background: "#ff0000",
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse 2s infinite",
                        boxShadow: "0 0 8px rgba(255, 0, 0, 0.6)",
                        zIndex: 15
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* Profile Section */}
            <div 
                style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    cursor: "pointer", 
                    padding: "8px 14px",
                    borderRadius: "12px",
                    transition: "background 0.2s",
                    position: "relative"
                }}
                onClick={() => setShowPopup(!showPopup)}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg, #367cfe 0%, #5ab1ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "18px" }}>
                    {userName.charAt(0).toUpperCase()}
                </div>
                <FaChevronDown style={{ fontSize: "16px", color: "#64748b", transition: "transform 0.2s", transform: showPopup ? "rotate(180deg)" : "rotate(0deg)" }} />

                {showPopup && (
                    <div ref={profilePopupRef} style={{
                        position: "absolute",
                        top: "60px",
                        right: "20px",
                        width: "220px",
                        background: "#fff",
                        borderRadius: "14px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        padding: "12px",
                        zIndex: 100,
                        border: "1px solid #f1f5f9",
                        animation: "slideDownFade 0.3s ease"
                    }}>
                        <div style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                            <p style={{ margin: 0, fontWeight: "700", fontSize: "16px" }}>{userName}</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>User Account</p>
                        </div>
                        <button 
                            onClick={onLogout}
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                textAlign: "left", 
                                background: "none", 
                                border: "none", 
                                color: "#ef4444", 
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontWeight: "600",
                                fontSize: "15px",
                                transition: "background 0.2s",
                                borderRadius: "8px"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <FaSignOutAlt style={{ fontSize: "16px" }} /> Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Notification Popup */}
            {showNotificationPopup && (
                <div ref={popupRef} style={{
                    position: "absolute",
                    top: "60px",
                    right: "80px", // Adjust to not overlap with profile
                    width: "320px",
                    maxHeight: "400px",
                    background: "#fff",
                    borderRadius: "14px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    padding: "12px",
                    zIndex: 10050,
                    border: "1px solid #f1f5f9",
                    animation: "slideDownFade 0.3s ease",
                    overflowY: "auto"
                }}>
                    <div style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                        <p style={{ margin: 0, fontWeight: "700", fontSize: "16px" }}>Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px" }}>No notifications</p>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification.id} style={{
                                padding: "12px",
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                transition: "background 0.2s",
                                borderRadius: "8px",
                                marginBottom: "4px",
                                background: notification.isRead ? "#f8fafc" : "#fff"
                            }}
                            onClick={() => {
                                if (!notification.isRead) {
                                    markAsRead(notification);
                                }
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                            onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? "#f8fafc" : "#fff"}
                            >
                                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#333" }}>{notification.module} - {notification.subModule}</p>
                                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>{notification.message}</p>
                                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>{new Date(notification.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        <style>{`
            @keyframes blink {
                0%, 49% { border-right-color: #367cfe; }
                50%, 100% { border-right-color: transparent; }
            }

            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }

            @keyframes slideDownFade {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes gradientShift {
                0%, 100% { 
                    background: linear-gradient(135deg, #f0f6ff 0%, #e3eafc 100%);
                }
                50% { 
                    background: linear-gradient(135deg, #e3eafc 0%, #d4dfff 100%);
                }
            }

            @keyframes floatContainer {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
            }

            @keyframes glowPulse {
                0%, 100% { 
                    box-shadow: 0 4px 12px rgba(54, 124, 254, 0.1);
                }
                50% { 
                    box-shadow: 0 8px 24px rgba(54, 124, 254, 0.25);
                }
            }

            @keyframes shimmerWave {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: 100%; }
            }
        `}</style>
        </>
    );
});