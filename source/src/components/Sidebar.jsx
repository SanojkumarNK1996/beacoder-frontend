import React, { useEffect, useRef, useState } from "react";
import { FaTachometerAlt, FaBookOpen, FaTasks, FaComments, FaSitemap, FaRocket, FaRobot, FaLock, FaCrown, FaTimes, FaEdit, FaUserCog, FaChalkboardTeacher, FaBriefcase, FaQuestionCircle, FaChartLine, FaInfoCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

// Sidebar options data
const sidebarOptions = [
    { label: "Homepage", icon: <FaTachometerAlt />, path: "/homepage" },
    { label: "Curriculum", icon: <FaSitemap />, path: "/curriculum" },
    { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
    { label: "Mock Test", icon: <FaQuestionCircle />, path: "/quizzes" },
    { label: "Discussion", icon: <FaComments />, path: "/discussions" },
];

const navigationHints = {
    Homepage: "Your learning dashboard, progress, and recommended next steps.",
    Curriculum: "Explore the learning paths, topics, and lessons available to you.",
    Courses: "Browse courses and continue learning with course materials.",
    "My Progress": "Celebrate your learning milestones and see updates from your tutor.",
    "Mock Test": "Practice quiz questions at your own pace and review your score.",
    Discussion: "Ask questions and join conversations with the learning community.",
    "My Assignments": "View your assigned work, submit solutions, and track reviews.",
    "Assigned Tests": "Take tests assigned to you by your mentor and see your results.",
    Recruiters: "Explore recruiter and job opportunity information.",
    Mentors: "Discover mentors and view their profiles.",
    Questionnaires: "Create questionnaires from the question bank and assign them to learners.",
    "Review Submissions": "Review learner assignment submissions and provide feedback.",
    "Assign Work": "Assign coursework to learners.",
    "Student Progress": "Review learner progress and course activity.",
    "Content Editor": "Manage and update learning content.",
    "User Management": "Manage user accounts and roles.",
};

export const Sidebar = ({ hovered, setHovered }) => {
    const location = useLocation();
    const role = localStorage.getItem("userRole");
    const isStudentOrAdmin = ["student", "admin"].includes(role);
    const isInstructorOrAdmin = ["admin", "instructor"].includes(role);
    const studentOptions = [
        ...(isStudentOrAdmin ? [{ label: "My Assignments", icon: <FaTasks />, path: "/assignments" }] : []),
        ...(isStudentOrAdmin ? [{ label: "Recruiters", icon: <FaBriefcase />, path: "/recruiters" }] : []),
        ...(isStudentOrAdmin ? [{ label: "Mentors", icon: <FaChalkboardTeacher />, path: "/mentors" }] : []),
    ];
    const instructorOptions = [
        ...(isInstructorOrAdmin ? [{ label: "Questionnaires", icon: <FaQuestionCircle />, path: "/questionnaires" }] : []),
        ...(isInstructorOrAdmin ? [{ label: "Review Submissions", icon: <FaTasks />, path: "/instructor/assignments" }] : []),
        ...(isInstructorOrAdmin ? [{ label: "Assign Work", icon: <FaTasks />, path: "/assignments/manage" }] : []),
        ...(isInstructorOrAdmin ? [{ label: "Student Progress", icon: <FaChartLine />, path: "/progress/manage" }] : []),
        ...(isInstructorOrAdmin ? [{ label: "Content Editor", icon: <FaEdit />, path: "/content-editor" }] : []),
    ];
    const menuSections = role === "admin"
        ? [
            { label: "General", options: sidebarOptions },
            { label: "Student tools", options: [...studentOptions, { label: "Assigned Tests", icon: <FaQuestionCircle />, path: "/my-tests" }] },
            { label: "Instructor tools", options: instructorOptions },
            { label: "Admin only", options: [{ label: "User Management", icon: <FaUserCog />, path: "/admin/users" }] },
        ]
        : [{ label: null, options: [
            ...sidebarOptions.slice(0, 3),
            ...(role === "student" ? [{ label: "My Progress", icon: <FaChartLine />, path: "/my-progress" }] : []),
            ...(isStudentOrAdmin ? [sidebarOptions[3]] : []),
            ...studentOptions.slice(0, 1),
            ...(role === "student" ? [{ label: "Assigned Tests", icon: <FaQuestionCircle />, path: "/my-tests" }, ...sidebarOptions.slice(4)] : sidebarOptions.slice(4)),
            ...studentOptions.slice(1),
            ...instructorOptions,
        ] }];
    const visibleOptions = menuSections.flatMap((section) => section.options);
    // Find the index of the sidebar option that matches the current route
    const activeIdx = visibleOptions.reduce((active, option, index) => (
        location.pathname.startsWith(option.path) &&
        (active === -1 || option.path.length > visibleOptions[active].path.length)
            ? index
            : active
    ), -1);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState(null);
    const [activeHint, setActiveHint] = useState(null);
    const [hoveredHint, setHoveredHint] = useState(null);
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    const premiumOptions = [
        { label: "Career Boost", icon: <FaRocket /> },
        { label: "AI Mentor", icon: <FaRobot /> },
    ];

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setShowPremiumModal(false);
                setActiveHint(null);
                setHoveredHint(null);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        if (showPremiumModal) {
            document.activeElement?.blur();
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
                    flex: "0 0 282px",
                    height: "calc(100vh - 40px)",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "50px 20px 40px",
                        overflowX: "hidden",
                    overflowY: "auto",
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
                        {menuSections.map((section) => {
                            let optionIndex = 0;
                            for (const preceding of menuSections) {
                                if (preceding === section) break;
                                optionIndex += preceding.options.length;
                            }
                            return (
                              <div key={section.label || "main-menu"} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {section.label && <h3 style={{ margin: "8px 0 2px", padding: "0 12px", color: "#8492a6", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{section.label}</h3>}
                                {section.options.map((option, sectionIndex) => {
                                  const idx = optionIndex + sectionIndex;
                                  const hintId = `sidebar-hint-${option.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                                  const hintIsVisible = activeHint === option.label || hoveredHint === option.label;
                                  return (
                            <div
                                key={option.label}
                                style={{ position: "relative" }}
                            >
                                <Link to={option.path} style={{ textDecoration: "none" }}>
                                    <div
                                        style={{
                                            background: activeIdx === idx || hovered === idx ? "#f0f6ff" : "#fff",
                                            borderRadius: "16px",
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "16px 44px 16px 16px",
                                            boxSizing: "border-box",
                                            cursor: "pointer",
                                            boxShadow: hovered === idx ? "0 2px 8px rgba(54,124,254,0.08)" : "none",
                                            transition: "background 0.2s, box-shadow 0.2s",
                                        }}
                                        onMouseEnter={() => setHovered(idx)}
                                        onMouseLeave={() => setHovered(null)}
                                    >
                                        <div style={{ height: "24px", width: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: activeIdx === idx || hovered === idx ? "#367cfe" : "#696969", fontSize: "22px", transition: "color 0.2s" }}>
                                            {option.icon}
                                        </div>
                                        <span style={{ fontSize: "17px", fontWeight: "500", color: activeIdx === idx || hovered === idx ? "#1e1e1e" : "#696969", transition: "color 0.2s" }}>
                                            {option.label}
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`About ${option.label}`}
                                    aria-expanded={hintIsVisible}
                                    aria-describedby={hintIsVisible ? hintId : undefined}
                                    title={`About ${option.label}`}
                                    onClick={() => setActiveHint((current) => current === option.label ? null : option.label)}
                                    onMouseEnter={() => setHoveredHint(option.label)}
                                    onMouseLeave={() => setHoveredHint(null)}
                                    onFocus={() => setHoveredHint(option.label)}
                                    onBlur={() => setHoveredHint(null)}
                                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: 0, padding: "8px", borderRadius: "50%", background: "transparent", color: hintIsVisible ? "#367cfe" : "#9aa6b6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}
                                >
                                    <FaInfoCircle />
                                </button>
                                {hintIsVisible && (
                                    <div id={hintId} role="tooltip" style={{ position: "absolute", zIndex: 20, left: "12px", right: "12px", top: "calc(100% - 4px)", padding: "11px 13px", borderRadius: "10px", background: "#172b4d", color: "#fff", boxShadow: "0 8px 24px rgba(23,43,77,0.22)", fontSize: "12px", lineHeight: 1.45, pointerEvents: "none" }}>
                                        {navigationHints[option.label] || `Open ${option.label}.`}
                                    </div>
                                )}
                            </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                })}
                        {/* Premium Features */}
                        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {premiumOptions.map((opt, pIdx) => {
                                const isHovered = hovered === visibleOptions.length + pIdx;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={(e) => { e.preventDefault(); openPremiumModal(opt.label); }}
                                        onMouseEnter={() => setHovered && setHovered(visibleOptions.length + pIdx)}
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
                                            <span style={{ fontSize: "17px", fontWeight: 500, color: isHovered ? "#1e1e1e" : "#696969" }}>{opt.label}</span>
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
                    <h3 style={{ margin: 0, fontSize: "24px", color: "#0f172a", lineHeight: 1.2 }}>{premiumFeature || "Premium Feature"}</h3>
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