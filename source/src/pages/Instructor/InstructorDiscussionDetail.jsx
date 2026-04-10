import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InstructorSidebar } from "../../components/InstructorSidebar";
import { TopBar } from "../../components/TopBar";
import MainPageLoader from "../../components/MainPageLoader";
import axios from "axios";
import "./InstructorAssignmentDetail.css";

const CloseDiscussionToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast success" style={{ position: "fixed", top: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 12000 }}>
      <span className="toast-icon">✔</span>
      Discussion closed successfully.
    </div>
  );
};

const InstructorDiscussionDetail = () => {
  const { discussionId } = useParams();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("Instructor");
  const [discussion, setDiscussion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [replyError, setReplyError] = useState("");
  const [showCloseToast, setShowCloseToast] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (role !== "instructor") {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const config = {};
        if (token) config.headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`, config);
        setUserName(response.data?.userName || "Instructor");
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserName("Instructor");
      }
    };

    const fetchDiscussion = async () => {
      try {
        setError("");
        const config = {};
        if (token) config.headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin/${discussionId}`,
          config
        );

        if (response.data?.success) {
          const data = response.data.data || null;
          setDiscussion(data);
        } else {
          setError("Discussion not found");
        }
      } catch (err) {
        console.error("Error loading discussion details:", err);
        setError("Failed to load discussion. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchDiscussion();
  }, [discussionId, navigate]);

  const handleReplySubmit = async () => {
    setReplyError("");
    setReplyStatus("");

    if (!replyText.trim()) {
      setReplyError("Please enter a reply before sending.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin/${discussionId}/replies`,
        { message: replyText.trim() },
        config
      );

      if (response.data?.success) {
        // Update local state with the new reply
        const newReply = response.data.data || {
          id: Date.now(),
          discussionId: discussion?.id,
          userId: Number(localStorage.getItem("userId") || 0),
          message: replyText.trim(),
          createdAt: new Date().toISOString(),
          User: { id: Number(localStorage.getItem("userId") || 0), name: userName || "Instructor" }
        };

        const existingReplies = discussion?.DiscussionReplies || [];
        setDiscussion({
          ...discussion,
          DiscussionReplies: [...existingReplies, newReply],
          replyCount: (discussion?.replyCount ?? existingReplies.length) + 1
        });
        setReplyText("");
        setReplyStatus("Reply sent successfully.");
      } else {
        setReplyError("Failed to send reply. Please try again.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setReplyError("Failed to send reply. Please try again.");
    }
  };

  const [closeStatus, setCloseStatus] = useState("");
  const [closeError, setCloseError] = useState("");

  const handleReplyClose = () => {
    navigate("/instructor/discussions");
  };

  const handleCloseDiscussion = async () => {
    setCloseError("");
    setCloseStatus("");

    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/admin/${discussionId}`,
        { status: "closed" },
        config
      );

      if (response.data?.success) {
        setCloseStatus("Discussion closed successfully.");
        setShowCloseToast(true);
        setDiscussion(prev => prev ? { ...prev, status: "closed" } : prev);
        setTimeout(() => setShowCloseToast(false), 1500);
        // Optionally navigate back after close
        setTimeout(() => {
          navigate("/instructor/discussions");
        }, 800);
      } else {
        setCloseError("Failed to close discussion. Please try again.");
      }
    } catch (err) {
      console.error("Error closing discussion:", err);
      setCloseError("Failed to close discussion. Please try again.");
    }
  };

  if (isLoading) {
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading discussion details..." />;
  }

  const parsedAssignment = discussion?.Assignment;

  return (
    <>
      <CloseDiscussionToast show={showCloseToast} />
      <div className="course-list-container">
        <InstructorSidebar hovered={hovered} setHovered={setHovered} />
      <div className="course-list-main">
        <TopBar userName={userName} onLogout={() => { localStorage.removeItem("authToken"); localStorage.removeItem("userRole"); navigate("/login"); }} />
        <div className="course-list-inner">
          <div className="course-list-content">
            <div className="detail-header">
              <button onClick={() => navigate("/instructor/discussions")} className="back-btn">
                ← Back to discussions
              </button>
            </div>

            {error && (
              <div className="detail-error" style={{ padding: "16px", backgroundColor: "#fff4f4", border: "1px solid #f5c2c2", borderRadius: "10px", color: "#a10f0f" }}>
                {error}
              </div>
            )}

            <div className="detail-content" style={{ width: "90%", maxWidth: "90%" }}>
              {!discussion ? (
                <div className="no-data">
                  <p>No discussion data available.</p>
                </div>
              ) : (
                <div className="detail-section">
                  <h1 className="detail-title">{discussion.title}</h1>

                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className="info-value" style={{ color: discussion.status === "open" ? "#137333" : discussion.status === "closed" ? "#c62828" : "inherit" }}>{discussion.status || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">User</span>
                      <span className="info-value">{discussion.User?.name || "Unknown"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Course</span>
                      <span className="info-value">{discussion.Course?.courseName || "Unknown"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Replies</span>
                      <span className="info-value">{discussion.replyCount ?? (discussion.DiscussionReplies?.length || 0)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Participants</span>
                      <span className="info-value">{discussion.DiscussionReplies ? new Set(discussion.DiscussionReplies.map((r) => r.userId)).size : 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Pair Programming</span>
                      <span className="info-value">{discussion.isPairProgramming ? "Yes" : "No"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created At</span>
                      <span className="info-value">{discussion.createdAt ? new Date(discussion.createdAt).toLocaleString() : ""}</span>
                    </div>
                  </div>

                  <div className="detail-section" style={{ marginTop: "12px" }}>
                    <h3 className="section-title">Description</h3>
                    <p>{discussion.description || "No description available."}</p>
                  </div>

                  {parsedAssignment && (
                    <div className="detail-section">
                      <h3 className="section-title">Assignment</h3>
                      <div className="info-grid" style={{ marginBottom: "12px" }}>
                        <div className="info-item">
                          <span className="info-label">Title</span>
                          <span className="info-value">{parsedAssignment.title || "-"}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Active</span>
                          <span className="info-value">{parsedAssignment.isActive ? "Yes" : "No"}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Due Date</span>
                          <span className="info-value">{parsedAssignment.dueDate ? new Date(parsedAssignment.dueDate).toLocaleString() : "Not set"}</span>
                        </div>
                      </div>

                      {parsedAssignment.description && (
                        <div className="description-content">
                          {typeof parsedAssignment.description === "string" ? (
                            <p>{parsedAssignment.description}</p>
                          ) : (
                            <>
                              {parsedAssignment.description.task && (
                                <div className="desc-item">
                                  <strong>Task</strong>
                                  <p>{parsedAssignment.description.task}</p>
                                </div>
                              )}
                              {parsedAssignment.description.context && (
                                <div className="desc-item">
                                  <strong>Context</strong>
                                  <p>{parsedAssignment.description.context}</p>
                                </div>
                              )}
                              {parsedAssignment.description.instructions && (
                                <div className="desc-item">
                                  <strong>Instructions</strong>
                                  <ul>
                                    {parsedAssignment.description.instructions.map((ins, index) => (
                                      <li key={index}>{ins}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {parsedAssignment.description.expectedOutput && (
                                <div className="desc-item">
                                  <strong>Expected Output</strong>
                                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{parsedAssignment.description.expectedOutput}</pre>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {discussion.DiscussionReplies && discussion.DiscussionReplies.length > 0 && (
                    <div className="detail-section">
                      <h3 className="section-title">Replies</h3>
                      {discussion.DiscussionReplies.map((reply) => (
                        <div key={reply.id} className="desc-item" style={{ backgroundColor: "#f5f7ff", padding: "10px", borderRadius: "8px", marginBottom: "8px" }}>
                          <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{reply.User?.name || "Unknown"} <span style={{ color: "#999", fontWeight: 400, fontSize: "0.78rem" }}>{reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ""}</span></p>
                          <p style={{ margin: 0 }}>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="detail-section">
                    <h3 className="section-title">Add a Reply</h3>
                    {replyStatus && <p style={{ color: "#137333", margin: "0 0 8px" }}>{replyStatus}</p>}
                    {replyError && <p style={{ color: "#c62828", margin: "0 0 8px" }}>{replyError}</p>}
                    {closeStatus && <p style={{ color: "#137333", margin: "0 0 8px" }}>{closeStatus}</p>}
                    {closeError && <p style={{ color: "#c62828", margin: "0 0 8px" }}>{closeError}</p>}
                    <textarea
                      rows={4}
                      placeholder="Write your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={discussion?.status === "closed"}
                      style={{ width: "100%", borderRadius: "8px", border: "1px solid #ccc", padding: "10px", resize: "vertical", fontFamily: "inherit", marginBottom: "12px", backgroundColor: discussion?.status === "closed" ? "#f5f5f5" : "white" }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={handleReplySubmit}
                        disabled={!replyText.trim() || discussion?.status === "closed"}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: (!replyText.trim() || discussion?.status === "closed") ? "#ccc" : "#1976d2",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: (!replyText.trim() || discussion?.status === "closed") ? "not-allowed" : "pointer"
                        }}
                      >
                        Reply
                      </button>
                      <button
                        onClick={handleCloseDiscussion}
                        disabled={discussion?.status === "closed"}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: discussion?.status === "closed" ? "#ccc" : "#7961ff",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: discussion?.status === "closed" ? "not-allowed" : "pointer"
                        }}
                      >
                        Close Discussion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default InstructorDiscussionDetail;
