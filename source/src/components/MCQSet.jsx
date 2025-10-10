import React, { useState } from "react";

const MCQSet = ({ questions }) => {
    const [selected, setSelected] = useState(Array(questions.length).fill(null));
    const [status, setStatus] = useState(Array(questions.length).fill(null)); // "correct" | "wrong" | null
    const [completed, setCompleted] = useState(false);
    const [current, setCurrent] = useState(0);

    // Handle option click and evaluate instantly
    const handleOptionClick = (oidx) => {
        if (completed || status[current]) return;
        const arr = [...selected];
        arr[current] = oidx;
        setSelected(arr);

        const newStatus = [...status];
        newStatus[current] = questions[current].options[oidx] === questions[current].answer ? "correct" : "wrong";
        setStatus(newStatus);
    };

    // Check if all questions are answered
    const allAnswered = status.every(s => s);

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "900px",
                minHeight: "420px",
                margin: "32px auto",
                background: "#fff",
                borderRadius: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                padding: "32px 32px 24px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                opacity: completed ? 0.6 : 1,
                pointerEvents: completed ? "none" : "auto"
            }}
        >
            <div style={{
                fontWeight: 700,
                fontSize: "1.5rem",
                marginBottom: "24px",
                color: "#367cfe",
                textAlign: "center"
            }}>
                Quiz
            </div>
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
                {questions.map((_, idx) => (
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
            {/* Only show one question at a time */}
            <div style={{ marginBottom: "32px", width: "100%" }}>
                <div style={{
                    fontWeight: 600,
                    fontSize: "1.18rem",
                    marginBottom: "18px",
                    color: "#222"
                }}>
                    {current + 1}. {questions[current].question}
                </div>
                <div>
                    {questions[current].options.map((opt, oidx) => {
                        const isSelected = selected[current] === oidx;
                        const isAnswered = status[current] !== null;
                        const isCorrect = isAnswered && opt === questions[current].answer;
                        const isWrong = isAnswered && isSelected && !isCorrect;
                        // Only show correct icon once for correct answer
                        const showCorrectForWrong = isAnswered && status[current] === "wrong" && opt === questions[current].answer;
                        const showCorrectIcon = isAnswered && (isCorrect || showCorrectForWrong);
                        return (
                            <label
                                key={oidx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "1.08rem",
                                    marginBottom: "16px",
                                    cursor: completed || isAnswered ? "default" : "pointer",
                                    background: showCorrectIcon
                                        ? "#e6f9ed"
                                        : isWrong
                                            ? "#ffeaea"
                                            : "#fff",
                                    border: showCorrectIcon
                                        ? "1.5px solid #43b77a"
                                        : isWrong
                                            ? "1.5px solid #e74c3c"
                                            : "1.5px solid #e0e0e0",
                                    borderRadius: "10px",
                                    padding: "12px 20px",
                                    fontWeight: isSelected ? 700 : 500,
                                    color: "#222",
                                    boxShadow: isSelected ? "0 2px 8px #367cfe22" : "none",
                                    transition: "all 0.2s"
                                }}
                                onClick={() => !completed && !isAnswered && handleOptionClick(oidx)}
                            >
                                <input
                                    type="radio"
                                    name={`mcq-${current}`}
                                    checked={isSelected}
                                    readOnly
                                    style={{
                                        marginRight: "14px",
                                        accentColor: "#367cfe",
                                        width: 18,
                                        height: 18,
                                        flexShrink: 0
                                    }}
                                />
                                {opt}
                                {/* Only icons, no text */}
                                {showCorrectIcon && (
                                    <span style={{ marginLeft: "12px", color: "#43b77a", fontWeight: 700, fontSize: "1.3em" }}>✔️</span>
                                )}
                                {isAnswered && isWrong && isSelected && (
                                    <span style={{ marginLeft: "12px", color: "#e74c3c", fontWeight: 700, fontSize: "1.3em" }}>❌</span>
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                maxWidth: 700,
                marginTop: "10px",
                gap: "18px"
            }}>
                <button
                    onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
                    disabled={current === 0}
                    style={{
                        padding: "12px 36px",
                        borderRadius: "10px",
                        border: "1.5px solid #e0e0e0",
                        background: current === 0 ? "#f5f5f5" : "#fff",
                        color: current === 0 ? "#aaa" : "#222",
                        fontWeight: 600,
                        fontSize: "1.08rem",
                        cursor: current === 0 ? "not-allowed" : "pointer",
                        boxShadow: "none",
                        transition: "background 0.2s, color 0.2s"
                    }}
                >
                    Previous
                </button>
                {current < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
                        disabled={status[current] === null}
                        style={{
                            padding: "12px 36px",
                            borderRadius: "10px",
                            border: "1.5px solid #367cfe",
                            background: status[current] === null ? "#e0e0e0" : "#367cfe",
                            color: status[current] === null ? "#aaa" : "#fff",
                            fontWeight: 600,
                            fontSize: "1.08rem",
                            cursor: status[current] === null ? "not-allowed" : "pointer",
                            boxShadow: "none",
                            transition: "background 0.2s"
                        }}
                    >
                        Next
                    </button>
                ) : (
                    allAnswered && !completed && (
                        <button
                            style={{
                                padding: "12px 36px",
                                borderRadius: "10px",
                                border: "1.5px solid #43b77a",
                                background: "#43b77a",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "1.08rem",
                                cursor: "pointer",
                                boxShadow: "none",
                                transition: "background 0.2s"
                            }}
                            onClick={() => setCompleted(true)}
                        >
                            Complete Quiz
                        </button>
                    )
                )}
            </div>
            {completed && (
                <div style={{
                    marginTop: "18px",
                    fontSize: "1.18rem",
                    color: "#367cfe",
                    fontWeight: 600,
                    textAlign: "center"
                }}>
                    Quiz Completed!
                </div>
            )}
        </div>
    );
};

export default MCQSet;