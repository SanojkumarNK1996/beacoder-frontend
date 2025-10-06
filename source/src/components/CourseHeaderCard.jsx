import React from "react";

export const CourseHeaderCard = ({ course }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px",
        }}
    >
        <div
            style={{
                background: "rgba(240, 246, 255, 1.00)",
                borderRadius: "16px",
                height: "102px",
                width: "102px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src={course.imgUrl}
                alt={course.courseName}
                style={{ height: "72px", width: "72px", objectFit: "contain" }}
            />
        </div>
        <div style={{ flex: 1 }}>
            <span
                style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#1e1e1e",
                }}
            >
                {course.courseName}
            </span>
            <p style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>
                {course.description}
            </p>
        </div>
    </div>
);