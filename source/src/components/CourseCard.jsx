const PRIMARY_COLOR = "#367cfe";
const PRIMARY_COLOR_HOVER = "#2556b8";
const PRIMARY_SHADOW = "0 2px 8px rgba(54,124,254,0.18)";

export const CourseCard = ({ course, hovered, onMouseEnter, onMouseLeave, buttonText }) => (
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
                src={course.img}
                alt={course.title}
                style={{ height: "72px", width: "72px", objectFit: "contain" }}
            />
        </div>
        <div style={{ marginLeft: "36px", flex: 1 }}>
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#1e1e1e" }}>
                {course.title}
            </span>
            <div
                style={{
                    background: "#f1f1f1",
                    borderRadius: "100px",
                    height: "12px",
                    width: "168px",
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                <span style={{ fontSize: "12px", fontWeight: "400", color: "#272727", whiteSpace: "nowrap" }}>
                    Next Lesson: {course.nextLesson}
                </span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e1e1e", marginTop: "8px", display: "block" }}>
                {course.progress}% Completed
            </span>
            <div
                style={{
                    background: "#ffedd2",
                    borderRadius: "100px",
                    height: "14px",
                    width: "326px",
                    marginTop: "8px",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        background: "#ffb74d",
                        borderRadius: "100px",
                        height: "10px",
                        width: `${Math.round(course.progress * 3.26)}px`,
                        position: "absolute",
                        left: "2px",
                        top: "2px",
                    }}
                ></div>
            </div>
        </div>
        <div
            style={{
                background: PRIMARY_COLOR,
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
                e.currentTarget.style.background = PRIMARY_COLOR_HOVER;
                e.currentTarget.style.boxShadow = PRIMARY_SHADOW;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = PRIMARY_COLOR;
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>
                {`${buttonText}`}
            </span>
        </div>
    </div>
);