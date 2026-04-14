import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainPageLoader from "../../components/MainPageLoader";
import { InstructorSidebar } from "../../components/InstructorSidebar";
import { TopBar } from "../../components/TopBar";
import axios from "axios";

const LogoutToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="logout-toast" style={{ zIndex: 12000 }}>
      <span className="logout-toast-icon">✔</span>
      Logout Successful! Redirecting to login...
    </div>
  );
};

const InstructorDiscussions = () => {
  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("Instructor");
  const [isLoading, setIsLoading] = useState(true);
  const [discussions, setDiscussions] = useState([]);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    // Check if user has instructor role
    if (role !== "instructor") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, discussionsData, coursesData] = await Promise.all([
          fetchInstructorProfile(token),
          fetchInstructorDiscussions(token),
          fetchCourses(token),
        ]);
        setUserName(userData.userName || "Instructor");
        setDiscussions(discussionsData);
        setCourses(coursesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && selectedCourse !== undefined) {
      fetchInstructorDiscussions(token, selectedCourse || null).then(setDiscussions);
    }
  }, [selectedCourse]);

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

  const fetchInstructorDiscussions = async (token, courseId = null) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin`;
      if (courseId) url += `?courseId=${courseId}`;
      const response = await axios.get(url, config);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching discussions:', error);
      return [];
    }
  };

  const fetchCourses = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses`, config);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
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
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading discussions..." />;
  }

  return (
    <>
      <div className="course-list-container">
        <InstructorSidebar hovered={hovered} setHovered={setHovered} />

        <div className="course-list-main">
          <TopBar userName={userName} onLogout={handleLogout} />

          <div className="course-list-inner">
            <div className="course-list-content">
              <h2 style={{ marginBottom: "20px", color: "#1e1e1e" }}>Course Discussions</h2>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="course-select" style={{ marginRight: "10px", fontWeight: "bold" }}>Select Course:</label>
                <select
                  id="course-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              {discussions && discussions.length > 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  {discussions.map((discussion) => (
                    <div key={discussion.id} style={{
                      padding: "20px",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e6e6e6",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.25s ease",
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/instructor/discussions/${discussion.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(54, 124, 254, 0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h3 style={{ color: "#367cfe", margin: 0 }}>{discussion.title}</h3>
                        <p style={{ color: discussion.status === "open" ? "#137333" : discussion.status === "closed" ? "#c62828" : "#444", margin: 0, fontWeight: 600, fontSize: "14px" }}>{discussion.status?.toUpperCase() || "N/A"}</p>
                      </div>
                      <p style={{ color: "#696969", marginBottom: "8px" }}>{discussion.description || "No description provided."}</p>
                      <p style={{ color: "#555", marginBottom: "8px" }}><strong>Course:</strong> {discussion.Course?.courseName || "Unknown"}</p>
                      <p style={{ color: "#555", marginBottom: "8px" }}><strong>User:</strong> {discussion.User?.name || "Unknown"}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                        <small style={{ color: "#999" }}>👤 {discussion.DiscussionReplies ? new Set(discussion.DiscussionReplies.map((r) => r.userId)).size : 0} participants</small>
                        <small style={{ color: "#999" }}>{discussion.replyCount ?? (discussion.DiscussionReplies?.length || 0)} replies</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "40px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "16px",
                  textAlign: "center",
                  color: "#666"
                }}>
                  <p>No active discussions yet.</p>
                  <button style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    background: "#367cfe",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}>
                    Start Discussion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LogoutToast show={showLogoutToast} />
    </>
  );
};

export default InstructorDiscussions;
