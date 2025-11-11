import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

export const InterviewQuiz = ({ questions }) => {
  const getBadgeStyle = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return {
          background: "linear-gradient(135deg, #b5ffb8, #90ee90)",
          color: "#155724",
        };
      case "medium":
        return {
          background: "linear-gradient(135deg, #fff3cd, #ffe58a)",
          color: "#856404",
        };
      case "hard":
        return {
          background: "linear-gradient(135deg, #f8d7da, #f5a3a8)",
          color: "#721c24",
        };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "40px 30px",
        borderRadius: "18px",
        background: "linear-gradient(145deg, #f5f7fa, #ffffff)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "36px",
        }}
      >
        <FaQuestionCircle size={34} color="#367cfe" />
        <h1
          style={{
            color: "#222",
            fontWeight: 700,
            fontSize: "28px",
            background: "linear-gradient(90deg, #367cfe, #6ad7ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Interview Questions
        </h1>
      </div>

      {/* Questions */}
      {questions.map((q, index) => (
        <div
          key={index}
          style={{
            marginBottom: "32px",
            padding: "30px 26px",
            borderRadius: "16px",
            backgroundColor: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
          }}
        >
          {/* Question */}
          <p
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111",
              marginBottom: "18px",
              lineHeight: "1.7",
            }}
          >
            Q{index + 1}: {q.question}
          </p>

          {/* Answer */}
          <p
            style={{
              color: "#333",
              marginTop: "12px",
              fontSize: "19px",
              lineHeight: "1.9",
            }}
          >
            <strong style={{ color: "#000", fontSize: "20px" }}>Answer:</strong>{" "}
            {q.answer}
          </p>

          {/* Difficulty */}
          {q.difficulty && (
            <span
              style={{
                ...getBadgeStyle(q.difficulty),
                display: "inline-block",
                marginTop: "18px",
                padding: "8px 18px",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                letterSpacing: "0.4px",
              }}
            >
              {q.difficulty.toUpperCase()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
