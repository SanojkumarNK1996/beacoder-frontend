import PageHeader from "./PageHeader";
import { getCourseImageUrl } from "../utils/courseImage";

export const CourseHeaderCard = ({ course }) => (
    <PageHeader
        className="page-header--compact"
        title={course?.courseName || "Course"}
        description={course?.description || "Explore the topics and lessons in this course."}
        iconImage={getCourseImageUrl(course?.imageUrl, course?.courseName)}
        iconAlt={`${course?.courseName || "Course"} icon`}
    />
);