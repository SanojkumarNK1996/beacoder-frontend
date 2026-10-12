import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaClipboardList,
  FaCompass,
  FaRegCalendarAlt,
  FaVideo,
} from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import {
  fetchMyAssignmentStats,
  fetchMyStudentActivities,
  fetchStudentProgress,
} from "../../api/Progress";
import "./MyProgressPage.css";

const initialProgress = {
  overallProgress: 0,
  numberOfCourses: 0,
  liveInterviewNumber: 0,
  onlineMockTestNumber: 0,
};

const formatActivityDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function MyProgressPage() {
  const [userName, setUserName] = useState("Learner");
  const [progress, setProgress] = useState(initialProgress);
  const [assignmentStats, setAssignmentStats] = useState({ submittedCount: 0, pendingCount: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;

    Promise.allSettled([
      fetchUserProfile(token),
      fetchStudentProgress(token),
      fetchMyAssignmentStats(token),
      fetchMyStudentActivities(token),
    ]).then(([profileResult, progressResult, assignmentResult, activitiesResult]) => {
      if (!active) return;
      if (profileResult.status === "fulfilled") {
        setUserName(profileResult.value.userName || profileResult.value.name || "Learner");
      }
      if (progressResult.status === "fulfilled") setProgress(progressResult.value);
      if (assignmentResult.status === "fulfilled") setAssignmentStats(assignmentResult.value);
      if (activitiesResult.status === "fulfilled") setActivities(activitiesResult.value);
      else setError(activitiesResult.reason?.response?.data?.message || "We couldn’t load your tutor updates just now.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const assignmentTotal = assignmentStats.submittedCount + assignmentStats.pendingCount;
  const assignmentPercent = assignmentTotal
    ? Math.round((assignmentStats.submittedCount / assignmentTotal) * 100)
    : 0;
  const overallProgress = Math.min(100, Math.max(0, Number(progress.overallProgress) || 0));

  if (loading) {
    return (
      <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="my-progress-main">
        <div className="my-progress-loading" role="status">Gathering your progress…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="my-progress-main">
      <section className="my-progress-overall" aria-label="Overall progress">
        <div className="my-progress-overall-label"><h2>Overall progress</h2><strong>{overallProgress}%</strong></div>
        <div className="my-progress-progress-track" role="progressbar" aria-label="Overall progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={overallProgress}>
          <span style={{ width: `${overallProgress}%` }} />
        </div>
        <span className="my-progress-overall-caption">{overallProgress > 0 ? "Nice work—keep building momentum." : "Your journey is underway. Take it one step at a time."}</span>
      </section>

      <section className="my-progress-stats" aria-label="Learning activity summary">
        <article className="my-progress-stat-card">
          <span className="my-progress-stat-icon courses"><FaBookOpen aria-hidden="true" /></span>
          <div><strong>{progress.numberOfCourses || 0}</strong><span>Courses</span></div>
        </article>
        <article className="my-progress-stat-card">
          <span className="my-progress-stat-icon interviews"><FaVideo aria-hidden="true" /></span>
          <div><strong>{progress.liveInterviewNumber || 0}</strong><span>Live interviews</span></div>
        </article>
        <article className="my-progress-stat-card">
          <span className="my-progress-stat-icon tests"><FaClipboardList aria-hidden="true" /></span>
          <div><strong>{progress.onlineMockTestNumber || 0}</strong><span>Online tests</span></div>
        </article>
        <article className="my-progress-stat-card">
          <span className="my-progress-stat-icon assignments"><FaCheckCircle aria-hidden="true" /></span>
          <div><strong>{assignmentStats.submittedCount || 0}<small> / {assignmentTotal}</small></strong><span>Assignments completed</span></div>
          <div className="my-progress-mini-track" aria-label={`${assignmentPercent}% of assigned work completed`}><span style={{ width: `${assignmentPercent}%` }} /></div>
        </article>
      </section>

      {error && <p className="my-progress-error" role="alert">{error}</p>}

      <section className="my-progress-timeline-card" aria-labelledby="my-progress-timeline-heading">
        <div className="my-progress-section-heading">
          <div className="my-progress-section-icon"><FaRegCalendarAlt aria-hidden="true" /></div>
          <div>
            <h2 id="my-progress-timeline-heading">Your progress timeline</h2>
            <p>A little snapshot of how far you’ve come.</p>
          </div>
          {activities.length > 0 && <span className="my-progress-update-count">{activities.length} {activities.length === 1 ? "update" : "updates"}</span>}
        </div>

        {activities.length > 0 ? (
          <div className="my-progress-timeline">
            {activities.map((activity) => (
              <article className="my-progress-timeline-entry" key={activity.id}>
                <span className="my-progress-timeline-dot" aria-hidden="true" />
                <div className="my-progress-timeline-content">
                  <time dateTime={activity.activityDate}>{formatActivityDate(activity.activityDate)}</time>
                  <h3>{activity.title}</h3>
                  {activity.details && <p>{activity.details}</p>}
                  <span className="my-progress-tutor">Shared by {activity.recorder?.name || "your tutor"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="my-progress-empty">
            <div className="my-progress-empty-art" aria-hidden="true">
              <span className="my-progress-empty-spark spark-one">✦</span>
              <span className="my-progress-empty-spark spark-two">✧</span>
              <span className="my-progress-empty-icon"><FaCompass /></span>
            </div>
            <span className="my-progress-empty-kicker">A NEW JOURNEY IS TAKING SHAPE</span>
            <h3>Your milestones will show up here</h3>
            <p>As you learn and reach new goals, your tutor can add updates here. Check back anytime to see how far you’ve come, every small win matters.</p>
            <button type="button" onClick={() => navigate("/courses")}>
              Continue learning <FaArrowRight aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
