import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { Header } from "../components/Header";
import EnrolledCourses from "../components/EnrolledCourses";
import { RightSidebar } from "../components/RightSideBar";

const enrolledCoursesData = [
    {
        id: 1,
        title: "Java Basics",
        nextLesson: "Loops & Iteration",
        progress: 80,
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    },
    {
        id: 2,
        title: "Python Essentials",
        nextLesson: "Functions & Modules",
        progress: 60,
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
        id: 3,
        title: "JavaScript Foundations",
        nextLesson: "DOM Manipulation",
        progress: 40,
        img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    },
];

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

const Dashboard = () => {
    const [hovered, setHovered] = useState(null);
    const [active, setActive] = useState(0);
    const [hoveredCourse, setHoveredCourse] = useState(null);
    const [courses] = useState(enrolledCoursesData);
    const [userName] = useState("Arun K");

    // If you want to fetch from API, uncomment below
    // useEffect(() => {
    //     axios.get("/api/courses")
    //         .then(res => setCourses(res.data))
    //         .catch(err => console.error(err));
    //     // You can also fetch user info here and setUserName
    // }, []);

    return (
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
                <TopBar userName={userName} />
                <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                        <Header userName={userName} />
                        <EnrolledCourses
                            courses={courses}
                            hoveredCourse={hoveredCourse}
                            setHoveredCourse={setHoveredCourse}
                            courseText="Enrolled Courses"
                            buttonText="Continue"
                        />
                    </div>
                    <RightSidebar activities={initialActivities} achievements={initialAchievements} /> {/* Pass achievements here */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;