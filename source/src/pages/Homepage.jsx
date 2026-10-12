import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewCourseContainer from "../components/NewCoursesContainer";
import "./Homepage.css";
import { fetchUserProfile, fetchEnrolledCourses } from "../api/CourseList";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import { FaArrowRight, FaBookOpen, FaChalkboardTeacher, FaChartLine, FaClipboardList, FaVideo } from "react-icons/fa";
import { fetchMentors } from "../api/Mentors";
import { fetchStudentProgress } from "../api/Progress";




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

const Homepage = () => {
  const [enrolledHoveredCourse, setEnrolledHoveredCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [showMentor, setShowMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studentProgress, setStudentProgress] = useState({
    overallProgress: 0,
    numberOfCourses: 0,
    liveInterviewNumber: 0,
    onlineMockTestNumber: 0,
  });
  const [assignmentStats, setAssignmentStats] = useState({ submittedCount: 0, pendingCount: 0 });
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [userData, enrolledData, progressData, statsData] = await Promise.all([
          fetchUserProfile(token),
          fetchEnrolledCourses(token),
          fetchStudentProgress(token),
          fetchAssignmentStats(token),
        ]);
        setUserName(userData.userName);
        const mentorVisibilityEnabled = userData.showMentor === true;
        setShowMentor(mentorVisibilityEnabled);
        // Normalize enrolled courses so each has an `id` field taken from `courseId`
        const normalizedEnrolled = (enrolledData || []).map(c => ({ ...c, id: c.courseId }));
        setEnrolledCourses(normalizedEnrolled);
        setStudentProgress(progressData);
        setAssignmentStats(statsData);
        setMentors(mentorVisibilityEnabled ? await fetchMentors() : []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAssignmentStats = async (token) => {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
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
    return <DashboardLayout userName={userName} onLogout={handleLogout}><div className="dashboard-layout__loading" role="status">Loading dashboard…</div></DashboardLayout>;
  }

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="course-list-content" overlays={<LogoutToast show={showLogoutToast} />}>
            <div className="homepage-overview-grid">
              <section className="homepage-progress-section" aria-labelledby="homepage-progress-title">
                <div className="homepage-section-heading">
                  <div className="homepage-progress-heading">
                    <span className="homepage-progress-title-icon"><FaChartLine /></span>
                    <div>
                      <h2 id="homepage-progress-title">Progress Overview</h2>
                      <p>Track your learning and placement progress</p>
                    </div>
                  </div>
                </div>
                <div className="assignment-stats-container">
                  <div className="stat-card stat-progress">
                    <div className="progress-ring" style={{ "--progress": `${Math.min(100, Math.max(0, studentProgress.overallProgress))}%` }}>
                      <strong>{studentProgress.overallProgress}%</strong>
                    </div>
                    <h3 className="stat-card-title">Overall Progress</h3>
                    <p className="stat-card-label">Keep going</p>
                  </div>
                  <div className="stat-card stat-courses">
                    <span className="stat-card-icon"><FaBookOpen /></span>
                    <h3 className="stat-card-value">{studentProgress.numberOfCourses}</h3>
                    <h3 className="stat-card-title">Courses</h3>
                    <div className="stat-card-progress-track"><span style={{ width: "65%" }} /></div>
                  </div>
                  <div className="stat-card stat-live-interviews">
                    <span className="stat-card-icon"><FaVideo /></span>
                    <h3 className="stat-card-value">{studentProgress.liveInterviewNumber}</h3>
                    <h3 className="stat-card-title">Live Interview</h3>
                    <div className="stat-card-progress-track"><span style={{ width: "45%" }} /></div>
                  </div>
                  <div className="stat-card stat-online-tests">
                    <span className="stat-card-icon"><FaClipboardList /></span>
                    <h3 className="stat-card-value">{studentProgress.onlineMockTestNumber}</h3>
                    <h3 className="stat-card-title">Online Mock Tests</h3>
                    <div className="stat-card-progress-track"><span style={{ width: "55%" }} /></div>
                  </div>
                  <div className="stat-card stat-assignments">
                    <span className="stat-card-icon"><FaClipboardList /></span>
                    <h3 className="stat-card-value">{assignmentStats.submittedCount}<small>/{assignmentStats.submittedCount + assignmentStats.pendingCount}</small></h3>
                    <h3 className="stat-card-title">Assignments</h3>
                    <div className="stat-card-progress-track">
                      <span style={{ width: `${assignmentStats.submittedCount + assignmentStats.pendingCount ? (assignmentStats.submittedCount / (assignmentStats.submittedCount + assignmentStats.pendingCount)) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="homepage-mentors-section" aria-labelledby="homepage-mentors-title">
                <div className="homepage-section-heading">
                  <div className="homepage-mentor-title">
                    <span className="homepage-mentor-title-icon"><FaChalkboardTeacher /></span>
                    <div>
                      <h2 id="homepage-mentors-title">Assigned Tutors</h2>
                      <p>Your dedicated mentors</p>
                    </div>
                  </div>
                </div>
                {showMentor && mentors.length > 0 ? (
                  <div className="homepage-mentor-list">
                    {mentors.slice(0, 3).map((mentor) => {
                      const profile = mentor.mentorProfile || mentor;
                      const name = mentor.user?.name || mentor.name || "Mentor";
                      return (
                        <article className="homepage-mentor-card" key={mentor.user?.id || mentor.id || name}>
                          <img
                            className="homepage-mentor-avatar"
                            src={profile.imageUrl || "/images/mentor-placeholder.svg"}
                            alt={`${name} profile`}
                            onError={(event) => { event.currentTarget.src = "/images/mentor-placeholder.svg"; }}
                          />
                          <div className="homepage-mentor-info">
                            <strong>{name}</strong>
                            <span>{profile.professionalTitle || "Learning mentor"}</span>
                          </div>
                          <span className="homepage-mentor-experience">
                            {profile.totalExperience ? `${profile.totalExperience} yrs` : "—"}
                          </span>
                          <FaArrowRight className="homepage-mentor-arrow" aria-hidden="true" />
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="homepage-mentors-empty" role="status">
                    <span className="homepage-mentors-empty-icon" aria-hidden="true">
                      <FaChalkboardTeacher />
                    </span>
                    <div className="homepage-mentors-empty-copy">
                      <span className="homepage-mentors-empty-kicker">PERSONALIZED GUIDANCE</span>
                      <h3>Your mentor is on the way</h3>
                      <p>
                        Once you join, we’ll match you with a mentor from a product-based company to guide your learning and career journey.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {enrolledCourses && enrolledCourses.length > 0 && (
              <NewCourseContainer
                courses={enrolledCourses}
                hoveredCourse={enrolledHoveredCourse}
                setHoveredCourse={setEnrolledHoveredCourse}
                courseText="Enrolled Courses"
                buttonText="Continue"
              />
            )}

            {enrolledCourses.length === 0 && (
              <section className="homepage-courses-empty" aria-labelledby="homepage-courses-empty-title">
                <span className="homepage-courses-empty-icon" aria-hidden="true"><FaBookOpen /></span>
                <div className="homepage-courses-empty-copy">
                  <span className="homepage-courses-empty-kicker">YOUR NEXT STEP</span>
                  <h2 id="homepage-courses-empty-title">Your learning journey starts here</h2>
                  <p>You’re not enrolled in any courses yet. Explore the catalog and find a course to begin.</p>
                </div>
                <button type="button" className="homepage-courses-empty-action" onClick={() => navigate("/courses")}>
                  Browse courses <FaArrowRight aria-hidden="true" />
                </button>
              </section>
            )}

            {/* Removed Courses section as per user request */}
    </DashboardLayout>
  );
};

export default Homepage;
