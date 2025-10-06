import { FaTachometerAlt, FaBookOpen, FaTasks, FaComments } from "react-icons/fa";
import { Link } from "react-router-dom";

// Sidebar options data
const sidebarOptions = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
    { label: "My Assignments", icon: <FaTasks />, path: "/assignments" },
    { label: "Discussions", icon: <FaComments />, path: "/discussions" },
];

// Sidebar component
export const Sidebar = ({ active, hovered, setActive, setHovered }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "20px",
            width: "282px",
            minWidth: "282px",
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "50px 20px",
            overflow: "hidden",
        }}
    >
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "45px" }}>
            {/* Logo Row */}
            <div style={{ height: "32px", display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "28px", fontWeight: "900", color: "#367cfe" }}>Learn</span>
                <span style={{ fontSize: "28px", fontWeight: "900", color: "#000" }}>2</span>
                <span style={{ fontSize: "28px", fontWeight: "900", color: "#ffb74d" }}>Code</span>
            </div>
            {/* Sidebar Menu */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                {sidebarOptions.map((option, idx) => (
                    <Link
                        to={option.path}
                        key={option.label}
                        style={{ textDecoration: "none" }}
                    >
                        <div
                            style={{
                                background: active === idx || hovered === idx ? "#f0f6ff" : "#fff",
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                                padding: "16px",
                                cursor: "pointer",
                                boxShadow: hovered === idx ? "0 2px 8px rgba(54,124,254,0.08)" : "none",
                                transition: "background 0.2s, box-shadow 0.2s",
                            }}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => setActive(idx)}
                        >
                            <div
                                style={{
                                    height: "24px",
                                    width: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: active === idx || hovered === idx ? "#367cfe" : "#696969",
                                    fontSize: "22px",
                                    transition: "color 0.2s",
                                }}
                            >
                                {option.icon}
                            </div>
                            <span
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "500",
                                    color: active === idx || hovered === idx ? "#1e1e1e" : "#696969",
                                    transition: "color 0.2s",
                                }}
                            >
                                {option.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);