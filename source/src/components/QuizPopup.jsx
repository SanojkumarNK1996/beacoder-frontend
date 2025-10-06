import React, { useState } from "react";

const QuizPopup = ({ onClose, onSubmit, quizQuestions }) => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(Array(quizQuestions.length).fill(null));
    const [status, setStatus] = useState(Array(quizQuestions.length).fill(null)); // "correct" | "wrong" | null

    const handleOptionClick = (idx) => {
        const updated = [...selected];
        updated[current] = idx;
        setSelected(updated);

        // Show indicator immediately after selection
        const newStatus = [...status];
        newStatus[current] = quizQuestions[current].options[idx] === quizQuestions[current].answer ? "correct" : "wrong";
        setStatus(newStatus);
    };

    const handleNext = () => {
        if (current < quizQuestions.length - 1) setCurrent(current + 1);
        else {
            onSubmit();
        }
    };

    const handleBack = () => {
        if (current > 0) setCurrent(current - 1);
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(54,124,254,0.10)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                width: "90vw",
                maxWidth: 800,
                background: "linear-gradient(135deg,#f0f6ff 0%,#e3edff 100%)",
                borderRadius: "32px",
                boxShadow: "0 8px 32px rgba(54,124,254,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                padding: "48px 32px 32px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                animation: "popIn .3s cubic-bezier(.68,-0.55,.27,1.55)"
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 18,
                        right: 24,
                        background: "none",
                        border: "none",
                        fontSize: 28,
                        color: "#367cfe",
                        cursor: "pointer",
                        fontWeight: 700,
                    }}
                    aria-label="Close"
                >×</button>

                {/* Progress Indicator */}
                <div style={{
                    width: "100%",
                    maxWidth: 400,
                    margin: "0 auto 24px auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                }}>
                    {quizQuestions.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: 32,
                                height: 8,
                                borderRadius: 4,
                                background: idx === current ? "#367cfe" : "#e0e0e0",
                                transition: "background 0.2s"
                            }}
                        />
                    ))}
                </div>

                {/* Question */}
                <div style={{
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "#1e1e1e",
                    marginBottom: 24,
                    textAlign: "center",
                    minHeight: 60,
                }}>
                    Q{current + 1}. {quizQuestions[current].question}
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    marginBottom: 32,
                }}>
                    {quizQuestions[current].options.map((opt, idx) => {
                        const isSelected = selected[current] === idx;
                        const isAnswered = status[current] !== null;
                        const isCorrect = isAnswered && opt === quizQuestions[current].answer;
                        const isWrong = isAnswered && isSelected && !isCorrect;
                        // Only show correct icon once for correct answer
                        const showCorrectForWrong = isAnswered && status[current] === "wrong" && opt === quizQuestions[current].answer;
                        const showCorrectIcon = isAnswered && (isCorrect || showCorrectForWrong);

                        return (
                            <button
                                key={opt}
                                onClick={() => handleOptionClick(idx)}
                                style={{
                                    padding: "18px 20px",
                                    borderRadius: "14px",
                                    border: isSelected ? "2.5px solid #367cfe" : "2px solid #dbeafe",
                                    background: showCorrectIcon
                                        ? "#e6f9ed"
                                        : isWrong
                                            ? "#ffeaea"
                                            : isSelected
                                                ? "#e3edff"
                                                : "#fff",
                                    color: "#1e1e1e",
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    cursor: isAnswered ? "default" : "pointer",
                                    boxShadow: isSelected ? "0 2px 12px #367cfe22" : "0 1px 4px #0001",
                                    transition: "all 0.18s",
                                    outline: "none",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                                disabled={isAnswered}
                            >
                                <span>{opt}</span>
                                {showCorrectIcon && (
                                    <span style={{ marginLeft: "12px", color: "#43b77a", fontWeight: 700, fontSize: "1.3em" }}>✔️</span>
                                )}
                                {isAnswered && isWrong && isSelected && (
                                    <span style={{ marginLeft: "12px", color: "#e74c3c", fontWeight: 700, fontSize: "1.3em" }}>❌</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "18px",
                    width: "100%",
                    justifyContent: "space-between"
                }}>
                    <button
                        onClick={handleBack}
                        disabled={current === 0}
                        style={{
                            padding: "12px 32px",
                            borderRadius: "8px",
                            background: current === 0 ? "#e3edff" : "#f0f6ff",
                            color: current === 0 ? "#b0b8c9" : "#367cfe",
                            border: "2px solid #b6d2ff",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            cursor: current === 0 ? "not-allowed" : "pointer",
                            transition: "background 0.2s, color 0.2s, border 0.2s"
                        }}
                    >Back</button>
                    <button
                        onClick={handleNext}
                        disabled={selected[current] === null}
                        style={{
                            padding: "12px 32px",
                            borderRadius: "8px",
                            background: selected[current] === null ? "#e3edff" : "#367cfe",
                            color: selected[current] === null ? "#b0b8c9" : "#fff",
                            border: selected[current] === null ? "2px solid #b6d2ff" : "2px solid #367cfe",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            cursor: selected[current] === null ? "not-allowed" : "pointer",
                            transition: "background 0.2s, color 0.2s, border 0.2s"
                        }}
                    >{current === quizQuestions.length - 1 ? "Submit" : "Next"}</button>
                </div>
            </div>
            <style>
                {`
                @keyframes popIn {
                    0% { transform: scale(0.7); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default QuizPopup;