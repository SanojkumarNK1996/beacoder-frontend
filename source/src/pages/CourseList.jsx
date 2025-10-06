import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { CourseListRightSidebar } from "../components/CourseListRightSidebar";
import axios from "axios";
import NewCourseContainer from "../components/NewCoursesContainer";
import MainPageLoader from "../components/MainPageLoader";

// Toast component for logout
const LogoutToast = ({ show }) => {
    if (!show) return null;
    return (
        <div
            style={{
                position: "fixed",
                top: "40px", // Changed from bottom to top
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(90deg, #367cfe 0%, #5ab1ff 100%)",
                color: "#fff",
                padding: "18px 40px",
                borderRadius: "24px",
                boxShadow: "0 4px 24px rgba(54,124,254,0.18)",
                fontSize: "18px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                zIndex: 10001,
                animation: "fadeIn 0.3s",
            }}
        >
            <span style={{ fontSize: "24px" }}>✔</span>
            Logout Successful! Redirecting to login...
        </div>
    );
};

const initialAchievements = [
    {
        icon: "🏅",
        title: "Java Rookie",
        description: "Completed first 5 lessons",
    },
    {
        icon: "⭐",
        title: "Consistency Streak",
        description: "7 days in a row",
    },
    {
        icon: "🎯",
        title: "Quiz Master",
        description: "3 quizzes passed",
    },
];

const initialActivities = [
    {
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
        title: "Completed: Variables & Data Types",
        date: "Aug 15 - 12:00 PM",
    },
    {
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        title: "Attempted: Quiz - Java Basics",
        date: "Aug 17 - 12:00 PM",
    },
    {
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        title: "Completed: Variables & Data Types",
        date: "Aug 15 - 12:00 PM",
    },
    {
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        title: "Earned: First 10 Lessons Badge",
        date: "Aug 17 - 12:00 PM",
    },
];

const CourseList = () => {
    const [hovered, setHovered] = useState(null);
    const [active, setActive] = useState(0);
    const [hoveredCourse, setHoveredCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [userName, setUserName] = useState("User");
    const [showLogoutToast, setShowLogoutToast] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ])
            .then(([coursesRes, profileRes]) => {
                setCourses(coursesRes.data.data);
                setUserName(profileRes.data.userName);
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                console.error(err);
            });
    }, []);

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setShowLogoutToast(true);
    };

    // Show toast and redirect after 1.5s
    useEffect(() => {
        if (showLogoutToast) {
            const timer = setTimeout(() => {
                setShowLogoutToast(false);
                navigate("/login");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showLogoutToast, navigate]);

    return (
        isLoading ? (
            <MainPageLoader variant="headerSidebarSkeleton" text="Loading courses..." />
        ) : (
            <div
                style={{
                    minHeight: "100vh",
                    width: "100vw",
                    background: "#eff6ff",
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px",
                    boxSizing: "border-box",
                    fontFamily: "Montserrat, sans-serif",
                    gap: "20px",
                }}
            >
                <Sidebar active={active} hovered={hovered} setActive={setActive} setHovered={setHovered} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <TopBar
                        userName={userName}
                        onLogout={handleLogout}
                    />
                    <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                            <NewCourseContainer
                                courses={courses}
                                hoveredCourse={hoveredCourse}
                                setHoveredCourse={setHoveredCourse}
                                courseText="Courses"
                                buttonText="View"
                            />
                        </div>
                        <CourseListRightSidebar activities={initialActivities} achievements={initialAchievements} />
                    </div>
                    {/* Logout Toast */}
                    <LogoutToast show={showLogoutToast} />
                </div>
            </div>
        )
    );
};

export default CourseList;