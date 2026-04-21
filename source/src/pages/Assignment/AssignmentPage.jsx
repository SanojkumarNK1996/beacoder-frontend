import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AssignmentPage.css";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { CourseListRightSidebar } from "../../components/CourseListRightSidebar";
import MainPageLoader from "../../components/MainPageLoader";

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

// ✅ Assignment Success Toast Component
const AssignmentSuccessToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      Assignment Submitted Successfully!
    </div>
  );
};

// ✅ Assignment Error Toast Component
const AssignmentErrorToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast failed">
      <span className="toast-icon">✖</span>
      {message || "Submission Failed!"}
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

const AssignmentPage = () => {
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(3);
  const [assignments, setAssignments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast states for assignment submission
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // track which assignment is expanded
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  // temporary urls for each assignment
  const [submissionUrls, setSubmissionUrls] = useState({});
  // filter state - 'all' is default (server supports status query)
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const handleToggle = (id) => {
    setExpandedAssignment((prev) => (prev === id ? null : id));
  };

  const handleUrlChange = (id, value) => {
    setSubmissionUrls((prev) => ({ ...prev, [id]: value }));
  };


  const handleSubmit = async (id, allowedType = "URL") => {
    const submission = submissionUrls[id];

    if (!submission || submission.trim() === "") {
      setErrorMessage("Please enter a submission");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    // Validate based on allowedSubmissionType
    if (allowedType === "URL") {
      try {
        new URL(submission);
      } catch (e) {
        setErrorMessage("Please enter a valid URL");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }
    } else if (allowedType === "TEXT") {
      if (submission.trim().length < 5) {
        setErrorMessage("Text submission must be at least 5 characters");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };

      // Build payload based on submission type
      const payload = allowedType === "URL" 
        ? { submissionUrl: submission }
        : { textAnswer: submission };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/${id}/submit`,
        payload,
        config
      );

      setShowSuccessToast(true);
      setSubmissionUrls((prev) => ({ ...prev, [id]: "" }));
      setTimeout(() => {
        setShowSuccessToast(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      setErrorMessage(
        serverMessage
          ? serverMessage
          : "Failed to submit assignment. Please try again."
      );
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

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
            description: badge.description || "Earned a new badge",
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
      setIsLoading(true);
      try {
        const config = {};
        if (token) config.headers = { Authorization: `Bearer ${token}` };

        // Build assignments URL with optional status query (server supports it)
        let assignmentsUrl = `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments`;
        if (statusFilter && statusFilter !== "all") {
          const apiStatus = statusFilter === "completed" ? "submitted" : statusFilter;
          assignmentsUrl += `?status=${apiStatus}`;
        }

        // Fetch assignments (server will return filtered list when status provided)
        const assignmentsResponse = await axios.get(assignmentsUrl, config);
        if (assignmentsResponse.data.success) {
          setAssignments(assignmentsResponse.data.assignments || []);
        }

        // Fetch user profile
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`,
          config
        );
        if (profileResponse.data) {
          setUserName(profileResponse.data.userName || "User");
        }

        // Fetch badges for achievements panel
        await fetchBadges(token);
      } catch (error) {
        console.error("Error fetching data:", error);
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
        setErrorMessage(
          serverMessage
            ? serverMessage
            : "Failed to load assignments. Please try again."
        );
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 4000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

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
    return (
      <MainPageLoader
        variant="headerSidebarSkeleton"
        text="Loading assignments..."
      />
    );
  }

  return (
    <div className="assignment-container">
      <Sidebar
        active={active}
        hovered={hovered}
        setActive={setActive}
        setHovered={setHovered}
      />

      <div className="assignment-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="assignment-inner">
          <div className="assignment-content">
            <div className="assignment-list-section">
              <div className="assignment-filter-header">
                <h2 className="assignment-section-title">My Assignments</h2>
                <div className="assignment-filter-buttons">
                  <button
                    className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "completed" ? "active" : ""}`}
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>
              {assignments && assignments.length > 0 ? (
                <div className="assignment-cards-grid">
                  {assignments
                    .filter((assignment) => {
                      const completedStatuses = ["submitted", "accepted"];
                      const normalizedStatus = normalizeStatus(assignment.status);
                      if (statusFilter === "pending") return !completedStatuses.includes(normalizedStatus);
                      if (statusFilter === "completed") return completedStatuses.includes(normalizedStatus);
                      return true;
                    })
                    .map((assignment, index) => {
                      const desc = assignment.Assignment?.description;
                      const normalizedStatus = normalizeStatus(assignment.status);
                      const isSubmitted = ["submitted", "accepted"].includes(normalizedStatus);
                      const language = desc?.language || "javascript";
                      // always use the site accent for the language badge so it never
                      // clashes with the status color. this keeps the blue
                      // branding consistent across pages.
                      const getLanguageColor = () => {
                        return "#367cfe"; // primary accent color used throughout the app
                      };
                      const getStatusColor = (status) => {
                        const normalized = normalizeStatus(status);
                        const colors = {
                          pending: "#dc3545",      // solid red
                          unlocked: "#ffc107",    // orange
                          submitted: "#28a745",   // solid green
                          accepted: "#ffc107",    // yellow for accepted
                          locked: "#dc3545",      // solid red
                          rejected: "#fd7e14",    // orange for rejected
                        };
                        return colors[normalized] || colors.unlocked;
                      };
                      const isExpanded = expandedAssignment === assignment.id;

                      return (
                        <div key={assignment.id} className="assignment-card">
                          {/* summary row - always visible */}
                          <div
                            className={`assignment-card-summary ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleToggle(assignment.id)}
                          >
                            <div className="assignment-card-top">
                              <div
                                className="assignment-language-badge"
                                style={{
                                  backgroundColor: getLanguageColor(language),
                                }}
                              >
                                {language.toUpperCase()}
                              </div>
                              <span
                                className="assignment-status"
                                style={{
                                  backgroundColor: getStatusColor(
                                    assignment.status
                                  ),
                                  color: "#fff", // white text for dark backgrounds
                                }}
                              >
                                {assignment.status?.charAt(0).toUpperCase() +
                                  assignment.status?.slice(1)}
                              </span>
                            </div>
                            <div className="assignment-card-header">
                              <h3 className="assignment-title">
                                {assignment.Assignment?.title ||
                                  "Untitled Assignment"}
                              </h3>
                            </div>
                            <div className="assignment-due-date-section">
                              <span className="due-label">📅 Due:</span>
                              <span className="due-value">
                                {assignment.Assignment?.dueDate
                                  ? new Date(
                                    assignment.Assignment.dueDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                  : "No due date"}
                              </span>
                              <span className="expand-arrow">
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                          </div>

                          {/* expanded details */}
                          {isExpanded && (
                            <div className="assignment-card-expanded">
                              <div className="assignment-card-body">
                                {desc?.task && (
                                  <div className="description-section">
                                    <label className="section-label">
                                      Task:
                                    </label>
                                    <p className="section-text">{desc.task}</p>
                                  </div>
                                )}
                                {desc?.context && (
                                  <div className="description-section">
                                    <label className="section-label">
                                      Context:
                                    </label>
                                    <p className="section-text">
                                      {desc.context}
                                    </p>
                                  </div>
                                )}
                                {desc?.instructions && (
                                  <div className="description-section">
                                    <label className="section-label">
                                      Instructions:
                                    </label>
                                    <ul className="instructions-list">
                                      {desc.instructions.map((instr, i) => (
                                        <li key={i}>{instr}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {desc?.expectedOutput && (
                                  <div className="description-section">
                                    <label className="section-label">
                                      Expected Output:
                                    </label>
                                    <code className="code-block">
                                      {desc.expectedOutput}
                                    </code>
                                  </div>
                                )}
                              </div>

                              {/* submission form */}
                              {!isSubmitted && (
                                <div className="submission-form">
                                  <input
                                    type="text"
                                    placeholder="Paste your submission link"
                                    value={submissionUrls[assignment.Assignment.id] || ""}
                                    onChange={(e) =>
                                      handleUrlChange(
                                        assignment.Assignment.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    className="assignment-btn-view"
                                    onClick={() => handleSubmit(assignment.Assignment.id, assignment.Assignment?.allowedSubmissionType || "URL")}
                                  >
                                    Submit
                                  </button>
                                </div>
                              )}

                              {isSubmitted && assignment.status === "submitted" && (
                                <div className="submission-form">
                                  <input
                                    type="text"
                                    placeholder="Paste your resubmission link"
                                    value={submissionUrls[assignment.Assignment.id] || ""}
                                    onChange={(e) =>
                                      handleUrlChange(
                                        assignment.Assignment.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <button
                                    className="assignment-btn-view"
                                    onClick={() => handleSubmit(assignment.Assignment.id, assignment.Assignment?.allowedSubmissionType || "URL")}
                                  >
                                    Edit Submission
                                  </button>
                                </div>
                              )}

                              {isSubmitted && (assignment.status === "accepted" || assignment.status === "graded") && (
                                <div className="assignment-submission-info">
                                  <div className="submission-item">
                                    <span className="submission-label">
                                      Marks Obtained:
                                    </span>
                                    <span className="submission-value">
                                      {assignment.marksObtained ?? "--"} /{' '}
                                      {assignment.Assignment?.maxMarks}
                                    </span>
                                  </div>
                                  {assignment.feedback && (
                                    <div className="submission-item">
                                      <span className="submission-label">
                                        Feedback:
                                      </span>
                                      <span className="submission-value">
                                        {assignment.feedback}
                                      </span>
                                    </div>
                                  )}
                                  <div className="submission-item">
                                    <span className="submission-label">
                                      Submitted:
                                    </span>
                                    <span className="submission-value">
                                      {assignment.submittedAt
                                        ? new Date(
                                          assignment.submittedAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                        : "--"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="assignment-empty-state">
                  <p>No assignments available yet.</p>
                </div>
              )}
            </div>
          </div>

          <CourseListRightSidebar
            activities={initialActivities}
            achievements={achievements}
          />
        </div>

        <LogoutToast show={showLogoutToast} />
        <AssignmentSuccessToast show={showSuccessToast} />
        <AssignmentErrorToast show={showErrorToast} message={errorMessage} />
      </div>
    </div>
  );
};

export default AssignmentPage;