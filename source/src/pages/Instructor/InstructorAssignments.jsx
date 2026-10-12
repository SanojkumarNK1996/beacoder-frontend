import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";
import { FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaBookOpen, FaEye } from "react-icons/fa";
import "./InstructorAssignments.css";

const apiBase = `${import.meta.env.VITE_BASE_URL}/api/v1`;
const authConfig = (token) => token ? { headers: { Authorization: `Bearer ${token}` } } : {};

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  const rows = payload?.assignments || payload?.submissions || payload?.data?.assignments ||
    payload?.data?.submissions || payload?.data;
  return Array.isArray(rows) ? rows : [];
};

const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";

const InstructorAssignments = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Instructor");
  const [isLoading, setIsLoading] = useState(true);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [assignmentStats, setAssignmentStats] = useState({ pendingCount: 0, completedCount: 0, rejectedCount: 0 });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  useEffect(() => {
    if (!["instructor", "admin"].includes(localStorage.getItem("userRole"))) {
      navigate("/login");
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError("");
      const token = localStorage.getItem("authToken");
      const config = authConfig(token);
      const params = {};
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedStatus) params.status = selectedStatus;

      try {
        const [profileResponse, coursesResponse, submissionsResponse] = await Promise.all([
          axios.get(`${apiBase}/user/profile`, config),
          axios.get(`${apiBase}/content-editor/courses`, config),
          axios.get(`${apiBase}/assignments/admin/submitted`, { ...config, params }),
        ]);
        if (cancelled) return;

        const profile = profileResponse.data?.data || profileResponse.data || {};
        const responseData = submissionsResponse.data?.data || submissionsResponse.data || {};
        const rows = extractRows(submissionsResponse.data);
        const courseRows = coursesResponse.data?.data ?? coursesResponse.data?.courses ?? [];
        setUserName(profile.userName || profile.name || "Instructor");
        setCourses(Array.isArray(courseRows)
          ? [...courseRows].sort((first, second) =>
            String(first.courseName || first.name || first.courseKey || "").localeCompare(
              String(second.courseName || second.name || second.courseKey || "")
            )
          )
          : []);
        setSubmittedAssignments(rows);
        setAssignmentStats({
          pendingCount: responseData.status?.pendingCount ?? responseData.pendingCount ?? rows.filter((row) => row.status === "submitted").length,
          completedCount: responseData.status?.completedCount ?? responseData.completedCount ?? rows.filter((row) => row.status === "completed").length,
          rejectedCount: responseData.status?.rejectedCount ?? responseData.rejectedCount ?? rows.filter((row) => row.status === "rejected").length,
        });
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching instructor assignments:", error);
        setLoadError(error.response?.data?.message || "Failed to load submitted assignments. Please try again.");
        setSubmittedAssignments([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [navigate, selectedCourse, selectedStatus]);

  useEffect(() => {
    if (!showLogoutToast) return undefined;
    const timer = setTimeout(() => {
      setShowLogoutToast(false);
      navigate("/login");
    }, 1500);
    return () => clearTimeout(timer);
  }, [showLogoutToast, navigate]);

  const handleViewDetails = (submission) => {
    navigate("/instructor/assignments/detail", { state: { submission, userName } });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setShowLogoutToast(true);
  };

  if (isLoading) return <DashboardLayout userName={userName}><div className="dashboard-layout__loading" role="status">Loading assignments…</div></DashboardLayout>;

  return (
    <DashboardLayout
      userName={userName}
      onLogout={handleLogout}
      contentClassName="course-list-content"
      overlays={showLogoutToast && <div className="logout-toast" style={{ zIndex: 12000 }}><span className="logout-toast-icon">✔</span>Logout Successful! Redirecting to login...</div>}
    >
            <div className="assignment-stats-container">
              <div className="stat-card stat-pending">
                <div className="stat-card-header"><FaClock /> Submitted for Review</div>
                <h3 className="stat-card-value">{assignmentStats.pendingCount}</h3>
                <p className="stat-card-label">Submissions</p>
              </div>
              <div className="stat-card stat-reviewed">
                <div className="stat-card-header"><FaCheckCircle /> Approved</div>
                <h3 className="stat-card-value">{assignmentStats.completedCount}</h3>
                <p className="stat-card-label">Assignments</p>
              </div>
              <div className="stat-card stat-rejected">
                <div className="stat-card-header"><FaTimesCircle /> Rejected</div>
                <h3 className="stat-card-value">{assignmentStats.rejectedCount}</h3>
                <p className="stat-card-label">Assignments</p>
              </div>
            </div>

            <div className="submitted-assignments-section">
              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="course-filter" className="filter-label"><FaBookOpen className="filter-icon" />Course</label>
                  <select id="course-filter" value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="filter-select">
                    <option value="">All Courses</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.courseName}</option>)}
                  </select>
                </div>
                <div className="filter-divider" />
                <div className="filter-group">
                  <label htmlFor="status-filter" className="filter-label"><FaClock className="filter-icon" />Status</label>
                  <select id="status-filter" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="filter-select">
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {!loadError && (
                  <span className="submission-count">
                    {submittedAssignments.length} {submittedAssignments.length === 1 ? "submission" : "submissions"}
                  </span>
                )}
              </div>

              {loadError && <div className="no-assignments" role="alert">{loadError}</div>}
              {!loadError && submittedAssignments.length ? (
                <div className="assignments-list">
                  {submittedAssignments.map((submission) => (
                    <div key={submission.id} className="assignment-item">
                      <div className="assignment-header">
                        <div className="assignment-title-section">
                          <div className="assignment-title-and-course">
                            <h3 className="assignment-title">{submission.Assignment?.title || "Assignment"}</h3>
                            <div className="course-info"><FaBookOpen className="course-icon" /><span>{submission.Assignment?.Subtopic?.CourseTopic?.Course?.courseName || "Course"}</span></div>
                          </div>
                          <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                        </div>
                      </div>
                      <div className="assignment-details">
                        <div className="detail-row">
                          <FaUser className="detail-icon" />
                          <div className="submission-detail-content"><span className="detail-label">Submitted by</span><span className="detail-value">{submission.User?.name || submission.User?.email || "Student"}</span></div>
                        </div>
                        <div className="detail-row">
                          <FaCalendarAlt className="detail-icon" />
                          <div className="submission-detail-content"><span className="detail-label">Submitted on</span><span className="detail-value">{formatDate(submission.submittedAt)}</span></div>
                        </div>
                        {submission.marksObtained != null && (
                          <div className="detail-row"><div className="marks-info"><span className="marks-label">Marks</span><span className="marks-value">{submission.marksObtained}</span></div></div>
                        )}
                      </div>
                      {submission.feedback && <div className="feedback-section"><span className="feedback-label">Feedback</span><p className="feedback-text">{submission.feedback}</p></div>}
                      <div className="assignment-actions">
                        <button onClick={() => handleViewDetails(submission)} className="view-details-btn"><FaEye /> View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loadError ? (
                <div className="no-assignments"><p>No submitted assignments found.</p></div>
              ) : null}
            </div>
    </DashboardLayout>
  );
};

export default InstructorAssignments;
