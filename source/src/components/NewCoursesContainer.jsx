import { NewCourseCard } from "./NewCourseCard";

const NewCourseContainer = ({
  courses = [],
  hoveredCourse,
  setHoveredCourse,
  courseText,
  buttonText,
  onButtonClick,
}) => (
  <div
    style={{
      marginTop: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
    }}
  >
    <span
      style={{
        fontSize: "22px",
        fontWeight: "600",
        color: "#1e1e1e",
        marginLeft: "6px",
      }}
    >
      {courseText}
    </span>

    {courses?.length > 0 &&
      courses.map((course, idx) => (
        <NewCourseCard
          key={course.id || course._id}
          course={course}
          hovered={hoveredCourse === idx}
          onMouseEnter={() => setHoveredCourse(idx)}
          onMouseLeave={() => setHoveredCourse(null)}
          buttonText={buttonText}
          onButtonClick={onButtonClick}
        />
      ))}
  </div>
);

export default NewCourseContainer;