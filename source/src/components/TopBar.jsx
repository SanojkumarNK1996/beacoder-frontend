import { useState, useRef } from "react";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Add this import

// TopBar component
export const TopBar = ({ userName, onLogout }) => {
    const [showPopup, setShowPopup] = useState(false);
    const profileBtnRef = useRef(null);

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px", width: "100%", position: "relative" }}>
            {/* Search Bar */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    height: "48px",
                    minWidth: "220px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    flex: 1,
                    transition: "box-shadow 0.2s, border 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(54,124,254,0.25)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
                <div style={{ height: "24px", width: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaSearch style={{ fontSize: "20px", color: "#000" }} />
                </div>
                <input
                    type="text"
                    placeholder="Search......"
                    style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "#1e1e1e",
                        width: "100%",
                    }}
                />
            </div>
            {/* Notification Button */}
            <button
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    height: "48px",
                    width: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0",
                    border: "none",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, background 0.2s",
                    marginLeft: "16px",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(54,124,254,0.25)";
                    e.currentTarget.style.background = "#f0f6ff";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#fff";
                }}
                aria-label="Notifications"
            >
                <FaBell style={{ fontSize: "32px", color: "#367cfe" }} />
            </button>
            {/* Profile Button */}
            <div
                ref={profileBtnRef}
                style={{
                    height: "48px",
                    width: "100px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    padding: 0,
                    marginLeft: "16px",
                    marginRight: "16px",
                    position: "relative",
                    userSelect: "none"
                }}
                onClick={() => {
                    setShowPopup(!showPopup);
                }}
                aria-label="Profile"
            >
                <div
                    style={{
                        height: "36px",
                        width: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "#f0f6ff",
                        transition: "background 0.2s",
                        cursor: "pointer"
                    }}
                >
                    <FaUserCircle style={{ fontSize: "26px", color: "#367cfe" }} />
                </div>
                <span
                    style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#000",
                        whiteSpace: "nowrap",
                        cursor: "pointer"
                    }}
                >
                    {userName}
                </span>
                {/* Popup INSIDE profile button container */}
                {showPopup && (
                    <div
                        style={{
                            position: "absolute",
                            top: "120%", // Slightly more below the profile button
                            left: "-220px", // Move further to the left so the box is fully visible
                            background: "#fff",
                            borderRadius: "16px",
                            boxShadow: "0 8px 32px rgba(54,124,254,0.18)",
                            padding: "32px 40px",
                            minWidth: "240px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "18px",
                            zIndex: 1000,
                            border: "1.5px solid #e3eafc",
                            animation: "fadeIn 0.2s",
                        }}
                        onMouseLeave={() => setShowPopup(false)}
                    >
                        <FaUserCircle style={{
                            fontSize: "54px",
                            color: "#367cfe",
                            marginBottom: "8px",
                            background: "#f6f8fc",
                            borderRadius: "50%",
                            boxShadow: "0 2px 8px #e3eafc"
                        }} />
                        <span style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "#222",
                            marginBottom: "8px",
                            letterSpacing: "1px",
                            textShadow: "0 2px 8px #e3eafc"
                        }}>
                            {userName}
                        </span>
                        <button
                            style={{
                                background: "linear-gradient(90deg, #367cfe 0%, #5ab1ff 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "12px 32px",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(54,124,254,0.15)",
                                marginTop: "8px",
                                letterSpacing: "1px",
                                transition: "background 0.2s, box-shadow 0.2s"
                            }}
                            onClick={() => {
                                setShowPopup(false);
                                if (onLogout) onLogout();
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};