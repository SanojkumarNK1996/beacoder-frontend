import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { TopBar } from "../../components/TopBar";
import { CourseListRightSidebar } from "../../components/CourseListRightSidebar";
import NewCourseContainer from "../../components/NewCoursesContainer";
import MainPageLoader from "../../components/MainPageLoader";
import "./CourseList.css";
import { fetchCourses, fetchUserProfile, fetchEnrolledCourses, enrollCourse } from "../../api/CourseList"; 

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

const CourseList = () => {
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(0);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [enrolledHoveredCourse, setEnrolledHoveredCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [coursesData, userData, enrolledData] = await Promise.all([
          fetchCourses(token),
          fetchUserProfile(token),
          fetchEnrolledCourses(token),
        ]);
        setCourses(coursesData);
        setUserName(userData.userName);
        // Normalize enrolled courses so each has an `id` field taken from `courseId`
        const normalizedEnrolled = (enrolledData || []).map(c => ({ ...c, id: c.courseId }));
        setEnrolledCourses(normalizedEnrolled);
      } catch (err) {
        console.error(err);
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

  if (isLoading) {
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading courses..." />;
  }

  return (
    <div className="course-list-container">
      <Sidebar active={active} hovered={hovered} setActive={setActive} setHovered={setHovered} />

      <div className="course-list-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="course-list-inner">
          <div className="course-list-content">
            {enrolledCourses && enrolledCourses.length > 0 && (
              <NewCourseContainer
                courses={enrolledCourses}
                hoveredCourse={enrolledHoveredCourse}
                setHoveredCourse={setEnrolledHoveredCourse}
                courseText="Enrolled Courses"
                buttonText="Continue"
              />
            )}

            <NewCourseContainer
              courses={courses}
              hoveredCourse={hoveredCourse}
              setHoveredCourse={setHoveredCourse}
              courseText="Courses"
              buttonText="Enroll"
              onButtonClick={async (course) => {
                const token = localStorage.getItem("authToken");
                try {
                  await enrollCourse(token, course.id || course.courseId || course._id);
                  // refresh enrolled list
                  const enrolled = await fetchEnrolledCourses(token);
                  const normalizedEnrolled = (enrolled || []).map(c => ({ ...c, id: c.courseId }));
                  setEnrolledCourses(normalizedEnrolled);
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>

          <CourseListRightSidebar
            activities={initialActivities}
            achievements={initialAchievements}
          />
        </div>

        <LogoutToast show={showLogoutToast} />
      </div>
    </div>
  );
};

export default CourseList;
