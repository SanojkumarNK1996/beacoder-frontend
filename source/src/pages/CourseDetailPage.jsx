import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { CourseHeaderCard } from "../components/CourseHeaderCard"; // <-- Import new header card
import MainPageLoader from "../components/MainPageLoader";
import { FaTasks, FaChevronRight, FaChevronDown, FaChevronLeft, FaRegFileAlt } from "react-icons/fa";
import QuizPopup from "../components/QuizPopup";
import ToastNotification from "../components/ToastNotification";
import MCQSet from "../components/MCQSet";
import axios from "axios";


// const initialCourseHeaderData = {
//     id: 2,
//     courseName: "Java Programming for Beginners",
//     description: "Learn the basics of Java programming, including syntax, variables, and loops.",
//     imgUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
// };

// const initialTopicData = [
//     { title: "Introduction", displayOrder: 1 },
//     { title: "Variables & Data Types", displayOrder: 2 },
//     { title: "Loops & Iterations", displayOrder: 3 },
//     { title: "Functions & Methods", displayOrder: 4 },
//     { title: "Object Oriented Programming", displayOrder: 5 },
//     { title: "Quiz Test 1", displayOrder: 6 }
// ];

// const initialSubTopicData = [
//     {
//         topic: "Introduction",
//         subtopics: [
//             "What is Java?",
//             "Setting up Environment",
//             "Hello World Program"
//         ]
//     }
// ];

// const initialSubTopicContent = [
//     {
//         id: 1,
//         displayOrder: 1,
//         title: "What is Java?",
//         dataType: "youtube_video",
//         data: {
//             videoUrl: "https://www.youtube.com/watch?v=RRubcjpTkks",
//         }
//     },
//     {
//         id: 2,
//         displayOrder: 2,
//         title: "Introduction to JavaScript",
//         dataType: "notes",
//         data: {
//             description: `JavaScript is a versatile, high-level programming language that is primarily used to create interactive effects within web browsers. It is one of the core technologies of the World Wide Web, alongside HTML and CSS. JavaScript enables dynamic content, control of multimedia, animated images, and much more. It is supported by all modern web browsers and is essential for front-end web development. JavaScript can also be used on the server-side with environments like Node.js, making it a truly full-stack language. Understanding JavaScript fundamentals is crucial for anyone looking to build modern web applications.`
//         }
//     },
//     {
//         id: 3,
//         displayOrder: 3,
//         title: "Addition of Two Numbers in JavaScript",
//         dataType: "notes",
//         data: {
//             description: `In JavaScript, you can easily perform arithmetic operations such as addition. 
// This example demonstrates how to declare variables, assign values, and add two numbers. 
// The result is then printed to the console using console.log(). 
// Understanding variable declaration and basic operations is fundamental for any programming language and is a great starting point for beginners.`,
//             codeSnippet: `let a = 5;
// let b = 10;

// console.log(a + b); // 15`
//         }
//     },
//     {
//         id: 4,
//         displayOrder: 4,
//         title: "String Concatenation in JavaScript",
//         dataType: "notes",
//         data: {
//             description: `String concatenation is the process of joining two or more strings together. In JavaScript, you can concatenate strings using the + operator or template literals. This example shows both methods. Understanding string manipulation is essential for handling user input, displaying messages, and working with text data in your applications.`,
//             codeSnippet: `let firstName = "John";
// let lastName = "Doe";

// // Using + operator
// let fullName = firstName + " " + lastName;
// console.log(fullName); // John Doe

// // Using template literals
// let greeting = \`Hello, \${firstName} \${lastName}!\`;
// console.log(greeting); // Hello, John Doe!`
//         }
//     },
//     {
//         id: 5,
//         displayOrder: 5,
//         title: "JavaScript Variables and Data Types",
//         dataType: "notes",
//         data: {
//             description: `Variables in JavaScript are containers for storing data values. You can declare variables using var, let, or const. JavaScript supports several data types including strings, numbers, booleans, objects, arrays, null, and undefined. Understanding how to declare variables and work with different data types is essential for writing effective JavaScript code.`
//         }
//     },
//     {
//         id: "013cfc6e-ccf5-4026-a93a-59c68af4be74",
//         displayOrder: 6,
//         dataType: "mcq_set",
//         title: "Quiz",
//         data: {
//             questions: [
//                 {
//                     answer: "All of the above",
//                     options: [
//                         "var",
//                         "let",
//                         "const",
//                         "All of the above"
//                     ],
//                     question: "Which keyword is used to declare a variable in JavaScript?"
//                 },
//                 {
//                     answer: "Yes, with let, var, or const (with some restrictions)",
//                     options: [
//                         "Yes, with var only",
//                         "Yes, with let and var",
//                         "No, variables are always constant",
//                         "Yes, with let, var, or const (with some restrictions)"
//                     ],
//                     question: "Can a variable value change after it is declared?"
//                 },
//                 {
//                     answer: "A variable that cannot be changed",
//                     options: [
//                         "A variable that cannot be changed",
//                         "A variable that can be changed",
//                         "A variable declared without a value",
//                         "A variable that is only accessible inside a function"
//                     ],
//                     question: "What is a constant variable in JavaScript?"
//                 },
//                 {
//                     answer: "All of the above",
//                     options: [
//                         "let x = 10;",
//                         "const y = 5;",
//                         "var z = 20;",
//                         "All of the above"
//                     ],
//                     question: "Which of the following is a correct way to declare a variable in JavaScript?"
//                 }
//             ]
//         }
//     }
// ];

const quizQuestions = [
    {
        question: "What is the correct way to declare a variable in Java?",
        options: ["int num = 5;", "num int = 5;", "integer num = 5;", "var int num = 5;"],
        answer: "int num = 5;",
    },
    {
        question: "Which of these is NOT a primitive data type in Java?",
        options: ["int", "boolean", "String", "double"],
        answer: "String",
    },
    {
        question: "What is the output of: System.out.println(2 + \"2\");",
        options: ["4", "22", "2 2", "Error"],
        answer: "22",
    },
    {
        question: "Which keyword is used to inherit a class in Java?",
        options: ["this", "super", "extends", "implements"],
        answer: "extends",
    },
    {
        question: "Which loop is guaranteed to execute at least once?",
        options: ["for", "while", "do-while", "foreach"],
        answer: "do-while",
    },
];

const CourseDetailPage = () => {
    const { id } = useParams();
    const [hovered, setHovered] = useState(null);
    const [active, setActive] = useState(1);
    const [openIndex, setOpenIndex] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Simulate API call for course header
    const [courseHeader, setCourseHeader] = useState({});
    const [topicData, setTopicData] = useState([]);
    // Subtopics for the currently opened topic
    const [currentSubtopics, setCurrentSubtopics] = useState([]);

    // Simulate selecting a subtopic and fetching its data
    const [contentData, setContentData] = useState([]);


    // Find the first youtube_video for the video player
    const videoBlock = contentData.find(item => item.dataType === "youtube_video");
    // All notes blocks for the description section
    const notesBlocks = contentData.filter(item => item.dataType === "notes");

    const [loading, setLoading] = useState(true);
    const [subtopicLoading, setSubtopicLoading] = useState(false);
    const [contentLoading, setContentLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ])
            .then(([courseRes, topicsRes]) => {
                setCourseHeader(courseRes.data.data);
                setTopicData(topicsRes.data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
            });
    }, [id]);



    // Helper to detect quiz subtopics
    const isQuizSubtopic = (sub) =>
        sub.toLowerCase().includes("quiz");

    // Handler for quiz submit
    const handleQuizSubmit = () => {
        setShowQuiz(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    // Handler for topic dropdown click to fetch subtopics
    const handleTopicDropdown = (section, idx) => {
        if (openIndex === idx) {
            setOpenIndex(null);
            setCurrentSubtopics([]);
            return;
        }
        setOpenIndex(idx);
        setSubtopicLoading(true);
        const token = localStorage.getItem("authToken");
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics/${section.id}/subtopics`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setCurrentSubtopics(res.data.data); // Set the subtopics for rendering
                setSubtopicLoading(false);
            })
            .catch(err => {
                setCurrentSubtopics([]);
                setSubtopicLoading(false);
                console.error(err);
            });
    };

    const handleSubtopicClick = (courseId, topicId, subtopicId) => {
        setContentLoading(true);
        const token = localStorage.getItem("authToken");
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/contents`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setContentData(res.data.data); // Set the content data for rendering
                setSelectedSubtopic(
                    res.data.data && res.data.data.length > 0
                        ? res.data.data[0].title
                        : ""
                );
                setContentLoading(false);
            })
            .catch(err => {
                setContentData([]);
                setContentLoading(false);
                console.error(err);
            });
    };

    if (loading) {
        return <MainPageLoader variant="headerSidebarSkeleton" text="Loading course details..." />;
    }
    if (subtopicLoading) {
        return <MainPageLoader variant="headerSidebarSkeleton" text="Loading subtopics..." />;
    }
    if (contentLoading) {
        return <MainPageLoader variant="headerSidebarSkeleton" text="Loading content..." />;
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: "rgba(239, 246, 255, 1)",
                display: "flex",
                flexDirection: "row",
                padding: "20px",
                boxSizing: "border-box",
                fontFamily: "Montserrat, sans-serif",
                gap: "20px",
                position: "relative"
            }}
        >
            <Sidebar
                active={active}
                hovered={hovered}
                setActive={setActive}
                setHovered={setHovered}
            />

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Course Header Card */}
                {courseHeader != {} && !selectedSubtopic && (
                    <CourseHeaderCard course={courseHeader} />
                )}

                {/* Main Split Layout */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "16px",
                        height: selectedSubtopic
                            ? "calc(100vh - 140px)"
                            : "calc(100vh - 300px)",
                        overflowY: openIndex !== null && !selectedSubtopic ? "auto" : "hidden",
                        overflowX: "hidden",
                        minHeight: 0,
                        paddingBottom: "40px",
                        paddingTop: "8px",
                    }}
                >
                    {/* Syllabus Container */}
                    {!selectedSubtopic && (
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: "20px",
                                height: "100%",
                                width: "100%",
                                padding: "32px 24px",
                                boxSizing: "border-box",
                                overflowY: "auto",
                                transition: "width 0.3s ease",
                            }}
                        >
                            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px" }}>Syllabus</h2>
                            {/* Syllabus List */}
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {topicData.length && topicData
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((section, idx) => {
                                        const isQuiz = section.title.toLowerCase().includes("quiz");
                                        return (
                                            <React.Fragment key={section.title}>
                                                <li
                                                    style={{
                                                        color: idx === 0 ? "#1e1e1e" : "#444",
                                                        fontWeight: "600",
                                                        borderBottom: "1px solid #e0e0e0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "18px 0",
                                                        cursor: isQuiz ? "pointer" : "pointer",
                                                        fontSize: "16px",
                                                        background: openIndex === idx ? "#f7faff" : "transparent",
                                                        transition: "background 0.2s",
                                                    }}
                                                    onClick={() => {
                                                        if (isQuiz) {
                                                            setShowQuiz(true);
                                                        } else {
                                                            handleTopicDropdown(section, idx); // <-- API call for subtopics
                                                        }
                                                    }}
                                                >
                                                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        {isQuiz && (
                                                            <FaRegFileAlt style={{ color: "#ffb74d", fontSize: "22px" }} />
                                                        )}
                                                        {section.title}
                                                    </span>
                                                    {isQuiz ? (
                                                        // Exam icon as a button (no dropdown)
                                                        <FaTasks style={{ color: "#367cfe", fontSize: "22px", cursor: "pointer" }} />
                                                    ) : (
                                                        openIndex === idx ? (
                                                            <FaChevronDown style={{ color: "#222", fontSize: "22px" }} />
                                                        ) : (
                                                            <FaChevronRight style={{ color: "#222", fontSize: "22px" }} />
                                                        )
                                                    )}
                                                </li>
                                                {/* Only render subtopics for non-quiz sections */}
                                                {!isQuiz && openIndex === idx && (
                                                    <ul style={{ listStyle: "none", marginLeft: "0px", marginBottom: "8px", padding: "0" }}>
                                                        {(() => {
                                                            // Find the topic object for this section
                                                            const topicObj = currentSubtopics.find(t => t.topic === section.title);
                                                            if (!topicObj || !Array.isArray(topicObj.subtopics)) return null;
                                                            return topicObj.subtopics
                                                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                                                .map(sub => (
                                                                    <li
                                                                        key={sub.id}
                                                                        style={{
                                                                            fontSize: "15px",
                                                                            margin: "10px 0",
                                                                            color: "#367cfe",
                                                                            fontWeight: "500",
                                                                            paddingLeft: "12px",
                                                                            position: "relative",
                                                                            cursor: "pointer",
                                                                            borderRadius: "8px",
                                                                            background: selectedSubtopic === sub.title ? "#e3edff" : "transparent",
                                                                            transition: "background 0.2s",
                                                                        }}
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            handleSubtopicClick(id, topicObj.id, sub.id); // <-- API call for subtopic content
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                display: "inline-block",
                                                                                padding: "6px 14px",
                                                                                color: "#367cfe",
                                                                                fontWeight: "600",
                                                                                fontSize: "15px",
                                                                            }}
                                                                        >
                                                                            {sub.title}
                                                                        </span>
                                                                    </li>
                                                                ));
                                                        })()}
                                                    </ul>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                            </ul>
                        </div>
                    )}

                    {/* Right Container - Full width when subtopic is selected */}
                    {selectedSubtopic && (
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: "24px",
                                overflowY: "auto",
                                height: "100%",
                                padding: "24px",
                                background: "#f9f9f9",
                                borderRadius: "16px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                width: "100%",
                            }}
                        >
                            {/* Back Button and Subtopic Name */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "8px",
                            }}>
                                <button
                                    style={{
                                        background: "#e3edff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        marginRight: "8px",
                                        fontSize: "20px",
                                        color: "#367cfe",
                                        boxShadow: "0 2px 8px rgba(54, 124, 254, 0.08)",
                                        transition: "background 0.2s",
                                    }}
                                    onClick={() => setSelectedSubtopic(null)}
                                    title="Back to Syllabus"
                                >
                                    <FaChevronLeft />
                                </button>
                                <span style={{ fontSize: "20px", fontWeight: "600", color: "#222" }}>
                                    {selectedSubtopic}
                                </span>
                            </div>

                            {/* Video Player */}
                            {videoBlock && (
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, #e3edff 0%, #f9f9f9 100%)",
                                        borderRadius: "28px",
                                        width: "90%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        padding: "28px 12px 36px 12px",
                                        boxShadow: "0 8px 32px rgba(54, 124, 254, 0.10), 0 2px 8px rgba(0,0,0,0.06)",
                                        position: "relative",
                                        alignSelf: "center",
                                        marginBottom: "12px",
                                        transition: "box-shadow 0.3s, width 0.3s",
                                    }}
                                >
                                    <iframe
                                        width="100%"
                                        height="600"
                                        style={{
                                            borderRadius: "20px",
                                            background: "#000",
                                            boxShadow: "0 4px 24px rgba(54, 124, 254, 0.10), 0 2px 8px rgba(0,0,0,0.08)",
                                            border: "none",
                                        }}
                                        src={videoBlock.data.videoUrl.replace("watch?v=", "embed/")}
                                        title={videoBlock.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {/* Description Block with all non-video data, sorted by displayOrder */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    minWidth: 0,
                                    marginBottom: "16px"
                                }}
                            >
                                {contentData.length && contentData
                                    .filter(item => item.dataType !== "youtube_video")
                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                    .map((item) => (
                                        <div key={item.id} style={{ marginBottom: "36px" }}>
                                            {/* Title */}
                                            {item.dataType !== "mcq_set" && (
                                                <div style={{
                                                    fontWeight: 700,
                                                    fontSize: "1.7rem",
                                                    color: "#222",
                                                    marginBottom: "12px"
                                                }}>
                                                    {item.title}
                                                </div>
                                            )}
                                            {/* Description */}
                                            {item.dataType === "notes" && (
                                                <div style={{
                                                    color: "#555",
                                                    fontSize: "1.25rem", // Increased size
                                                    marginBottom: item.data.codeSnippet ? "20px" : "0",
                                                    lineHeight: 1.7
                                                }}>
                                                    {item.data.description}
                                                </div>
                                            )}
                                            {/* Code Snippet */}
                                            {item.data.codeSnippet && (
                                                <div
                                                    style={{
                                                        width: "60%",
                                                        background: "linear-gradient(90deg, #e3edff 0%, #f9f9f9 100%)",
                                                        borderRadius: "18px",
                                                        padding: "0",
                                                        marginTop: "10px",
                                                        marginBottom: "0",
                                                        boxShadow: "0 4px 24px rgba(54, 124, 254, 0.10), 0 2px 8px rgba(0,0,0,0.08)",
                                                        border: "1.5px solid #367cfe33",
                                                        overflow: "hidden",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <div style={{
                                                        background: "linear-gradient(90deg, #367cfe 0%, #6ad7ff 100%)",
                                                        color: "#fff",
                                                        fontWeight: 600,
                                                        fontSize: "1.1rem", // Increased size
                                                        padding: "8px 22px",
                                                        borderTopLeftRadius: "16px",
                                                        borderTopRightRadius: "16px",
                                                        letterSpacing: "1px",
                                                        fontFamily: "Fira Mono, Menlo, Monaco, Consolas, monospace",
                                                    }}>
                                                        code
                                                    </div>
                                                    <pre style={{
                                                        margin: 0,
                                                        padding: "22px 24px",
                                                        background: "transparent",
                                                        fontSize: "1.15rem", // Increased size
                                                        color: "#222",
                                                        fontFamily: "Fira Mono, Menlo, Monaco, Consolas, monospace",
                                                        borderRadius: "0 0 16px 16px",
                                                        border: "none",
                                                        overflowX: "auto",
                                                        lineHeight: 1.7
                                                    }}>
                                                        {item.data.codeSnippet}
                                                    </pre>
                                                </div>
                                            )}
                                            {/* MCQ Set */}
                                            {item.dataType === "mcq_set" && (
                                                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                                    <MCQSet questions={item.data.questions} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Notes Section - Below Description */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "32px",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "20px",
                                    minWidth: 0,
                                    alignSelf: "stretch",
                                    maxWidth: "100%",
                                }}
                            >
                                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px", color: "#333" }}>
                                    Take Notes
                                </h3>
                                <textarea
                                    placeholder="Write your notes here..."
                                    style={{
                                        width: "100%",
                                        minHeight: "180px",
                                        borderRadius: "14px",
                                        border: "1.5px solid #367cfe55",
                                        padding: "18px",
                                        fontFamily: "Montserrat, sans-serif",
                                        fontSize: "1.2rem",
                                        resize: "vertical",
                                        background: "linear-gradient(90deg, #e3edff 0%, #f9f9f9 100%)",
                                        boxShadow: "0 2px 8px rgba(54, 124, 254, 0.08)",
                                        maxHeight: "500px",
                                        color: "#222",
                                        outline: "none",
                                        boxSizing: "border-box", // <-- add this line to prevent overflow
                                    }}
                                />
                                <button
                                    style={{
                                        alignSelf: "flex-end",
                                        padding: "14px 32px",
                                        background: "linear-gradient(90deg, #367cfe 0%, #6ad7ff 100%)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        fontSize: "1.1rem",
                                        fontWeight: "700",
                                        boxShadow: "0 2px 8px rgba(54, 124, 254, 0.3)",
                                        transition: "background 0.3s, box-shadow 0.3s",
                                        letterSpacing: "1px",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "linear-gradient(90deg, #285bb5 0%, #367cfe 100%)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(54, 124, 254, 0.5)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "linear-gradient(90deg, #367cfe 0%, #6ad7ff 100%)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(54, 124, 254, 0.3)";
                                    }}
                                    onClick={() => alert("Notes submitted ✅")}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quiz Popup */}
                {showQuiz && (
                    <QuizPopup
                        onClose={() => setShowQuiz(false)}
                        onSubmit={handleQuizSubmit}
                        quizQuestions={quizQuestions}
                    />
                )}

                {/* Toast Notification */}
                {showToast && (
                    <ToastNotification
                        message="Quiz submitted successfully!"
                        isVisible={showToast}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CourseDetailPage;
