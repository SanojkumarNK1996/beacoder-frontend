import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaLightbulb,
  FaList,
  FaRocket,
  FaUpload,
} from "react-icons/fa";
import "./AssignmentPage.css";
import DashboardLayout from "../../components/DashboardLayout";
import { descriptionToText, normalizeAssignmentDescription } from "../../utils/assignmentDescription";

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
const AssignmentSuccessToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      {message || "Assignment Submitted Successfully!"}
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

const formatElapsedTime = (startedAt, submittedAt) => {
  if (!startedAt || !submittedAt) return null;
  const elapsedMinutes = Math.floor((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes < 0) return null;
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const formatAssignmentDate = (value, includeTime = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
};

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const AssignmentDetailPanel = ({ assignment, submissionValue, isSubmitting, onUrlChange, onSubmit }) => {
  const submissionInputRef = useRef(null);
  const status = normalizeStatus(assignment.status);
  const isCompleted = status === "completed";
  const isSubmitted = status === "submitted";
  const isRejected = status === "rejected";
  const description = normalizeAssignmentDescription(assignment.Assignment?.description);
  const courseName = assignment.Assignment?.Subtopic?.CourseTopic?.Course?.courseName || "Course not set";
  const submissionUrl = assignment.submissionUrl || assignment.answer || "";
  const elapsedTime = formatElapsedTime(assignment.startedAt, assignment.submittedAt)
    || assignment.time
    || assignment.timeTaken
    || assignment.timeSpent
    || null;
  const taskLines = descriptionToText(description.task).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const statusLabel = status
    ? status.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase())
    : "Assigned";
  const submittedAt = assignment.submittedAt || assignment.completedAt;
  const progressItems = [
    { key: "started", label: "Started", value: formatAssignmentDate(assignment.startedAt, true), icon: <FaCalendarAlt aria-hidden="true" />, tone: "blue" },
    {
      key: "submitted",
      label: "Submitted",
      value: isSubmitted || isCompleted ? formatAssignmentDate(submittedAt, true) : null,
      icon: <FaCheckCircle aria-hidden="true" />,
      tone: "green",
    },
    { key: "last-submitted", label: "Last Submitted", value: formatAssignmentDate(assignment.submittedAt, true), icon: <FaUpload aria-hidden="true" />, tone: "purple" },
    { key: "time-spent", label: "Time Spent", value: elapsedTime, icon: <FaClock aria-hidden="true" />, tone: "purple" },
  ].filter(({ value }) => value);
  const descriptionSections = [
    ["learningBenefits", "Learning Benefits", <FaLightbulb aria-hidden="true" />],
    ["context", "Context", <FaFileAlt aria-hidden="true" />],
    ["expectedOutput", "Expected Output", <FaRocket aria-hidden="true" />],
  ].map(([key, label, icon]) => ({
    key,
    label,
    icon,
    content: descriptionToText(description[key]),
  })).filter(({ content }) => content);

  return (
    <div className="assignment-detail-inline">
      <div className="assignment-detail-layout">
        <main className="assignment-detail-sections">
          <section className="assignment-detail-section task">
            <div className="assignment-detail-section-heading">
              <span className="assignment-detail-section-icon"><FaList aria-hidden="true" /></span>
              <span className="assignment-detail-section-title">Task</span>
              {taskLines.length > 1 && <span className="assignment-detail-step-count">{taskLines.length} steps</span>}
            </div>
            <div className="assignment-detail-task-list">
              {taskLines.length
                ? taskLines.map((line, index) => (
                  <div className="assignment-detail-task-step" key={`${index}-${line}`}>
                    <span>{index + 1}</span><p>{line}</p>
                  </div>
                ))
                : <p className="assignment-detail-empty-copy">No task details have been added.</p>}
            </div>
          </section>

          {descriptionSections.map(({ key, label, icon, content }) => (
            <section className={`assignment-detail-section ${key}`} key={key}>
              <div className="assignment-detail-section-heading">
                <span className="assignment-detail-section-icon">{icon}</span>
                <span className="assignment-detail-section-title">{label}</span>
              </div>
              <div className="assignment-detail-section-content">
                {key === "expectedOutput"
                  ? <pre className="assignment-detail-output">{content}</pre>
                  : <p>{content}</p>}
              </div>
            </section>
          ))}
        </main>

        <aside className="assignment-detail-sidebar">
          <section className="assignment-detail-side-card">
            <h2><span className="assignment-detail-side-icon summary"><FaFileAlt aria-hidden="true" /></span>Assignment Summary</h2>
            <dl className="assignment-detail-summary">
              <div><dt><FaBook aria-hidden="true" />Course</dt><dd>{courseName}</dd></div>
              <div>
                <dt><FaRocket aria-hidden="true" />Difficulty</dt>
                <dd><span className={`assignment-detail-value-tag ${assignment.Assignment?.difficulty || ""}`}>{assignment.Assignment?.difficulty || "Not set"}</span></dd>
              </div>
              <div>
                <dt><FaCheckCircle aria-hidden="true" />Status</dt>
                <dd><span className={`assignment-detail-value-tag status ${status}`}>{statusLabel}</span></dd>
              </div>
            </dl>
          </section>

          <section className="assignment-detail-side-card">
            <h2><span className="assignment-detail-side-icon progress"><FaClock aria-hidden="true" /></span>Progress &amp; Timing</h2>
            {progressItems.length ? (
              <div className="assignment-detail-progress-grid">
                {progressItems.map((item) => (
                  <div className={`assignment-detail-progress-item ${item.tone}`} key={item.key}>
                    <span className="assignment-detail-progress-icon">{item.icon}</span>
                    <span><strong>{item.label}</strong><small>{item.value}</small></span>
                  </div>
                ))}
              </div>
            ) : <p className="assignment-detail-empty-copy">Progress details will appear as you work.</p>}
          </section>

          <section className="assignment-detail-latest assignment-detail-side-card">
            <div className="assignment-detail-latest-heading">
              <span className="assignment-detail-latest-icon"><FaFileAlt aria-hidden="true" /></span>
              <div>
                <h2>Latest Submission</h2>
                {assignment.submittedAt && <p>Submitted on {formatAssignmentDate(assignment.submittedAt, true)}</p>}
              </div>
            </div>
            {submissionUrl ? (
              <div className="assignment-detail-submission-link">
                <a href={submissionUrl} target="_blank" rel="noreferrer">{submissionUrl}</a>
              </div>
            ) : <p className="assignment-detail-empty-copy">No submission has been added yet.</p>}

            {(assignment.marksObtained != null || assignment.feedback) && (
              <div className="assignment-detail-feedback">
                {assignment.marksObtained != null && <p><strong>Marks:</strong> {assignment.marksObtained}</p>}
                {assignment.feedback && <p><strong>{isRejected ? "Mentor feedback:" : "Feedback:"}</strong> {assignment.feedback}</p>}
              </div>
            )}
          </section>
        </aside>

        {!isCompleted && (
          <section className="assignment-detail-submit-tile">
            <div className="assignment-detail-submit-tile-heading">
              <span className="assignment-detail-side-icon progress"><FaUpload aria-hidden="true" /></span>
              <div>
                <h2>{isSubmitted || isRejected
                  ? "Submit a new link to replace your latest submission"
                  : "Submit your assignment"}</h2>
                <p>{isSubmitted || isRejected
                  ? "Your new link will replace the current submission."
                  : "Add a link to your completed work to submit it for review."}</p>
              </div>
            </div>
            <form
              className="assignment-detail-submission-form"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <label htmlFor={`assignment-submission-input-${assignment.id}`}>Submission link</label>
              <div>
                <input
                  ref={submissionInputRef}
                  id={`assignment-submission-input-${assignment.id}`}
                  type="url"
                  placeholder="https://..."
                  value={submissionValue}
                  onChange={(event) => onUrlChange(event.target.value)}
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : isSubmitted || isRejected ? "Resubmit" : "Submit Assignment"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast states for assignment submission
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [startingAssignment, setStartingAssignment] = useState(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [submissionUrls, setSubmissionUrls] = useState({});
  // Completed is a terminal status; every other lifecycle status remains active.
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const handleToggle = async (assignment) => {
    const rowId = assignment.id;
    if (startingAssignment === rowId) return;
    if (selectedAssignmentId === rowId) {
      setSelectedAssignmentId(null);
      return;
    }

    if (normalizeStatus(assignment.status) === "assigned") {
      setStartingAssignment(rowId);
      try {
        const token = localStorage.getItem("authToken");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/user/${rowId}/start`,
          {},
          config
        );
        setAssignments((current) => current.map((item) =>
          item.id === rowId ? { ...item, status: "in_progress", startedAt: item.startedAt || new Date().toISOString() } : item
        ));
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || "Could not start this assignment. Please try again.");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      } finally {
        setStartingAssignment(null);
      }
    }
    setSelectedAssignmentId(rowId);
  };

  const handleUrlChange = (id, value) => {
    setSubmissionUrls((prev) => ({ ...prev, [id]: value }));
  };


  const handleSubmit = async (id) => {
    const row = assignments.find((item) => item.id === id);
    if (!row || normalizeStatus(row.status) === "completed" || submittingAssignmentId === id) return;
    const submission = submissionUrls[id] ?? row.submissionUrl ?? row.answer ?? "";

    if (!submission || submission.trim() === "") {
      setErrorMessage("Please enter a submission");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      const url = new URL(submission.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Unsupported URL protocol");
    } catch {
      setErrorMessage("Please enter a valid http or https URL");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    setSubmittingAssignmentId(id);
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };

      const payload = { submissionUrl: submission.trim() };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/${id}/submit`,
        payload,
        config
      );

      setSuccessMessage("Assignment submitted successfully.");
      setAssignments((current) => current.map((item) => item.id === id
        ? {
            ...item,
            ...payload,
            answer: payload.submissionUrl,
            status: "submitted",
            submittedAt: new Date().toISOString(),
            ...(row.status === "rejected" ? { feedback: null, marksObtained: null, completedAt: null } : {}),
          }
        : item
      ));
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
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
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const assignmentsResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments`,
          config
        );
        const responseData = assignmentsResponse.data;
        const rows = Array.isArray(responseData) ? responseData
          : responseData?.assignments ?? responseData?.data?.assignments ?? responseData?.data ?? [];
        setAssignments(Array.isArray(rows) ? rows : []);

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

  const completedCount = assignments.filter((assignment) => normalizeStatus(assignment.status) === "completed").length;
  const rejectedCount = assignments.filter((assignment) => normalizeStatus(assignment.status) === "rejected").length;
  const activeCount = assignments.length - completedCount - rejectedCount;
  const filteredAssignments = assignments.filter((assignment) => {
    const status = normalizeStatus(assignment.status);
    if (statusFilter === "pending") return status !== "completed" && status !== "rejected";
    if (statusFilter === "rejected") return status === "rejected";
    if (statusFilter === "completed") return status === "completed";
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="assignment-content"><div className="dashboard-layout__loading" role="status">Loading assignments…</div></DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={userName}
      onLogout={handleLogout}
      contentClassName="assignment-content"
      overlays={<>
        <LogoutToast show={showLogoutToast} />
        <AssignmentSuccessToast show={showSuccessToast} message={successMessage} />
        <AssignmentErrorToast show={showErrorToast} message={errorMessage} />
      </>}
    >
            <div className="assignment-list-section">
              <div className="assignment-toolbar">
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
                    Active
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "completed" ? "active" : ""}`}
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "rejected" ? "active" : ""}`}
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Rejected
                  </button>
                </div>
              </div>
              <div className="assignment-overview">
                <div className="assignment-overview-item">
                  <span className="assignment-overview-icon">◷</span>
                  <span><strong>{activeCount}</strong><small>Active</small></span>
                </div>
                <div className="assignment-overview-item">
                  <span className="assignment-overview-icon complete">✓</span>
                  <span><strong>{completedCount}</strong><small>Completed</small></span>
                </div>
                <div className="assignment-overview-item">
                  <span className="assignment-overview-icon rejected">!</span>
                  <span><strong>{rejectedCount}</strong><small>Rejected</small></span>
                </div>
                <div className="assignment-overview-item">
                  <span className="assignment-overview-icon total">#</span>
                  <span><strong>{assignments.length}</strong><small>Total assignments</small></span>
                </div>
              </div>
              {filteredAssignments.length > 0 ? (
                <div className="assignment-cards-grid">
                  {filteredAssignments.map((assignment) => {
                      const isExpanded = selectedAssignmentId === assignment.id;
                      const getStatusColor = (status) => {
                        const normalized = normalizeStatus(status);
                        const colors = {
                          assigned: "#64748b",
                          in_progress: "#2563eb",
                          submitted: "#d97706",
                          completed: "#16a34a",
                          rejected: "#dc2626",
                        };
                        return colors[normalized] || "#64748b";
                      };

                      return (
                        <article key={assignment.id} className="assignment-card student-assignment-card">
                          <button
                            type="button"
                            className={`assignment-card-summary ${isExpanded ? "expanded" : ""}`}
                            onClick={() => handleToggle(assignment)}
                            disabled={startingAssignment !== null || submittingAssignmentId !== null}
                            aria-expanded={isExpanded}
                            aria-label={`View ${assignment.Assignment?.title || "assignment"} details`}
                          >
                            <span className="student-assignment-title-row">
                              <span className="assignment-title">{assignment.Assignment?.title || "Untitled Assignment"}</span>
                              {assignment.Assignment?.Subtopic?.CourseTopic?.Course?.courseName && (
                                <span className="student-assignment-course">
                                  {assignment.Assignment.Subtopic.CourseTopic.Course.courseName}
                                </span>
                              )}
                              <span className={`assignment-difficulty-tag ${assignment.Assignment?.difficulty || ""}`}>
                                {assignment.Assignment?.difficulty || "Difficulty missing"}
                              </span>
                              <span
                                className="assignment-status"
                                style={{ backgroundColor: getStatusColor(assignment.status), color: "#fff" }}
                              >
                                {assignment.status?.replace(/_/g, " ") || "Assigned"}
                              </span>
                              <span className="expand-arrow" aria-hidden="true">{isExpanded ? "⌃" : "⌄"}</span>
                            </span>
                          </button>
                          <div className="student-assignment-card-footer">
                            <span>{assignment.assignedAt
                              ? `Assigned ${formatAssignmentDate(assignment.assignedAt)}`
                              : "Select to view assignment details"}</span>
                            {startingAssignment === assignment.id && <span className="student-assignment-opening">Opening assignment...</span>}
                            {startingAssignment !== assignment.id && (
                              <span className="student-assignment-expand-hint">{isExpanded ? "Collapse details" : "Expand for details"}</span>
                            )}
                          </div>
                          {isExpanded && (
                            <AssignmentDetailPanel
                              assignment={assignment}
                              submissionValue={submissionUrls[assignment.id] ?? assignment.submissionUrl ?? assignment.answer ?? ""}
                              isSubmitting={submittingAssignmentId === assignment.id}
                              onUrlChange={(value) => handleUrlChange(assignment.id, value)}
                              onSubmit={() => handleSubmit(assignment.id)}
                            />
                          )}
                        </article>
                      );
                  })}
                </div>
              ) : (
                <div className="assignment-empty-state">
                  <p>{assignments.length > 0
                    ? `No ${statusFilter === "pending" ? "active" : statusFilter} assignments.`
                    : "No assignments available yet."}</p>
                </div>
              )}
            </div>
    </DashboardLayout>
  );
};

export default AssignmentPage;