import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import PageHeader from "./PageHeader";
import { fetchUserProfile } from "../api/CourseList";
import "./DashboardLayout.css";

/** Shared shell for authenticated dashboard pages. Page-specific content stays page-owned. */
const headerForPath = (pathname) => {
  if (pathname === "/homepage") return ["Your learning dashboard", "Track your progress, connect with your tutors, and continue your courses."];
  if (pathname === "/courses" || pathname === "/dashboard") return ["Courses", "Explore available courses and find your next learning path."];
  if (pathname === "/curriculum") return ["Curriculum", "Explore career domains and follow a structured roadmap to job-ready skills."];
  if (pathname === "/mentors") return ["Mentors", "Meet the mentors supporting your learning journey."];
  if (pathname === "/recruiters") return ["Kyrox Recruitment Partners", "Track opportunities and discover hiring companies and referrals."];
  if (pathname === "/assignments") return ["My Assignments", "Review your tasks, track progress, and submit your work."];
  if (pathname === "/quizzes") return ["Quizzes", "Choose a learning area and test what you know with a focused multiple-choice quiz."];
  if (pathname === "/my-tests") return ["My Tests", "Complete mentor-assigned tests and review your results."];
  if (pathname === "/questionnaires") return ["Questionnaires", "Create tests from the quiz bank, assign them to learners, and review topic-level results."];
  if (pathname === "/assignments/manage") return ["Assign Learning Tasks", "Choose a course section, reusable assignments, and enrolled students."];
  if (pathname === "/instructor/assignments") return ["Submitted Assignments", "Review student work, share feedback, and request corrections when needed."];
  if (pathname === "/instructor/assignments/detail") return ["Assignment Review", "Review the submission and share feedback with the learner."];
  if (pathname.startsWith("/instructor/discussions/")) return ["Discussion Details", "Review the conversation and follow its replies."];
  if (pathname === "/instructor/discussions") return ["Course Discussions", "Browse learner conversations and respond to questions."];
  if (pathname === "/instructor/pair-programming") return ["Pair Programming Requests", "Review learner requests and coordinate collaborative coding sessions."];
  if (pathname.startsWith("/discussions/")) return ["Discussion Details", "Follow the conversation and share a reply."];
  if (pathname === "/discussions") return ["Discussions", "Ask questions, share ideas, and learn together."];
  if (pathname === "/content-editor") return ["Course Content Editor", "Select a lesson to edit its content. Section headings and course structure stay unchanged."];
  if (pathname === "/admin/users") return ["User Management", "Find users and update their account details and access status."];
  if (pathname === "/progress/manage") return ["Student Progress", "Search for a candidate, then select Edit to view or update their progress."];
  if (pathname === "/my-progress") return ["My Progress", "Celebrate how far you’ve come and see the milestones your tutor has shared."];
  if (pathname.startsWith("/courses/")) return ["Course Details", "Explore course topics and lessons."];
  if (pathname.startsWith("/course/")) return ["Lesson Content", "Work through this lesson and record your understanding when you're done."];
  return ["Learning Dashboard", "Continue your learning journey."];
};

export default function DashboardLayout({ children, onLogout, contentClassName = "", overlays = null, pageTitle, pageDescription }) {
  const [hovered, setHovered] = useState(null);
  const [profileName, setProfileName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [defaultTitle, defaultDescription] = headerForPath(location.pathname);
  const title = pageTitle || defaultTitle;
  const description = pageDescription || defaultDescription;

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserProfile(token)
        .then((profile) => { if (active) setProfileName(profile.userName || profile.name || ""); })
        .catch((error) => console.error("Unable to load dashboard profile:", error));
    }
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar hovered={hovered} setHovered={setHovered} />
      <main className="dashboard-layout__main">
        <TopBar userName={profileName || "User"} onLogout={handleLogout} />
        <PageHeader title={title} description={description} className="dashboard-layout__page-header" />
        <div className={`dashboard-layout__content ${contentClassName}`.trim()}>
          {children}
        </div>
      </main>
      {overlays}
    </div>
  );
}
