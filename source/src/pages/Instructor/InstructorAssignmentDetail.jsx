import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InstructorSidebar } from "../../components/InstructorSidebar";
import { TopBar } from "../../components/TopBar";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaLink,
  FaBookOpen,
  FaStar,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import "./InstructorAssignmentDetail.css";

const AcceptedToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      Assignment accepted successfully!
    </div>
  );
};

const RejectedToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast failed">
      <span className="toast-icon">✖</span>
      Assignment rejected successfully!
    </div>
  );
};

const InstructorAssignmentDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission;
  const userName = location.state?.userName || "Instructor";

  const [hovered, setHovered] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAcceptedToast, setShowAcceptedToast] = useState(false);
  const [showRejectedToast, setShowRejectedToast] = useState(false);
  const [detailedSubmission, setDetailedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      const submissionId = submission?.id || submission?.submissionId || submission?.assignmentSubmissionId;
      if (!submissionId) {
        setLoading(false);
        return;
      }

      try {
        setDetailError(null);
        const token = localStorage.getItem("authToken");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted/${submissionId}`,
          config
        );
        const data = response.data;

        let fetched = null;
        if (data?.success && data.assignment) fetched = data.assignment;
        else if (data?.success && data.data) fetched = data.data;
        else if (data?.assignment) fetched = data.assignment;
        else if (data?.data) fetched = data.data;
        else if (data?.submission) fetched = data.submission;
        else if (data?.id) fetched = data;

        if (fetched) {
          setDetailedSubmission(fetched);
          setFeedback(fetched.feedback ?? submission.feedback ?? "");
        } else {
          setDetailError("Could not parse submission details from server, showing available data.");
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
        setDetailError("Failed to load submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [submission]);

  if (!submission) {
    return (
      <div className="course-list-container">
        <InstructorSidebar hovered={hovered} setHovered={setHovered} />
        <div className="course-list-main">
          <TopBar userName={userName} />
          <div className="course-list-inner">
            <div className="course-list-content">
              <div className="no-data">
                <p>No assignment data found.</p>
                <button onClick={() => navigate(-1)} className="back-btn">
                  <FaArrowLeft /> Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="course-list-container">
        <InstructorSidebar hovered={hovered} setHovered={setHovered} />
        <div className="course-list-main">
          <TopBar userName={userName} />
          <div className="course-list-inner">
            <div className="course-list-content">
              <div className="loading">
                <p>Loading assignment details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSubmission = detailedSubmission || submission;
  const maxMarks = currentSubmission.Assignment?.maxMarks || 100;

  const handleAccept = async () => {
    const submissionId = submission?.id || submission?.submissionId || submission?.assignmentSubmissionId;
    if (!submissionId) {
      alert("Submission ID is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        status: "accepted",
        feedback: feedback,
      };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted/${submissionId}`,
        payload,
        config
      );

      setShowAcceptedToast(true);
      setTimeout(() => {
        setShowAcceptedToast(false);
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error accepting assignment:", error);
      alert("Failed to accept assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const submissionId = submission?.id || submission?.submissionId || submission?.assignmentSubmissionId;
    if (!submissionId) {
      alert("Submission ID is missing.");
      return;
    }

    if (!feedback || feedback.trim() === "") {
      alert("Please provide feedback before rejecting");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        status: "rejected",
        feedback: feedback,
      };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted/${submissionId}`,
        payload,
        config
      );

      setShowRejectedToast(true);
      setTimeout(() => {
        setShowRejectedToast(false);
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error rejecting assignment:", error);
      alert("Failed to reject assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AcceptedToast show={showAcceptedToast} />
      <RejectedToast show={showRejectedToast} />

      <div className="course-list-container">
        <InstructorSidebar hovered={hovered} setHovered={setHovered} />

        <div className="course-list-main">
          <TopBar userName={userName} />

          <div className="course-list-inner">
            <div className="course-list-content">
              <div className="detail-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                  <FaArrowLeft /> Back to Assignments
                </button>
              </div>

              {detailError && (
                <div className="detail-error">
                  {detailError}
                </div>
              )}

              <div className="detail-content">
                {/* Assignment Info Section */}
                <div className="detail-section assignment-info-section">
                  <h1 className="detail-title">{currentSubmission.Assignment?.title}</h1>

                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">
                        <FaBookOpen /> Course
                      </span>
                      <span className="info-value">{currentSubmission.Assignment?.Course?.courseName}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">
                        <FaUser /> Submitted by
                      </span>
                      <span className="info-value">
                        {currentSubmission.User?.name} ({currentSubmission.User?.email})
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">
                        <FaCalendarAlt /> Submitted on
                      </span>
                      <span className="info-value">
                        {new Date(currentSubmission.submittedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">
                        <FaStar /> Status
                      </span>
                      <span className={`status-badge-detail ${currentSubmission.status}`}>
                        {currentSubmission.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Description Section */}
                {currentSubmission.Assignment?.description && (
                  <div className="detail-section description-section">
                    <h3 className="section-title">Assignment Details</h3>
                    <div className="description-content">
                      {currentSubmission.Assignment.description.task && (
                        <div className="desc-item">
                          <strong>Task:</strong>
                          <p>{currentSubmission.Assignment.description.task}</p>
                        </div>
                      )}
                      {currentSubmission.Assignment.description.context && (
                        <div className="desc-item">
                          <strong>Context:</strong>
                          <p>{currentSubmission.Assignment.description.context}</p>
                        </div>
                      )}
                      {currentSubmission.Assignment.description.instructions && (
                        <div className="desc-item">
                          <strong>Instructions:</strong>
                          <ul>
                            {currentSubmission.Assignment.description.instructions.map(
                              (instruction, index) => (
                                <li key={index}>{instruction}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submission Link Section */}
                {currentSubmission.submissionUrl && (
                  <div className="detail-section submission-section">
                    <h3 className="section-title">Student Submission</h3>
                    <div className="submission-content">
                      <FaLink className="link-icon" />
                      <a
                        href={currentSubmission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="submission-link-detail"
                      >
                        View Submission
                      </a>
                    </div>
                  </div>
                )}

                {/* Text Answer Section */}
                {currentSubmission.textAnswer && (
                  <div className="detail-section text-answer-section">
                    <h3 className="section-title">Student's Answer</h3>
                    <div className="text-answer-content">
                      <p>{currentSubmission.textAnswer}</p>
                    </div>
                  </div>
                )}

                {/* Review Section */}
                <div className="detail-section review-section">
                  <h3 className="section-title">Review & Feedback</h3>

                  <div className="review-form">
                    <div className="form-group">
                      <label htmlFor="feedback" className="form-label">
                        Feedback
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter your feedback here..."
                        className="feedback-textarea"
                        rows="6"
                      />
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={handleAccept}
                        disabled={isSubmitting}
                        className="accept-btn btn"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="reject-btn btn"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorAssignmentDetail;
