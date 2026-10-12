import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { fetchCourseHeader } from "../api/CourseDetailPage";
import { isCourseActive } from "../utils/courseAvailability";
import DashboardLayout from "./DashboardLayout";

const CourseAvailabilityRoute = ({ children }) => {
  const { id, cId } = useParams();
  const location = useLocation();
  const courseId = id || cId;
  const [availability, setAvailability] = useState(null);
  const canPreviewInactiveCourse = new URLSearchParams(location.search).get("contentPreview") === "true"
    && ["admin", "instructor"].includes(localStorage.getItem("userRole"));

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("authToken");
    fetchCourseHeader(courseId, token)
      .then((response) => {
        if (!cancelled) {
          setAvailability({
            courseId,
            status: isCourseActive(response.data.data) ? "active" : "inactive",
          });
        }
      })
      .catch(() => {
        if (!cancelled) setAvailability({ courseId, status: "error" });
      });
    return () => { cancelled = true; };
  }, [courseId]);

  if (availability?.courseId !== courseId) {
    return <DashboardLayout pageTitle="Course Details"><div className="dashboard-layout__loading" role="status">Checking course availability…</div></DashboardLayout>;
  }

  if (availability.status !== "active" && !(
    availability.status === "inactive" && canPreviewInactiveCourse
  )) {
    return (
      <DashboardLayout pageTitle="Course Locked" pageDescription="Course access is currently unavailable.">
        <section className="dashboard-layout__loading">
          <div>
            <h2><FaLock aria-hidden="true" /> Course locked</h2>
            <p role="alert">
              {availability.status === "error"
                ? "Course availability could not be verified. Please try again later."
                : "This course is inactive. Enrollment and course access are unavailable."}
            </p>
            <Link to="/courses">Back to courses</Link>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return children;
};

export default CourseAvailabilityRoute;
