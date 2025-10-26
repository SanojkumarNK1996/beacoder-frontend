import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { CourseHeaderCard } from "../../components/CourseHeaderCard";
import MainPageLoader from "../../components/MainPageLoader";
import { FaTasks, FaChevronRight, FaChevronDown, FaChevronLeft, FaRegFileAlt } from "react-icons/fa";
import QuizPopup from "../../components/QuizPopup";
import ToastNotification from "../../components/ToastNotification";
import MCQSet from "../../components/MCQSet";
import {
  fetchCourseHeader,
  fetchCourseTopics,
  fetchSubtopicsAndQuiz,
  fetchSubtopicContents
} from "../../api/CourseDetailPage";
import "./CourseDetailPage.css";

const quizQuestions = [
  { question: "What is the correct way to declare a variable in Java?", options: ["int num = 5;", "num int = 5;", "integer num = 5;", "var int num = 5;"], answer: "int num = 5;" },
  { question: "Which of these is NOT a primitive data type in Java?", options: ["int", "boolean", "String", "double"], answer: "String" },
  { question: "What is the output of: System.out.println(2 + \"2\");", options: ["4", "22", "2 2", "Error"], answer: "22" },
  { question: "Which keyword is used to inherit a class in Java?", options: ["this", "super", "extends", "implements"], answer: "extends" },
  { question: "Which loop is guaranteed to execute at least once?", options: ["for", "while", "do-while", "foreach"], answer: "do-while" },
];

const CourseDetailPage = () => {
  const { id } = useParams();
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(1);
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [courseHeader, setCourseHeader] = useState({});
  const [topicData, setTopicData] = useState([]);
  const [currentSubtopics, setCurrentSubtopics] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtopicLoading, setSubtopicLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedQuizPopup, setSelectedQuizPopup] = useState(null);

  const videoBlock = contentData.find(item => item.dataType === "youtube_video");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    Promise.all([fetchCourseHeader(id, token), fetchCourseTopics(id, token)])
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

  const handleQuizSubmit = () => {
    setShowQuiz(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleTopicDropdown = async (section, idx) => {
    if (openIndex === idx) {
      setOpenIndex(null);
      setCurrentSubtopics([]);
      return;
    }
    setOpenIndex(idx);
    setSubtopicLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const { subtopicsData, quizData } = await fetchSubtopicsAndQuiz(id, section, token);
      if (quizData?.length > 0) {
        const topicObj = subtopicsData.find(t => t.topic === section.title);
        if (topicObj) topicObj.quiz = quizData;
        else subtopicsData.push({ topic: section.title, subtopics: [], quiz: quizData });
      }
      setCurrentSubtopics(subtopicsData);
      setSubtopicLoading(false);
    } catch (err) {
      setCurrentSubtopics([]);
      setSubtopicLoading(false);
      console.error(err);
    }
  };

  const handleSubtopicClick = (courseId, topicId, subtopicId, subtopicTitle) => {
    setContentLoading(true);
    const token = localStorage.getItem("authToken");
    fetchSubtopicContents(courseId, topicId, subtopicId, token)
      .then(res => {
        setContentData(res.data.data);
        setSelectedSubtopic(
          res.data.data && res.data.data.length > 0
            ? subtopicTitle
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

  if (loading || subtopicLoading || contentLoading) {
    return (
      <MainPageLoader
        variant="headerSidebarSkeleton"
        text={
          loading
            ? "Loading course details..."
            : subtopicLoading
            ? "Loading subtopics..."
            : "Loading content..."
        }
      />
    );
  }

  return (
    <div className="course-detail-container">
      <Sidebar
        active={active}
        hovered={hovered}
        setActive={setActive}
        setHovered={setHovered}
      />
      <div className="course-main">
        {!selectedSubtopic && <CourseHeaderCard course={courseHeader} />}

        <div
          className="course-split-layout"
          style={{
            height: selectedSubtopic
              ? "calc(100vh - 140px)"
              : "calc(100vh - 300px)",
            overflowY:
              openIndex !== null && !selectedSubtopic ? "auto" : "hidden",
          }}
        >
          {!selectedSubtopic && (
            <div className="syllabus-container">
              <h2 className="syllabus-title">Syllabus</h2>
              <ul className="syllabus-list">
                {topicData.length &&
                  topicData
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((section, idx) => {
                      const isQuiz = section.title
                        .toLowerCase()
                        .includes("quiz");
                      return (
                        <React.Fragment key={section.title}>
                          <li
                            className={`syllabus-item ${
                              openIndex === idx ? "active" : ""
                            }`}
                            onClick={() =>
                              isQuiz
                                ? setShowQuiz(true)
                                : handleTopicDropdown(section, idx)
                            }
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              {isQuiz && (
                                <FaRegFileAlt
                                  style={{
                                    color: "#ffb74d",
                                    fontSize: "22px",
                                  }}
                                />
                              )}
                              <span className="syllabus-item-title">{section.title}</span>
                            </span>
                            {isQuiz ? (
                              <FaTasks
                                style={{
                                  color: "#367cfe",
                                  fontSize: "22px",
                                  cursor: "pointer",
                                }}
                              />
                            ) : openIndex === idx ? (
                              <FaChevronDown
                                style={{ color: "#222", fontSize: "22px" }}
                              />
                            ) : (
                              <FaChevronRight
                                style={{ color: "#222", fontSize: "22px" }}
                              />
                            )}
                          </li>

                          {!isQuiz && openIndex === idx && (
                            <ul className="subtopic-list subtopic-list-margin">
                              {(() => {
                                const topicObj = currentSubtopics.find(
                                  t => t.topic === section.title
                                );
                                if (!topicObj) return null;

                                const subtopics = Array.isArray(
                                  topicObj.subtopics
                                )
                                  ? topicObj.subtopics
                                      .sort(
                                        (a, b) => a.displayOrder - b.displayOrder
                                      )
                                      .map(sub => (
                                        <li
                                          key={`subtopic-${sub.id}`}
                                          className={`subtopic-item ${
                                            selectedSubtopic === sub.title
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={e => {
                                            e.stopPropagation();
                                            handleSubtopicClick(
                                              id,
                                              topicObj.id,
                                              sub.id,
                                              sub.title
                                            );
                                          }}
                                        >
                                          <span className="subtopic-icon">
                                            <FaRegFileAlt />
                                          </span>
                                          <span className="subtopic-title">
                                            {sub.title}
                                          </span>
                                        </li>
                                      ))
                                  : [];

                                const quizzes = Array.isArray(topicObj.quiz)
                                  ? topicObj.quiz
                                      .sort(
                                        (a, b) => a.displayOrder - b.displayOrder
                                      )
                                      .map(quiz => (
                                        <li
                                          key={`quiz-${quiz.id}`}
                                          className="quiz-item"
                                          onClick={e => {
                                            e.stopPropagation();
                                            setSelectedQuizPopup(
                                              quiz.questionData
                                            );
                                          }}
                                        >
                                          <span className="quiz-icon">
                                            <FaTasks />
                                          </span>
                                          <span className="quiz-title">
                                            {quiz.title}
                                          </span>
                                        </li>
                                      ))
                                  : [];

                                return [...subtopics, ...quizzes];
                              })()}
                            </ul>
                          )}
                        </React.Fragment>
                      );
                    })}
              </ul>
            </div>
          )}

          {selectedSubtopic && (
            <div className="right-container">

              <div className="back-button-container">
                <button
                  className="back-button"
                  onClick={() => setSelectedSubtopic(null)}
                >
                  <FaChevronLeft />
                </button>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#222",
                  }}
                >
                  {selectedSubtopic}
                </span>
              </div>

              {videoBlock && (
                <div className="video-player">
                  <iframe
                    src={videoBlock.data.videoUrl.replace(
                      "watch?v=",
                      "embed/"
                    )}
                    title={videoBlock.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="description-block">
                {contentData.length &&
                  contentData
                    .filter(item => item.dataType !== "youtube_video")
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(item => (
                      <div key={item.id} style={{ marginBottom: "36px" }}>
                        {item.dataType !== "mcq_set" && (
                          <div className="description-title">{item.title}</div>
                        )}
                        {item.dataType === "notes" && (
                          // Render rich HTML coming from the API. We assume the API returns
                          // sanitized HTML. If the API cannot guarantee sanitization,
                          // sanitize on the client before injecting.
                          <div
                            className="description-text"
                            dangerouslySetInnerHTML={{ __html: item.data.description }}
                          />
                        )}
                        {item.data.codeSnippet && (
                          <div className="code-block">
                            <div className="code-header">code</div>
                            <pre className="code-body">
                              {item.data.codeSnippet}
                            </pre>
                          </div>
                        )}
                        {item.dataType === "mcq_set" && (
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <MCQSet questions={item.data.questions} />
                          </div>
                        )}
                      </div>
                    ))}
              </div>

              <div className="notes-section">
                <h3>Take Notes</h3>
                <textarea placeholder="Write your notes here..." />
                <button onClick={() => alert("Notes submitted ✅")}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>

        {showQuiz && (
          <QuizPopup
            onClose={() => setShowQuiz(false)}
            onSubmit={handleQuizSubmit}
            quizQuestions={quizQuestions}
          />
        )}
        {showToast && (
          <ToastNotification
            message="Quiz submitted successfully!"
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />
        )}
        {selectedQuizPopup && (
          <QuizPopup
            onClose={() => setSelectedQuizPopup(null)}
            onSubmit={() => setSelectedQuizPopup(null)}
            quizQuestions={selectedQuizPopup}
          />
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
