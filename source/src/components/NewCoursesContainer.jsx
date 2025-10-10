import { NewCourseCard } from "./NewCourseCard";

const NewCourseContainer = ({ courses, hoveredCourse, setHoveredCourse,courseText,buttonText }) => (
    <div style={{ padding: "0px 0px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
        <span style={{ fontSize: "20px", fontWeight: "600", color: "#1e1e1e", marginLeft: "6px" }}>
            {`${courseText}`}
        </span>
        {courses.length && courses.map((course, idx) => (
            <NewCourseCard
                key={course.id}
                course={course}
                hovered={hoveredCourse === idx}
                onMouseEnter={() => setHoveredCourse(idx)}
                onMouseLeave={() => setHoveredCourse(null)}
                buttonText ={buttonText}
            />
        ))}
    </div>
);
export default NewCourseContainer;