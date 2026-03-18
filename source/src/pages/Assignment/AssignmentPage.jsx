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
    <div className="logout-toast">
      <span className="logout-toast-icon">✔</span>
      Logout Successful! Redirecting to login...
    </div>
  );
};

// Attractive alert banner used for success/error messages
const AlertBanner = ({ show, type = "success", message = "", onClose }) => {
  if (!show) return null;
  return (
    <div className={`alert-banner ${type === "success" ? "success" : "error"}`}>
      <div className="alert-content">
        <span className="alert-icon">{type === "success" ? "✔" : "⚠"}</span>
        <div className="alert-message">{message}</div>
        <button className="alert-close" onClick={onClose} aria-label="Close">×</button>
      </div>
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

const AssignmentPage = () => {
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(3);
  const [assignments, setAssignments] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // track which assignment is expanded
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  // temporary urls for each assignment
  const [submissionUrls, setSubmissionUrls] = useState({});
  // filter state - 'all' is default (server supports status query)
  const [statusFilter, setStatusFilter] = useState("all");

  const alertTimerRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  const showAlert = (type, message, timeout = 3500) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlert({ show: true, type, message });
    alertTimerRef.current = setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
      alertTimerRef.current = null;
    }, timeout);
  };

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

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
      showAlert("error", "Please enter a submission");
      return;
    }

    // Validate based on allowedSubmissionType
    if (allowedType === "URL") {
      try {
        new URL(submission);
      } catch (e) {
        showAlert("error", "Please enter a valid URL");
        return;
      }
    } else if (allowedType === "TEXT") {
      if (submission.trim().length < 5) {
        showAlert("error", "Text submission must be at least 5 characters");
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

      showAlert("success", "Assignment submitted successfully!");
      setSubmissionUrls((prev) => ({ ...prev, [id]: "" }));
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      showAlert("error", "Failed to submit assignment. Please try again.");
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
          assignmentsUrl += `?status=${statusFilter}`;
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
      } catch (error) {
        console.error("Error fetching data:", error);
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
                    className={`filter-btn ${statusFilter === "submitted" ? "active" : ""}`}
                    onClick={() => setStatusFilter("submitted")}
                  >
                    Completed
                  </button>
                </div>
              </div>
              {assignments && assignments.length > 0 ? (
                <div className="assignment-cards-grid">
                  {assignments
                    .filter((assignment) => {
                      if (statusFilter === "pending") return assignment.status !== "submitted";
                      if (statusFilter === "submitted") return assignment.status === "submitted";
                      return true;
                    })
                    .map((assignment, index) => {
                      const desc = assignment.Assignment?.description;
                      const isSubmitted = assignment.status === "submitted";
                      const language = desc?.language || "javascript";
                      // always use the site accent for the language badge so it never
                      // clashes with the status color. this keeps the blue
                      // branding consistent across pages.
                      const getLanguageColor = () => {
                        return "#367cfe"; // primary accent color used throughout the app
                      };
                      const getStatusColor = (status) => {
                        const colors = {
                          pending: "#dc3545",      // solid red
                          unlocked: "#ffc107",    // orange
                          submitted: "#28a745",   // solid green
                          graded: "#17a2b8",      // cyan
                          locked: "#dc3545",      // solid red
                        };
                        return colors[status] || colors.unlocked;
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
            achievements={initialAchievements}
          />
        </div>

        <AlertBanner
          show={alert.show}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        />
        <LogoutToast show={showLogoutToast} />
      </div>
    </div>
  );
};

export default AssignmentPage;