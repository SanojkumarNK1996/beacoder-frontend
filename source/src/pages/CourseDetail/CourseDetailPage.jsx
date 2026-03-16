import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { CourseHeaderCard } from "../../components/CourseHeaderCard";
import MainPageLoader from "../../components/MainPageLoader";
import { FaTasks, FaChevronRight, FaChevronDown, FaRegFileAlt } from "react-icons/fa";
import QuizPopup from "../../components/QuizPopup";
import ToastNotification from "../../components/ToastNotification";
import {
  fetchCourseHeader,
  fetchCourseTopics,
  fetchSubtopicsAndQuiz
} from "../../api/CourseDetailPage";
import "./CourseDetailPage.css";
const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(1);
  const [openIndex, setOpenIndex] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [courseHeader, setCourseHeader] = useState({});
  const [topicData, setTopicData] = useState([]);
  const [currentSubtopics, setCurrentSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtopicLoading, setSubtopicLoading] = useState(false);
  const [selectedQuizPopup, setSelectedQuizPopup] = useState(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(location.state?.selectedSubtopicId || null);
  const [hasRestoredState, setHasRestoredState] = useState(false);

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
      });
  }, [id]);

  // Restore the state after data is loaded
  useEffect(() => {
    if (!loading && topicData.length > 0 && !hasRestoredState && location.state?.expandedTopicId) {
      const topicIndex = topicData.findIndex(t => String(t.id) === String(location.state.expandedTopicId));
      
      if (topicIndex !== -1) {
        setOpenIndex(topicIndex);
        setSelectedSubtopicId(location.state.selectedSubtopicId);
        setHasRestoredState(true);
        
        const section = topicData[topicIndex];
        setSubtopicLoading(true);
        const token = localStorage.getItem("authToken");
        fetchSubtopicsAndQuiz(id, section, token)
          .then(({ subtopicsData, quizData }) => {
            if (quizData?.length > 0) {
              const topicObj = subtopicsData.find(t => t.topic === section.title);
              if (topicObj) topicObj.quiz = quizData;
              else subtopicsData.push({ topic: section.title, subtopics: [], quiz: quizData });
            }
            setCurrentSubtopics(subtopicsData);
            setSubtopicLoading(false);
          })
          .catch(err => {
            setCurrentSubtopics([]);
            setSubtopicLoading(false);
          });
      }
    }
  }, [loading, topicData, location.state?.expandedTopicId, hasRestoredState, id]);

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
    navigate(`/course/${courseId}/topic/${topicId}/sub/${subtopicId}`, {
      state: { subtopicTitle }
    });
  };

  if (loading || subtopicLoading) {
    return (
      <MainPageLoader
        variant="headerSidebarSkeleton"
        text={
          loading
            ? "Loading course details..."
            : "Loading subtopics..."
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
        <CourseHeaderCard course={courseHeader} />

        <div
          className="course-split-layout"
          style={{
            height: "calc(100vh - 300px)",
            overflowY: openIndex !== null ? "auto" : "hidden",
          }}
        >
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
                          className={`syllabus-item ${openIndex === idx ? "active" : ""
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
                                      className={`subtopic-item ${selectedSubtopicId === sub.id ? "selected" : ""}`}
                                      onClick={e => {
                                        e.stopPropagation();
                                        setSelectedSubtopicId(sub.id);
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
        </div>

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