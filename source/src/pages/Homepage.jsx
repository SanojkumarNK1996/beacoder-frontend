import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewCourseContainer from "../components/NewCoursesContainer";
import MainPageLoader from "../components/MainPageLoader";
import "./Homepage.css";
import { fetchUserProfile, fetchEnrolledCourses } from "../api/CourseList"; 
import { CourseListRightSidebar } from "../components/CourseListRightSidebar";
import { TopBar } from "../components/TopBar";
import { Sidebar } from "../components/Sidebar";
import axios from "axios";
import { FaCheckCircle, FaClock, FaMedal } from "react-icons/fa";




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

const initialAchievements = [
  { icon: "🏅", title: "Java Rookie", description: "Completed first 5 lessons" },
  { icon: "⭐", title: "Consistency Streak", description: "7 days in a row" },
  { icon: "🎯", title: "Quiz Master", description: "3 quizzes passed" },
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

const Homepage = () => {
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(0);
  const [enrolledHoveredCourse, setEnrolledHoveredCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentStats, setAssignmentStats] = useState({ submittedCount: 0, pendingCount: 0, earnedBadges: 0 });
  const [achievements, setAchievements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [userData, enrolledData, statsData, badgesData] = await Promise.all([
          fetchUserProfile(token),
          fetchEnrolledCourses(token),
          fetchAssignmentStats(token),
          fetchBadges(token),
        ]);
        setUserName(userData.userName);
        // Normalize enrolled courses so each has an `id` field taken from `courseId`
        const normalizedEnrolled = (enrolledData || []).map(c => ({ ...c, id: c.courseId }));
        setEnrolledCourses(normalizedEnrolled);
        setAssignmentStats(statsData);
        // fetchBadges sets achievements internally, so no need to set here
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAssignmentStats = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments/stats`, config);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      return { submittedCount: 0, pendingCount: 0, earnedBadges: 0 };
    }
  };

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

      const mapped = badges.map((item) => {
        const badge = item.Badge || {};
        return {
          id: item.id,
          title: badge.name || "Badge",
          description: badge.description || "Earned a new badge",
          icon: getBadgeIcon(badge.name),
        };
      });
      setAchievements(mapped);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setAchievements([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
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
            {/* Assignment Stats Section */}
            <div className="assignment-stats-container">
              <div className="stat-card stat-submitted">
                <div className="stat-card-header"><FaCheckCircle /> Submitted</div>
                <h3 className="stat-card-value">{assignmentStats.submittedCount}</h3>
                <p className="stat-card-label">Assignments</p>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-card-header"><FaClock /> Pending</div>
                <h3 className="stat-card-value">{assignmentStats.pendingCount}</h3>
                <p className="stat-card-label">Assignments</p>
              </div>

              <div className="stat-card stat-badges">
                <div className="stat-card-header"><FaMedal /> Badges</div>
                <h3 className="stat-card-value">{assignmentStats.earnedBadges}</h3>
                <p className="stat-card-label">Earned</p>
              </div>
            </div>

            {enrolledCourses && enrolledCourses.length > 0 && (
              <NewCourseContainer
                courses={enrolledCourses}
                hoveredCourse={enrolledHoveredCourse}
                setHoveredCourse={setEnrolledHoveredCourse}
                courseText="Enrolled Courses"
                buttonText="Continue"
              />
            )}

            {/* Removed Courses section as per user request */}
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

export default Homepage;
