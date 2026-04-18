import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { CourseHeaderCard } from "../../components/CourseHeaderCard";
import MainPageLoader from "../../components/MainPageLoader";
import { FaTasks, FaChevronRight, FaChevronDown, FaRegFileAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import QuizPopup from "../../components/QuizPopup";
import TopicNotesPopup from "../../components/TopicNotesPopup";
import {
  fetchCourseHeader,
  fetchCourseTopics,
  fetchSubtopicsAndQuiz,
  fetchTopicNotes
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
  const [topicNotes, setTopicNotes] = useState([]);
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [selectedTopicTitle, setSelectedTopicTitle] = useState("");
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

  const handleDownloadNotes = async (event, section) => {
    event.stopPropagation();
    setNotesError("");
    setNotesLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetchTopicNotes(section.id, token);
      if (response.data?.success) {
        setTopicNotes(response.data.data || []);
        setSelectedTopicTitle(section.title);
        setShowNotesPopup(true);
      } else {
        setNotesError("Unable to load topic notes. Please try again.");
      }
    } catch (error) {
      console.error("Failed to fetch topic notes:", error);
      setNotesError("Unable to load topic notes. Please try again later.");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!topicNotes.length) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setTextColor("#1f4ed8");
    doc.setFontSize(20);
    doc.text(`Notes for ${selectedTopicTitle}`, 40, 50);

    let y = 85;
    doc.setFontSize(13);
    doc.setTextColor("#1f2937");

    topicNotes.forEach((note, index) => {
      const heading = `${index + 1}. ${note.subtopic}`;
      doc.setFontSize(14);
      doc.setTextColor("#0f172a");
      doc.text(heading, 40, y);
      y += 20;

      doc.setFontSize(12);
      doc.setTextColor("#334155");
      const noteLines = doc.splitTextToSize(note.notes || "No notes available.", 520);
      doc.text(noteLines, 40, y);
      y += noteLines.length * 16 + 18;

      if (y > 740 && index !== topicNotes.length - 1) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save(`${selectedTopicTitle.replace(/\s+/g, "_")}_notes.pdf`);
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
                          <span className="syllabus-item-left">
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
                          <span className="syllabus-item-right">
                            {!isQuiz && (
                              <button
                                type="button"
                                className="topic-notes-button"
                                onClick={e => handleDownloadNotes(e, section)}
                                disabled={notesLoading}
                                title="View notes"
                              >
                                {notesLoading ? "Loading..." : "Notes"}
                              </button>
                            )}
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
                          </span>
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

        {showNotesPopup && (
          <TopicNotesPopup
            onClose={() => setShowNotesPopup(false)}
            onDownload={handleDownloadPdf}
            topicName={selectedTopicTitle}
            notesData={topicNotes}
            loading={notesLoading}
            error={notesError}
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