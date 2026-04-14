import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { CourseListRightSidebar } from "../components/CourseListRightSidebar";
import MainPageLoader from "../components/MainPageLoader";
import { fetchUserProfile } from "../api/CourseList";
import "./DiscussionPage.css";

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

// ✅ Success Toast Component (similar to Login toast)
const DiscussionSuccessToast = ({ show, message = "Discussion created successfully!" }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      {message}
    </div>
  );
};

// ✅ Error Toast Component (similar to Login toast)
const DiscussionFailedToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast failed">
      <span className="toast-icon">✖</span>
      {message || "Failed to create discussion. Please try again."}
    </div>
  );
};

// ✅ Create Discussion Modal Component
const CreateDiscussionModal = ({ show, onClose, onSubmit, onError }) => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    assignmentId: "",
    title: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      fetchCourses();
      fetchAssignments();
    }
  }, [show]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/my-courses`, config);
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments`, config);
      if (response.data.success) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.courseId) newErrors.courseId = "Course is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        courseId: parseInt(formData.courseId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: "open"
      };

      if (formData.assignmentId) {
        payload.assignmentId = parseInt(formData.assignmentId);
      }

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/discussions`, payload, config);
      onSubmit();
      handleClose();
    } catch (error) {
      console.error("Error creating discussion:", error);
      const errorMessage = error.response?.data?.message || "Failed to create discussion. Please try again.";
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseId: "",
      assignmentId: "",
      title: "",
      description: ""
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Discussion</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="courseId">Course *</label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className={errors.courseId ? "error" : ""}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>
            {errors.courseId && <span className="error-message">{errors.courseId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="assignmentId">Assignment (Optional)</label>
            <select
              id="assignmentId"
              name="assignmentId"
              value={formData.assignmentId}
              onChange={handleInputChange}
            >
              <option value="">Select an assignment</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.Assignment?.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter discussion title"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter discussion description"
              rows="4"
              className={errors.description ? "error" : ""}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getLocalDateTimeString = (date) => {
  const pad = (value) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Helper function to format date for API
const formatBookedSlot = (date) => {
  const pad = (value, len = 2) => value.toString().padStart(len, "0");
  const offset = date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const sign = offset > 0 ? '-' : '+'; // getTimezoneOffset is positive for negative offset
  const offsetStr = `${sign}${pad(offsetHours)}${pad(offsetMinutes)}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}${offsetStr}`;
};

// ✅ Request Pair Programming Modal Component
const RequestPairProgrammingModal = ({ show, onClose, onSubmit, onError, discussionId }) => {
  const [formData, setFormData] = useState({
    preferredSlot: "",
    mentorSession: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mentorSession) {
      newErrors.mentorSession = "Please enable one-to-one mentor session to continue.";
    }

    const minDate = new Date();
    const maxDate = new Date(minDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    const selectedDate = formData.preferredSlot ? new Date(formData.preferredSlot) : null;

    if (!formData.preferredSlot) {
      newErrors.preferredSlot = "Please select date and time";
    } else if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      newErrors.preferredSlot = "Please select a valid date and time";
    } else if (selectedDate < minDate) {
      newErrors.preferredSlot = "Selected date cannot be in the past";
    } else if (selectedDate > maxDate) {
      newErrors.preferredSlot = "Selected date must be within 10 days from today";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const selectedDate = new Date(formData.preferredSlot);
      const payload = {
        bookedSlot: formatBookedSlot(selectedDate)
      };

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/discussions/pair-programming/${discussionId}`, payload, config);
      onSubmit();
      handleClose();
    } catch (error) {
      console.error("Error requesting pair programming:", error);
      const errorMessage = error.response?.data?.message || "Failed to request pair programming. Please try again.";
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ preferredSlot: "", mentorSession: false });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Pair-Programming</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="mentorSession"
                name="mentorSession"
                checked={formData.mentorSession}
                onChange={handleInputChange}
              />
              Do you want a one-to-one session with your mentor
            </label>
            {errors.mentorSession && <span className="error-message">{errors.mentorSession}</span>}
          </div>
          {!formData.mentorSession && (
            <div className="helper-note">
              Enable the checkbox above to select a date and request your mentor session.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="preferredSlot">Preferred date and time</label>
            <input
              type="datetime-local"
              id="preferredSlot"
              name="preferredSlot"
              value={formData.preferredSlot}
              onChange={handleInputChange}
              min={getLocalDateTimeString(new Date())}
              max={getLocalDateTimeString(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000))}
              disabled={!formData.mentorSession}
              className={errors.preferredSlot ? "error" : ""}
            />
            {errors.preferredSlot && <span className="error-message">{errors.preferredSlot}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || !formData.mentorSession}>
              {isLoading ? "Requesting..." : "Request Pair-Programming"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getBadgeIcon = (name) => {
  const normalized = name?.toLowerCase() || "";
  if (normalized.includes("first")) return "👣";
  if (normalized.includes("master") || normalized.includes("quiz")) return "🏆";
  if (normalized.includes("consistency") || normalized.includes("streak")) return "🔥";
  if (normalized.includes("challenge") || normalized.includes("milestone")) return "🎯";
  if (normalized.includes("learning")) return "📘";
  return "🎖️";
};

const fetchBadges = async (token, setAchievements) => {
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
          description: badge.description || "Earned a badge",
          icon: getBadgeIcon(badge.name),
        };
      })
    );
  } catch (error) {
    console.error("Error fetching badges:", error);
    setAchievements([]);
  }
};

const DiscussionPage = () => {
  const { discussionId } = useParams();
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(3); // Discussions is index 3 in sidebar
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [userName, setUserName] = useState("User");
  const [achievements, setAchievements] = useState([]);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" or "me"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestPairModal, setShowRequestPairModal] = useState(false);
  const [currentDiscussionId, setCurrentDiscussionId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Discussion created successfully!");
  const [showFailedToast, setShowFailedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        if (discussionId) {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/${discussionId}`,
            config
          );
          if (response.data.success && isMounted) {
            setSelectedDiscussion(response.data.data);
          }
        } else {
          const scope = filter === "me" ? "me" : "all";
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/v1/discussions?scope=${scope}`,
            config
          );
          if (response.data.success && isMounted) {
            setDiscussions(response.data.data);
          }
        }

        // Fetch user profile and badges
        if (isMounted) {
          try {
            const userData = await fetchUserProfile(token);
            setUserName(userData.userName);
            await fetchBadges(token, setAchievements);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUserName("User");
            setAchievements([]);
          }
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filter, discussionId]);

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

  const handleCreateDiscussion = () => {
    setShowCreateModal(true);
  };

  const handleRequestPairProgramming = (discussionId) => {
    setCurrentDiscussionId(discussionId);
    setShowRequestPairModal(true);
  };

  const handleDiscussionCreated = () => {
    setSuccessMsg("Discussion created successfully!");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 1500);
  };

  const handlePairProgrammingSuccess = () => {
    setSuccessMsg("Pair programming request submitted successfully!");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 1500);
  };

  const handleReplySuccess = () => {
    setSuccessMsg("Reply posted successfully!");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 1500);
  };

  const handleDiscussionError = (message) => {
    setErrorMsg(message || "Failed to create discussion. Please try again.");
    setShowFailedToast(true);
    setTimeout(() => {
      setShowFailedToast(false);
    }, 3000);
  };

  const filteredDiscussions = useMemo(() =>
    discussionId ? (selectedDiscussion ? [selectedDiscussion] : []) : discussions,
    [discussionId, selectedDiscussion, discussions]
  );

  if (isLoading) {
    return (
      <MainPageLoader
        variant="headerSidebarSkeleton"
        text="Loading discussions..."
      />
    );
  }

  return (
    <>
      <LogoutToast show={showLogoutToast} />
      <DiscussionSuccessToast show={showSuccessToast} message={successMsg} />
      <DiscussionFailedToast show={showFailedToast} message={errorMsg} />
      <div className="discussion-container">
      <Sidebar
        active={active}
        hovered={hovered}
        setActive={setActive}
        setHovered={setHovered}
      />

      <div className="discussion-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="discussion-inner">
          <div className="discussion-content">
            <div className="discussion-list-section">
              <div className="discussion-filter-header">
                <h2 className="discussion-section-title">Discussions</h2>
                <div className="discussion-header-actions">
                  {!discussionId && (
                    <>
                      <div className="discussion-filter-buttons">
                        <button
                          className={`filter-btn ${filter === "all" ? "active" : ""}`}
                          onClick={() => setFilter("all")}
                        >
                          All
                        </button>
                        <button
                          className={`filter-btn ${filter === "me" ? "active" : ""}`}
                          onClick={() => setFilter("me")}
                        >
                          Me
                        </button>
                      </div>
                      <button className="create-discussion-btn" onClick={handleCreateDiscussion}>
                        Create Discussion
                      </button>
                    </>
                  )}
                </div>
              </div>

              {filteredDiscussions && filteredDiscussions.length > 0 ? (
                <>
                  {discussionId && (
                    <div className="discussion-detail-actions">
                      <button className="create-discussion-btn" onClick={() => navigate('/discussions')}>
                        ← Back to all discussions
                      </button>
                    </div>
                  )}

                  <div className="discussion-cards-grid">
                    {filteredDiscussions.map((discussion) => {
                      const createdAt = new Date(discussion.createdAt);
                      const allowedTime = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
                      const now = new Date();
                      const isRequestAllowed = discussion.isPairProgramming === false && now >= allowedTime;

                      let buttonTitle = "Request Pair-Programming";
                      if (!isRequestAllowed) {
                        if (discussion.isPairProgramming) {
                          buttonTitle = "Pair programming already requested";
                        } else {
                          const timeRemaining = allowedTime - now;
                          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                          buttonTitle = `Available in ${hours} hours ${minutes} minutes`;
                        }
                      }

                      return (
                        <div
                          key={discussion.id}
                          className="discussion-card"
                          onClick={!discussionId ? () => navigate(`/discussions/${discussion.id}`) : undefined}
                          style={{ cursor: !discussionId ? 'pointer' : 'default' }}
                        >
                          <div className="discussion-card-content">
                            <h3 className="discussion-title">{discussion.title}</h3>
                            <p className="discussion-description">{discussion.description}</p>
                            <div className="discussion-card-footer">
                              <div className="discussion-meta">
                                <span className="discussion-author">By {discussion.User?.name || "Unknown"}</span>
                                <span className="discussion-date">
                                  {createdAt.toLocaleDateString()}
                                </span>
                                <span className="discussion-replies">
                                  {discussion.replyCount ?? 0} replies
                                </span>
                              </div>
                              <button
                                type="button"
                                className="request-pair-btn"
                                disabled={!isRequestAllowed}
                                onClick={(e) => {
                                  if (!isRequestAllowed) return;
                                  e.stopPropagation();
                                  handleRequestPairProgramming(discussion.id);
                                }}
                                title={buttonTitle}
                              >
                                Request Pair-Programming
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {discussionId && selectedDiscussion && (
                    <div className="discussion-reply-container">
                      <div className="discussion-detail-header">
                        <h3>{selectedDiscussion.title}</h3>
                        <div className="discussion-status">
                          <span className={`status-badge ${selectedDiscussion.status === 'closed' ? 'closed' : 'open'}`}>
                            {selectedDiscussion.status || 'open'}
                          </span>
                        </div>
                      </div>
                      <p className="discussion-description">{selectedDiscussion.description}</p>
                      
                      <h4>Discussion replies</h4>
                      {selectedDiscussion.DiscussionReplies?.length ? (
                        selectedDiscussion.DiscussionReplies.map((reply) => (
                          <div key={reply.id} className="discussion-reply-item">
                            <div className="discussion-reply-header">
                              <strong>{reply.User?.name || 'Anonymous'}</strong>
                              <span>{new Date(reply.createdAt).toLocaleString()}</span>
                            </div>
                            <p>{reply.message || ''}</p>
                          </div>
                        ))
                      ) : (
                        <p>No replies yet. Be the first to reply!</p>
                      )}

                      <div className="discussion-reply-form">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          disabled={selectedDiscussion.status === 'closed'}
                        />
                        <button 
                          className="btn-primary" 
                          disabled={selectedDiscussion.status === 'closed' || !replyText.trim()}
                          onClick={async () => {
                          if (!replyText.trim()) return;

                          try {
                            const token = localStorage.getItem("authToken");
                            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

                            const response = await axios.post(
                              `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/${discussionId}/replies`,
                              { message: replyText.trim() },
                              config
                            );

                            if (response.data?.success) {
                              setReplyText("");
                              handleReplySuccess();

                              // Refresh detail data after successful reply
                              const refreshResponse = await axios.get(
                                `${import.meta.env.VITE_BASE_URL}/api/v1/discussions/${discussionId}`,
                                config
                              );
                              if (refreshResponse.data?.success) {
                                setSelectedDiscussion(refreshResponse.data.data);
                              }
                            } else {
                              throw new Error(response.data?.message || "Failed to post reply");
                            }
                          } catch (error) {
                            console.error("Error posting reply:", error);
                            setErrorMsg(error.response?.data?.message || error.message || "Unable to post reply");
                            setShowFailedToast(true);
                            setTimeout(() => setShowFailedToast(false), 3000);
                          }
                        }}>
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-discussions">
                  <p>No discussions found.</p>
                </div>
              )}
            </div>
          </div>

          <CourseListRightSidebar achievements={achievements} />
        </div>
      </div>

      <LogoutToast show={showLogoutToast} />

      <CreateDiscussionModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleDiscussionCreated}
        onError={handleDiscussionError}
      />
      <RequestPairProgrammingModal
        show={showRequestPairModal}
        onClose={() => {
          setShowRequestPairModal(false);
          setCurrentDiscussionId(null);
        }}
        onSubmit={handlePairProgrammingSuccess}
        onError={handleDiscussionError}
        discussionId={currentDiscussionId}
      />
    </div>
    </>
  );
};

export default DiscussionPage;