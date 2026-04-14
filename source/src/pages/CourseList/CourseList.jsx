import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { CourseListRightSidebar } from "../../components/CourseListRightSidebar";
import NewCourseContainer from "../../components/NewCoursesContainer";
import MainPageLoader from "../../components/MainPageLoader";
import "./CourseList.css";
import axios from "axios";
import { fetchCourses, fetchUserProfile, enrollCourse } from "../../api/CourseList"; 

// ✅ Logout Toast Component
const LogoutToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="logout-toast" style={{ zIndex: 12000 }}>
      <span className="logout-toast-icon">✔</span>
      Logout Successful! Redirecting to login...
    </div>
  );
};

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
  const [achievements, setAchievements] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getBadgeIcon = (name) => {
    const normalized = name?.toLowerCase() || "";
    if (normalized.includes("first")) return "👣";
    if (normalized.includes("master") || normalized.includes("quiz")) return "🏆";
    if (normalized.includes("consistency") || normalized.includes("streak")) return "🔥";
    if (normalized.includes("challenge") || normalized.includes("milestone")) return "🎯";
    if (normalized.includes("learning")) return "📘";
    return "🎖️";
  };

  const fetchBadges = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/badges`, config);
      const badges = response.data.badges || [];
      if (badges.length === 0) {
        setAchievements([]);
        return;
      }
      setAchievements(
        badges.map((item) => {
          const badge = item.Badge || {};
          return {
            id: item.id,
            title: badge.name || "Badge",
            description: badge.description || "Earned a badge",
            icon: getBadgeIcon(badge.name),
          };
        })
      );
    } catch (error) {
      console.error("Error fetching badges:", error);
      setAchievements([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [coursesData, userData] = await Promise.all([
          fetchCourses(token),
          fetchUserProfile(token),
        ]);
        setCourses(coursesData);
        setUserName(userData.userName);
        await fetchBadges(token);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setShowLogoutToast(true);
  };

  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => {
        setShowLogoutToast(false);
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast, navigate]);

  if (isLoading) {
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading courses..." />;
  }

  return (
    <div className="course-list-container">
      <Sidebar active={active} hovered={hovered} setActive={setActive} setHovered={setHovered} />

      <div className="course-list-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="course-list-inner">
          <div className="course-list-content">
            {/* Removed Enrolled Courses section as per user request */}

            <NewCourseContainer
              courses={courses}
              hoveredCourse={hoveredCourse}
              setHoveredCourse={setHoveredCourse}
              courseText="Courses"
              buttonText="Enroll"
              onButtonClick={async (course) => {
                const token = localStorage.getItem("authToken");
                try {
                  await enrollCourse(token, course.id || course.courseId || course._id);
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>

          <CourseListRightSidebar
            activities={initialActivities}
            achievements={achievements}
          />
        </div>

        <LogoutToast show={showLogoutToast} />
      </div>
    </div>
  );
};

export default CourseList;
