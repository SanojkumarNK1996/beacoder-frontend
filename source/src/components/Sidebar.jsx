import React, { useEffect, useRef, useState } from "react";
import { FaTachometerAlt, FaBookOpen, FaTasks, FaComments, FaRocket, FaRobot, FaTrophy, FaLock, FaCrown, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

// Sidebar options data
const sidebarOptions = [
    { label: "Homepage", icon: <FaTachometerAlt />, path: "/homepage" },
    { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
    { label: "My Assignments", icon: <FaTasks />, path: "/assignments" },
    { label: "Discussions", icon: <FaComments />, path: "/discussions" },
];

export const Sidebar = ({ hovered, setHovered }) => {
    const location = useLocation();
    // Find the index of the sidebar option that matches the current route
    const activeIdx = sidebarOptions.findIndex(option => location.pathname.startsWith(option.path));
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState(null);
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    const premiumOptions = [
        { label: "Career Boost", icon: <FaRocket /> },
        { label: "AI Mentor", icon: <FaRobot /> },
        { label: "Top Placements", icon: <FaTrophy /> },
    ];

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setShowPremiumModal(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (showPremiumModal) {
            try { document.activeElement && document.activeElement.blur(); } catch (e) {}
            setTimeout(() => { if (modalRef.current) modalRef.current.focus(); }, 0);
        }
    }, [showPremiumModal]);

    const openPremiumModal = (feature) => {
        setHovered && setHovered(null);
        setPremiumFeature(feature);
        setShowPremiumModal(true);
    };

    const closePremiumModal = () => {
        setShowPremiumModal(false);
        setPremiumFeature(null);
    };

    return (
        <>
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
                    padding: "50px 20px 40px",
                    overflow: "hidden",
                }}
            >
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "45px" }}>
                    {/* Logo Row */}
                    <div style={{ height: "32px", display: "flex", flexDirection: "row", alignItems: "center", gap: "2px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "900", color: "#367cfe" }}>Be</span>
                        <span style={{ fontSize: "28px", fontWeight: "900", color: "#000" }}>A</span>
                        <span style={{ fontSize: "28px", fontWeight: "900", color: "#ffb74d" }}>Coder</span>
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
                                        background: activeIdx === idx || hovered === idx ? "#f0f6ff" : "#fff",
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
                                >
                                    <div
                                        style={{
                                            height: "24px",
                                            width: "24px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: activeIdx === idx || hovered === idx ? "#367cfe" : "#696969",
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
                                            color: activeIdx === idx || hovered === idx ? "#1e1e1e" : "#696969",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {option.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {/* Premium Features */}
                        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {premiumOptions.map((opt, pIdx) => {
                                const isHovered = hovered === sidebarOptions.length + pIdx;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={(e) => { e.preventDefault(); openPremiumModal(opt.label); }}
                                        onMouseEnter={() => setHovered && setHovered(sidebarOptions.length + pIdx)}
                                        onMouseLeave={() => setHovered && setHovered(null)}
                                        style={{
                                            width: "100%",
                                            background: "linear-gradient(90deg, rgba(248,251,255,1), rgba(238,246,255,1))",
                                            borderRadius: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "10px",
                                            padding: "16px 14px",
                                            cursor: "pointer",
                                            border: "none",
                                            textAlign: "left",
                                            transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
                                        }}
                                    >
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <div style={{
                                                height: "24px",
                                                width: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: isHovered ? "#367cfe" : "#696969",
                                                fontSize: "22px"
                                            }}>
                                                {opt.icon}
                                            </div>
                                            <span style={{ fontSize: "20px", fontWeight: 500, color: isHovered ? "#1e1e1e" : "#696969" }}>{opt.label}</span>
                                        </div>
                                        <FaLock style={{ color: isHovered ? "#367cfe" : "#8b98b3", fontSize: "18px" }} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        {showPremiumModal && (
            <div
                ref={overlayRef}
                onClick={(e) => { if (e.target === overlayRef.current) closePremiumModal(); }}
                style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(6px)",
                    zIndex: 10000,
                    padding: "24px",
                }}
            >
                <div
                    ref={modalRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        zIndex: 10020,
                        width: "min(700px, 95%)",
                        borderRadius: "20px",
                        padding: "34px",
                        background: "rgba(248,250,255,0.98)",
                        border: "1px solid rgba(148,163,184,0.18)",
                        boxShadow: "0 22px 60px rgba(15,23,42,0.16)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        alignItems: "center",
                        textAlign: "center",
                        transform: "scale(1)",
                        animation: "fadeScaleIn 200ms ease",
                    }}
                >
                    <div style={{ position: "absolute", right: "20px", top: "20px", cursor: "pointer" }} onClick={closePremiumModal} aria-label="close">
                        <FaTimes style={{ color: "#475569", fontSize: "20px" }} />
                    </div>
                    <div style={{ height: "64px", width: "64px", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(56,189,248,0.18))", boxShadow: "inset 0 -2px 10px rgba(37,99,235,0.12)" }}>
                        <FaCrown style={{ color: "#2563eb", fontSize: "30px" }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: "24px", color: "#0f172a", lineHeight: 1.2 }}>Premium Feature</h3>
                    <p style={{ margin: 0, color: "#334155", fontSize: "17px", lineHeight: 1.75, maxWidth: "92%" }}>
                        Unlock this feature with BeACoder Premium and accelerate your learning journey.
                    </p>
                    <p style={{ margin: 0, color: "#475569", fontSize: "15px", lineHeight: 1.7, maxWidth: "90%" }}>
                        This feature is exclusively available for premium members.
                    </p>
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <button onClick={closePremiumModal} style={{ background: "#2563eb", borderRadius: "14px", padding: "12px 18px", border: "1px solid rgba(37,99,235,0.35)", cursor: "pointer", fontSize: "15px", fontWeight: 600, color: "#fff", boxShadow: "0 8px 18px rgba(37,99,235,0.18)" }}>Close</button>
                    </div>
                </div>
                <style>{`@keyframes fadeScaleIn { from { opacity: 0; transform: scale(.98);} to { opacity: 1; transform: scale(1);} }`}</style>
            </div>
        )}
        </>
    );
};