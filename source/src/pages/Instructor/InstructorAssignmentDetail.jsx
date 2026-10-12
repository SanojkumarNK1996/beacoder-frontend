import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { FaArrowLeft, FaUser, FaCalendarAlt, FaLink, FaBookOpen, FaStar, FaClock, FaCheck, FaTimes, FaList, FaLightbulb, FaFileAlt, FaRocket } from "react-icons/fa";
import axios from "axios";
import { descriptionToText, normalizeAssignmentDescription } from "../../utils/assignmentDescription";
import "./InstructorAssignmentDetail.css";

const getRow = (payload) => {
  if (payload?.userAssignment) return payload.userAssignment;
  if (payload?.submission) return payload.submission;
  if (payload?.assignment && typeof payload.assignment === "object") return payload.assignment;
  if (payload?.data) return getRow(payload.data);
  return payload?.id ? payload : null;
};

const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";

const formatElapsedTime = (startedAt, submittedAt) => {
  if (!startedAt || !submittedAt) return null;
  const elapsedMinutes = Math.floor((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes < 0) return null;
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const InstructorAssignmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission;
  const userName = location.state?.userName || "Instructor";
  const [feedback, setFeedback] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [detailedSubmission, setDetailedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchSubmissionDetails = async () => {
      const submissionId = submission?.id;
      if (!submissionId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted/${submissionId}`,
          config
        );
        const fetched = getRow(response.data);
        if (!cancelled && fetched) {
          setDetailedSubmission(fetched);
          setFeedback(fetched.feedback ?? submission.feedback ?? "");
          setMarksObtained(fetched.marksObtained ?? "");
        } else if (!cancelled) {
          setDetailError("Could not read assignment submission details.");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching submission details:", error);
          setDetailError(error.response?.data?.message || "Failed to load submission details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSubmissionDetails();
    return () => {
      cancelled = true;
    };
  }, [submission]);

  const saveReview = async (status) => {
    const submissionId = submission?.id;
    const marks = Number(marksObtained);
    if (!submissionId) {
      setReviewError("Submission ID is missing.");
      return;
    }
    if (status === "completed" && (marksObtained === "" || !Number.isInteger(marks) || marks < 0)) {
      setReviewError("Enter a whole-number mark of zero or greater.");
      return;
    }
    const reviewFeedback = feedback.trim();
    if (status === "rejected" && !reviewFeedback) {
      setReviewError("Add a comment explaining why this submission is being rejected.");
      return;
    }
    setReviewError("");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const payload = {
        status,
        ...(status === "completed" ? { marksObtained: marks } : {}),
        ...(status === "rejected" ? { marksObtained: null } : {}),
        feedback: reviewFeedback,
      };
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted/${submissionId}`,
        payload,
        config
      );
      setDetailedSubmission((current) => ({
        ...(current || submission),
        ...payload,
        ...(status === "rejected" ? { completedAt: null } : {}),
      }));
      setSavedMessage(status === "rejected"
        ? "Submission rejected. Your comment has been sent to the learner."
        : "Review saved. Marked completed.");
      setSaved(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (error) {
      console.error("Error saving assignment review:", error);
      setReviewError(error.response?.data?.message || "Failed to save the assignment review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishReview = (event) => {
    event.preventDefault();
    saveReview("completed");
  };

  if (!submission) {
    return (
      <DashboardLayout userName={userName} contentClassName="course-list-content assignment-review-content">
        <div className="no-data"><p>No assignment submission found.</p><button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /> Go Back</button></div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout userName={userName} contentClassName="course-list-content assignment-review-content">
        <div className="loading"><p>Loading assignment details...</p></div>
      </DashboardLayout>
    );
  }

  const currentSubmission = detailedSubmission || submission;
  const assignment = currentSubmission.Assignment || {};
  const description = normalizeAssignmentDescription(assignment.description);
  const taskLines = descriptionToText(description.task)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const answerText = currentSubmission.textAnswer || currentSubmission.answer;
  const elapsedTime = formatElapsedTime(currentSubmission.startedAt, currentSubmission.submittedAt);

  return (
    <DashboardLayout
      userName={userName}
      contentClassName="course-list-content assignment-review-content"
      pageTitle={assignment.title || "Assignment Review"}
      pageDescription="Review the submission and share feedback with the learner."
      overlays={saved && <div className="assignment-manager-message success"><FaCheck /> {savedMessage}</div>}
    >
            <div className="detail-header"><button onClick={() => navigate(-1)} className="back-btn"><FaArrowLeft /> Back to Assignments</button></div>
            {detailError && <div className="detail-error" role="alert">{detailError}</div>}
            <div className="detail-content">
              <section className="detail-section assignment-info-section">
                <div className="meta-summary-bar">
                  <div className="meta-pill"><span className="meta-label"><FaBookOpen /> Course</span><span className="meta-value">{assignment.Subtopic?.CourseTopic?.Course?.courseName || "—"}</span></div>
                  <div className="meta-pill"><span className="meta-label"><FaStar /> Difficulty</span><span className="meta-value">{assignment.difficulty ? `${assignment.difficulty.charAt(0).toUpperCase()}${assignment.difficulty.slice(1)}` : "—"}</span></div>
                  <div className="meta-pill"><span className="meta-label"><FaUser /> Submitted by</span><span className="meta-value">{currentSubmission.User?.name || currentSubmission.User?.email || "Student"}</span></div>
                  <div className="meta-pill"><span className="meta-label"><FaCalendarAlt /> Submitted on</span><span className="meta-value">{formatDate(currentSubmission.submittedAt)}</span></div>
                  <div className="meta-pill"><span className="meta-label"><FaStar /> Status</span><span className={`status-badge-detail ${currentSubmission.status}`}>{currentSubmission.status || "submitted"}</span></div>
                  {currentSubmission.marksObtained != null && <div className="meta-pill"><span className="meta-label"><FaCheck /> Marks</span><span className="meta-value">{currentSubmission.marksObtained}</span></div>}
                </div>
              </section>

              {description && (
                <section className="detail-section description-section">
                  <h3 className="section-title">Assignment Details</h3>
                  <div className="description-content">
                    <div className="desc-item desc-task-item">
                      <div className="desc-heading"><FaList aria-hidden="true" /><strong>Task</strong></div>
                      <div className="desc-task-list">
                        {taskLines.length
                          ? taskLines.map((line, index) => (
                            <div className="desc-task-step" key={`${index}-${line}`}>
                              <span>{index + 1}</span><p>{line}</p>
                            </div>
                          ))
                          : <p className="desc-empty">No task details have been added.</p>}
                      </div>
                    </div>
                    {descriptionSections.map(({ key, label, icon, content }) => (
                      <div className={`desc-item desc-${key}`} key={key}>
                        <div className="desc-heading">{icon}<strong>{label}</strong></div>
                        {key === "expectedOutput"
                          ? <pre className="desc-output">{content}</pre>
                          : <p>{content}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(currentSubmission.startedAt || elapsedTime || currentSubmission.time != null || currentSubmission.timeTaken != null || currentSubmission.timeSpent != null || currentSubmission.submissionUrl || answerText) && (
                <div className="detail-tile-row">
                  {(currentSubmission.startedAt || elapsedTime || currentSubmission.time != null || currentSubmission.timeTaken != null || currentSubmission.timeSpent != null) && (
                    <section className="detail-section detail-tile timing-tile">
                      <h3 className="section-title"><FaClock /> Timing</h3>
                      <div className="compact-metric-list">
                        {currentSubmission.startedAt && <div className="compact-metric"><span className="compact-metric-label">Started</span><span>{formatDate(currentSubmission.startedAt)}</span></div>}
                        {elapsedTime && <div className="compact-metric"><span className="compact-metric-label">Time spent</span><span>{elapsedTime}</span></div>}
                        {!elapsedTime && (currentSubmission.time ?? currentSubmission.timeTaken ?? currentSubmission.timeSpent) != null && <div className="compact-metric"><span className="compact-metric-label">Time spent</span><span>{currentSubmission.time ?? currentSubmission.timeTaken ?? currentSubmission.timeSpent}</span></div>}
                      </div>
                    </section>
                  )}

                  {(currentSubmission.submissionUrl || answerText) && (
                    <section className="detail-section detail-tile submission-section">
                      <h3 className="section-title">Student's Answer</h3>
                      {currentSubmission.submissionUrl && <div className="submission-content"><FaLink className="link-icon" /><a href={currentSubmission.submissionUrl} target="_blank" rel="noopener noreferrer" className="submission-link-detail">View Submission</a></div>}
                      {answerText && <div className="text-answer-content"><p>{answerText}</p></div>}
                    </section>
                  )}
                </div>
              )}

              {currentSubmission.feedback && <section className="detail-section"><h3 className="section-title">Previous Feedback</h3><p>{currentSubmission.feedback}</p></section>}

              <section className="detail-section review-section">
                <h3 className="section-title">Complete Review</h3>
                <form className="review-form" onSubmit={finishReview}>
                  <div className="form-group">
                    <label htmlFor="marksObtained" className="form-label">Marks</label>
                    <input id="marksObtained" className="form-input" type="number" min="0" step="1" value={marksObtained} onChange={(event) => setMarksObtained(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="feedback" className="form-label">Feedback</label>
                    <textarea id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share feedback with the student..." className="feedback-textarea" rows="6" />
                  </div>
                  {reviewError && <div className="detail-error" role="alert">{reviewError}</div>}
                  <div className="action-buttons">
                    <button type="submit" disabled={isSubmitting || saved} className="accept-btn btn"><FaCheck />{isSubmitting ? "Saving..." : currentSubmission.status === "completed" ? "Update Review" : "Mark Completed"}</button>
                    <button type="button" disabled={isSubmitting || saved} onClick={() => saveReview("rejected")} className="reject-btn btn"><FaTimes />{isSubmitting ? "Saving..." : currentSubmission.status === "rejected" ? "Update Rejection" : "Reject with Feedback"}</button>
                  </div>
                </form>
              </section>
            </div>
    </DashboardLayout>
  );
};

export default InstructorAssignmentDetail;
