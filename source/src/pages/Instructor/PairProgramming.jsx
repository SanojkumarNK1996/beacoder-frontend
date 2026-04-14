import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainPageLoader from "../../components/MainPageLoader";
import { InstructorSidebar } from "../../components/InstructorSidebar";
import { TopBar } from "../../components/TopBar";
import axios from "axios";

// ✅ Success Toast Component
const SuccessToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast success" style={{ zIndex: 12000, position: 'fixed', top: '20px', right: '20px' }}>
      <span className="toast-icon">✔</span>
      {message || "Action completed successfully!"}
    </div>
  );
};

// ✅ Error Toast Component
const ErrorToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast failed" style={{ zIndex: 12000, position: 'fixed', top: '20px', right: '20px' }}>
      <span className="toast-icon">✖</span>
      {message || "An error occurred!"}
    </div>
  );
};

const PairProgramming = () => {
  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("Instructor");
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
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
        const [userData, sessionsData, coursesData] = await Promise.all([
          fetchInstructorProfile(token),
          fetchPairProgrammingSessions(token),
          fetchCourses(token),
        ]);
        setUserName(userData.userName || "Instructor");
        setSessions(sessionsData);
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
    if (token && (selectedCourse !== undefined || selectedStatus !== undefined)) {
      fetchPairProgrammingSessions(token, selectedCourse || null, selectedStatus).then(setSessions);
    }
  }, [selectedCourse, selectedStatus]);

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

  const fetchPairProgrammingSessions = async (token, courseId = null, status = "all") => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin/pair-programming`;
      const params = [];
      if (courseId) params.push(`courseId=${courseId}`);
      if (status && status !== "all") params.push(`status=${status}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      const response = await axios.get(url, config);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pair programming sessions:', error);
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
    navigate("/login");
  };

  const handleMarkCompleted = async (discussionId) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin/${discussionId}/pair-programming-status`, {}, config);
      setToastMessage("Pair programming marked as completed!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      // Refetch sessions with current filters
      const updatedSessions = await fetchPairProgrammingSessions(token, selectedCourse || null, selectedStatus);
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error marking as completed:", error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      setToastMessage(serverMessage || "Failed to mark as completed. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  if (isLoading) {
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading pair programming requests..." />;
  }

  return (
    <div className="course-list-container">
      <InstructorSidebar hovered={hovered} setHovered={setHovered} />

      <div className="course-list-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="course-list-inner">
          <div className="course-list-content">
            <h2 style={{ marginBottom: "20px", color: "#1e1e1e" }}>Pair Programming Requests</h2>

            <div style={{ marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
              <div>
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
              <div>
                <label htmlFor="status-select" style={{ marginRight: "10px", fontWeight: "bold" }}>Select Status:</label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {sessions && sessions.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
              }}>
                {sessions.map((session) => (
                  <div key={session._id} style={{
                    padding: "20px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                  }}>
                    <h3 style={{ color: "#367cfe", marginBottom: "8px" }}>{session.user.name}</h3>
                    <p style={{ color: "#696969", marginBottom: "4px" }}><strong>Email:</strong> {session.user.email}</p>
                    <p style={{ color: "#696969", marginBottom: "4px" }}><strong>Phone:</strong> {session.user.phone}</p>
                    <p style={{ color: "#696969", marginBottom: "4px" }}><strong>Booked Slot:</strong> {new Date(session.bookedSlot).toLocaleString()}</p>
                    <p style={{ color: "#696969", marginBottom: "4px" }}><strong>Course:</strong> {session.courseName}</p>
                    {session.assignmentTitle && (
                      <p style={{ color: "#696969", marginBottom: "8px" }}><strong>Assignment:</strong> {session.assignmentTitle}</p>
                    )}
                    {(session.pairProgramingStatus || session.pairProgrammingStatus) ? (
                      <button
                        disabled
                        style={{
                          padding: "8px 16px",
                          background: "#b0bec5",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "not-allowed",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        Completed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkCompleted(session._id)}
                        style={{
                          padding: "8px 16px",
                          background: "linear-gradient(135deg, #4caf50, #45a049)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #45a049, #4caf50)";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(76, 175, 80, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #4caf50, #45a049)";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(76, 175, 80, 0.3)";
                        }}
                      >
                        Mark as Completed
                      </button>
                    )}
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
                <p>No pair programming requests yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <SuccessToast show={showSuccessToast} message={toastMessage} />
      <ErrorToast show={showErrorToast} message={toastMessage} />
    </div>
  );
};

export default PairProgramming;
