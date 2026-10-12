import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import NewCourseContainer from "../../components/NewCoursesContainer";
import "./CourseList.css";
import { fetchCourses, fetchEnrolledCourses, fetchUserProfile, enrollCourse } from "../../api/CourseList";
import { isCourseActive } from "../../utils/courseAvailability";

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

const CourseList = () => {
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userName, setUserName] = useState("User");
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const [coursesData, enrolledData, userData] = await Promise.all([
          fetchCourses(token),
          fetchEnrolledCourses(token),
          fetchUserProfile(token),
        ]);
        setCourses(coursesData);
        setEnrolledCourses((enrolledData || []).map((course) => ({
          ...course,
          id: course.courseId,
        })));
        setUserName(userData.userName);
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

  const filteredCourses = courses.filter((course) => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return true;
    return [course.courseName, course.description, course.stream]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });
  const filteredEnrolledCourses = enrolledCourses.filter((course) => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return true;
    return [course.courseName, course.description, course.stream]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });
  const hasSearchResults = filteredCourses.length > 0 || filteredEnrolledCourses.length > 0;

  if (isLoading) {
    return <DashboardLayout userName={userName} onLogout={handleLogout}><div className="dashboard-layout__loading" role="status">Loading courses…</div></DashboardLayout>;
  }

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="course-list-content" overlays={<LogoutToast show={showLogoutToast} />}>
            <div className="course-search-bar" role="search">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Search courses"
                aria-label="Search courses"
              />
              {courseSearch && (
                <button
                  type="button"
                  onClick={() => setCourseSearch("")}
                  aria-label="Clear course search"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {filteredEnrolledCourses.length > 0 && (
              <NewCourseContainer
                courses={filteredEnrolledCourses}
                hoveredCourse={hoveredCourse}
                setHoveredCourse={setHoveredCourse}
                courseText="My Courses"
                buttonText="Continue"
              />
            )}
            {filteredCourses.length > 0 && (
              <NewCourseContainer
                courses={filteredCourses}
                hoveredCourse={hoveredCourse}
                setHoveredCourse={setHoveredCourse}
                courseText={filteredEnrolledCourses.length > 0 ? "Explore Courses" : ""}
                buttonText="Enroll"
                onButtonClick={async (course) => {
                  setEnrollmentError("");
                  if (!isCourseActive(course)) {
                    setEnrollmentError("This course is inactive and cannot be enrolled in.");
                    return false;
                  }

                  const token = localStorage.getItem("authToken");
                  try {
                    await enrollCourse(token, course);
                    return true;
                  } catch (err) {
                    console.error(err);
                    setEnrollmentError(
                      err.response?.data?.message ||
                        err.message ||
                        "Unable to enroll in this course."
                    );
                    return false;
                  }
                }}
              />
            )}
            {enrollmentError && (
              <p
                role="alert"
                style={{ color: "#b42318", margin: "12px 6px", fontWeight: 600 }}
              >
                {enrollmentError}
              </p>
            )}
            {!hasSearchResults && (
              <p className="course-search-empty">
                {courseSearch ? `No courses match “${courseSearch}”.` : "No courses are available yet."}
              </p>
            )}
    </DashboardLayout>
  );
};

export default CourseList;
