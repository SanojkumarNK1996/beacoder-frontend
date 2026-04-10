import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainPageLoader from "../components/MainPageLoader";
import "./Homepage.css";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { TopBar } from "../components/TopBar";
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

const InstructorHomepage = () => {
  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("Instructor");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentStats, setAssignmentStats] = useState({ 
    assignmentsCreated: 0, 
    submissionsReceived: 0, 
    pendingReview: 0 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [userData, statsData] = await Promise.all([
          fetchInstructorProfile(token),
          fetchInstructorAssignmentStats(token),
        ]);
        setUserName(userData.userName || "Instructor");
        setAssignmentStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchInstructorProfile = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`, config);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      return { userName: "Instructor" };
    }
  };

  const fetchInstructorAssignmentStats = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      // Fetch instructor-specific assignment stats
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/instructor/assignments/stats`, config);
      return response.data.data || { assignmentsCreated: 0, submissionsReceived: 0, pendingReview: 0 };
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      return { assignmentsCreated: 0, submissionsReceived: 0, pendingReview: 0 };
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
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading dashboard..." />;
  }

  return (
    <div className="course-list-container">
      <InstructorSidebar hovered={hovered} setHovered={setHovered} />

      <div className="course-list-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="course-list-inner">
          <div className="course-list-content">
            {/* Assignment Stats Section - Default View */}
            <div className="assignment-stats-container">
              <div className="stat-card stat-submitted">
                <div className="stat-card-header"><FaCheckCircle /> Created</div>
                <h3 className="stat-card-value">{assignmentStats.assignmentsCreated}</h3>
                <p className="stat-card-label">Assignments</p>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-card-header"><FaClock /> Pending Review</div>
                <h3 className="stat-card-value">{assignmentStats.pendingReview}</h3>
                <p className="stat-card-label">Submissions</p>
              </div>

              <div className="stat-card stat-badges">
                <div className="stat-card-header"><FaMedal /> Received</div>
                <h3 className="stat-card-value">{assignmentStats.submissionsReceived}</h3>
                <p className="stat-card-label">Submissions</p>
              </div>
            </div>

            {/* Placeholder for Assignment Management Content */}
            <div style={{
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#f9f9f9",
              borderRadius: "16px",
              color: "#666",
              textAlign: "center"
            }}>
              <p>Navigate to <strong>Assignments</strong>, <strong>Discussions</strong>, or <strong>Pair Programming</strong> from the sidebar to manage your courses.</p>
            </div>
          </div>
        </div>

        <LogoutToast show={showLogoutToast} />
      </div>
    </div>
  );
};

export default InstructorHomepage;
