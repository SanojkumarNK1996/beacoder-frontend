import React from "react";
import { useNavigate } from "react-router-dom";

export const NewCourseCard = ({
  course,
  buttonText,
  onButtonClick,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const navigate = useNavigate();

  const rawCompletion = parseFloat(course?.completionPercentage);
  const isEnrolled = !isNaN(rawCompletion);

  const completionPct = isEnrolled
    ? Math.max(0, Math.min(100, rawCompletion))
    : 0;

  const handleClick = async () => {
    const courseId = course?.id || course?.courseId || course?._id;

    if (onButtonClick) {
      await onButtonClick(course);
      // after enroll (or any onButtonClick side-effect), navigate to course detail
      return navigate(`/courses/${courseId}`);
    }

    navigate(`/courses/${courseId}`);
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? "#f8fbff" : "#fff",
        borderRadius: 24,
        padding: 28,
        display: "flex",
        alignItems: "center",
        gap: 28,
        boxShadow: hovered
          ? "0 10px 28px rgba(54,124,254,0.18)"
          : "0 6px 24px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Image */}
      <div
        style={{
          background: "#eef4ff",
          borderRadius: 18,
          height: 110,
          width: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={
            course?.imageUrl?.startsWith("http")
              ? course.imageUrl
              : `/images/${course?.imageUrl || "default.png"}`
          }
          alt={course?.courseName}
          style={{ width: 75, height: 75, objectFit: "contain" }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#0f1724",
          }}
        >
          {course?.courseName}
        </h2>

        {/* Enrolled → Bigger Progress */}
        {isEnrolled ? (
          <div style={{ marginTop: 20, width: 300 }}>
            <div
              style={{
                position: "relative",
                height: 18, // ⬆ bigger bar
                background: "rgba(54,124,254,0.1)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg,#367cfe 0%,#6aa7ff 50%,#8ec5ff 100%)",
                  boxShadow: "0 6px 18px rgba(54,124,254,0.4)",
                  transition: "width 0.6s cubic-bezier(.4,2,.6,1)",
                }}
              />
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 16, // ⬆ bigger percentage
                fontWeight: 700,
                color: "#367cfe",
              }}
            >
              {Math.round(completionPct)}% Completed
            </div>
          </div>
        ) : (
          /* Course Section → Bigger Description */
          <p
            style={{
              marginTop: 14,
              fontSize: 16, // ⬆ bigger description
              color: "#475467",
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            {course?.description}
          </p>
        )}
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        style={{
          background: "#367cfe",
          color: "#fff",
          border: "none",
          borderRadius: 40,
          padding: "14px 28px", // ⬆ bigger button
          fontWeight: 700,
          fontSize: 16, // ⬆ bigger text
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#2556b8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#367cfe";
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};