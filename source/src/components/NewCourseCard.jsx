import { useNavigate } from "react-router-dom";

export const NewCourseCard = ({ course, hovered, onMouseEnter, onMouseLeave, buttonText }) => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                background: hovered ? "#f0f6ff" : "#fff",
                borderRadius: "20px",
                height: "142px",
                width: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "36px 30px",
                boxSizing: "border-box",
                boxShadow: hovered ? "0 4px 16px rgba(54,124,254,0.15)" : "none",
                transition: "background 0.2s, box-shadow 0.2s",
                cursor: "pointer",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                style={{
                    background: "#f0f6ff",
                    borderRadius: "16px",
                    height: "102px",
                    width: "102px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <img
                    src={course.imageUrl}
                    alt={course.courseName}
                    style={{ height: "72px", width: "72px", objectFit: "contain" }}
                />
            </div>
            <div style={{ marginLeft: "36px", flex: 1 }}>
                <span style={{ fontSize: "22px", fontWeight: "600", color: "#1e1e1e" }}>
                    {course.courseName}
                </span>
            </div>
            <div
                style={{
                    background: "#367cfe",
                    borderRadius: "30px",
                    height: "40px",
                    width: "114px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "auto",
                    transition: "background 0.2s, box-shadow 0.2s",
                    boxShadow: "none",
                    border: "none",
                    cursor: "pointer",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = "#2556b8";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(54,124,254,0.18)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = "#367cfe";
                    e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => navigate(`/courses/${course.id}`)}
            >
                <span style={{ fontSize: "19px", fontWeight: "600", color: "#fff" }}>
                    {`${buttonText}`}
                </span>
            </div>
        </div>
    );
};