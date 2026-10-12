import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaChevronRight, FaQuestionCircle, FaTimes } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import "./QuizPage.css";
import "./QuizQuestionCards.css";

const API_BASE = import.meta.env.VITE_BASE_URL || "";
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY HARD"];

const QuizPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedSubtopicKey, setSelectedSubtopicKey] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || Number(a.id) - Number(b.id)),
    [courses],
  );

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("authToken");
    axios.get(`${API_BASE}/api/v1/quizzes/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        if (isMounted) setCourses(data.courses || []);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.response?.data?.message || "Unable to load courses. Please try again.");
      })
      .finally(() => {
        if (isMounted) setLoadingCourses(false);
      });
    return () => { isMounted = false; };
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === selectedCourseId),
    [courses, selectedCourseId],
  );
  const topics = useMemo(
    () => (selectedCourse?.topics || []).filter((topic) => topic.isActive !== false),
    [selectedCourse],
  );
  const availableSubtopics = useMemo(() => {
    if (!selectedTopicId) return [];
    return topics.find((topic) => String(topic.id) === selectedTopicId)?.subtopics || [];
  }, [selectedTopicId, topics]);
  const subtopicTitles = useMemo(
    () => new Map((selectedCourse?.topics || []).flatMap((topic) =>
      (topic.subtopics || []).map((subtopic) => [subtopic.subtopicKey, subtopic.title]))),
    [selectedCourse],
  );

  const resetQuiz = () => {
    setQuestions([]);
    setAnswers({});
    setResults(null);
  };

  const handleCourseChange = (event) => {
    setSelectedCourseId(event.target.value);
    setSelectedTopicId("");
    setSelectedSubtopicKey("");
    resetQuiz();
    setError("");
  };

  const handleTopicChange = (event) => {
    setSelectedTopicId(event.target.value);
    setSelectedSubtopicKey("");
    resetQuiz();
    setError("");
  };

  const handleSubtopicChange = (event) => {
    setSelectedSubtopicKey(event.target.value);
    resetQuiz();
    setError("");
  };

  const getScope = () => ({
    courseId: Number(selectedCourseId),
    ...(selectedTopicId ? { topicId: Number(selectedTopicId) } : {}),
    ...(selectedSubtopicKey ? { subtopicKey: selectedSubtopicKey } : {}),
    ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
  });

  const loadQuiz = async (event) => {
    event.preventDefault();
    setError("");
    setLoadingQuiz(true);
    setResults(null);
    setAnswers({});
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(`${API_BASE}/api/v1/quizzes/start`, {
        ...getScope()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setQuestions(data.questions || []);
      if (!data.questions?.length) setError("No active MCQ questions are available for this selection yet.");
    } catch (requestError) {
      setQuestions([]);
      setError(requestError.response?.data?.message || "Unable to load quiz questions. Please try again.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const toggleOption = (questionId, optionId) => {
    setAnswers((current) => {
      const selected = current[questionId] || [];
      return {
        ...current,
        [questionId]: selected[0] === optionId ? [] : [optionId],
      };
    });
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!questions.length) return;
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        ...getScope(),
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedOptions: answers[question.id] || [],
        })),
      };
      const { data } = await axios.post(`${API_BASE}/api/v1/quizzes/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit your quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <DashboardLayout
      userName="Learner"
      onLogout={logout}
      contentClassName="quiz-page-scroll"
      overlays={results && (
        <div className="quiz-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResults(null); }}>
          <section className="quiz-results-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-results-title">
            <button className="quiz-modal-close" type="button" onClick={() => setResults(null)} aria-label="Close results"><FaTimes /></button>
            <div className={`quiz-result-mark ${results.score.percentage >= 70 ? "passed" : "needs-practice"}`}>
              {results.score.percentage >= 70 ? <FaCheckCircle /> : <FaQuestionCircle />}
            </div>
            <span className="quiz-eyebrow">QUIZ COMPLETE</span>
            <h2 id="quiz-results-title">{results.score.percentage >= 70 ? "Great work!" : "Keep practicing"}</h2>
            <p className="quiz-result-score">{results.score.correctCount}<span> correct answers</span></p>
            <div className="quiz-result-stats">
              <div><strong>{results.score.percentage}%</strong><span>Score</span></div>
              <div><strong>{results.score.questionCount}</strong><span>Questions</span></div>
            </div>

            {results.incorrectQuestions.length > 0 ? (
              <div className="quiz-review-list">
                <h3>Review missed questions</h3>
                {results.incorrectQuestions.map((item, index) => (
                  <article className="quiz-review-item" key={item.questionId}>
                    <span className="quiz-review-number">MISSED QUESTION {index + 1}</span>
                    <h4>{item.question}</h4>
                    <p><strong>Correct answer:</strong> {item.correctAnswers.join("; ") || "No correct option was configured."}</p>
                    {item.selectedAnswers.length > 0 && <p><strong>Your answer:</strong> {item.selectedAnswers.join("; ")}</p>}
                    <p className="quiz-explanation"><strong>Why:</strong> {item.explanation}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="quiz-perfect-score"><FaCheckCircle /> You answered every question correctly. Excellent work!</div>
            )}
            <button className="quiz-primary-button quiz-modal-done" type="button" onClick={() => window.location.reload()}>Back to quiz</button>
          </section>
        </div>
      )}
    >

          <section className="quiz-builder-card">
            <div className="quiz-section-heading">
              <div className="quiz-section-icon"><FaQuestionCircle /></div>
              <div><h2>Build your quiz</h2><p>Pick a course and optionally narrow it down by topic or subtopic.</p></div>
            </div>
            <form className="quiz-filter-form" onSubmit={loadQuiz}>
              <label className="quiz-field">
                <span>Course</span>
                <select value={selectedCourseId} onChange={handleCourseChange} disabled={loadingCourses} required>
                  <option value="">{loadingCourses ? "Loading courses…" : courses.length ? "Select a course" : "No enrolled courses available"}</option>
                  {sortedCourses.map((course) => <option value={course.id} key={course.id}>{course.courseName}</option>)}
                </select>
              </label>
              <label className="quiz-field">
                <span>Topic</span>
                <select value={selectedTopicId} onChange={handleTopicChange} disabled={!selectedCourseId}>
                  <option value="">All topics</option>
                  {topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}
                </select>
              </label>
              <label className="quiz-field">
                <span>Subtopic</span>
                <select value={selectedSubtopicKey} onChange={handleSubtopicChange} disabled={!selectedTopicId}>
                  <option value="">All subtopics</option>
                  {availableSubtopics.filter((subtopic) => subtopic.isActive !== false).map((subtopic) => (
                    <option value={subtopic.subtopicKey} key={subtopic.subtopicKey}>{subtopic.title}</option>
                  ))}
                </select>
              </label>
              <label className="quiz-field">
                <span>Difficulty</span>
                <select
                  value={selectedDifficulty}
                  onChange={(event) => {
                    setSelectedDifficulty(event.target.value);
                    resetQuiz();
                    setError("");
                  }}
                  disabled={!selectedCourseId}
                >
                  <option value="">All difficulties</option>
                  {DIFFICULTIES.map((difficulty) => (
                    <option value={difficulty} key={difficulty}>
                      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <button className="quiz-primary-button quiz-load-button" type="submit" disabled={!selectedCourseId || loadingCourses || loadingQuiz}>
                {loadingQuiz ? "Loading quiz…" : <>Start quiz <FaChevronRight aria-hidden="true" /></>}
              </button>
            </form>
          </section>

          {error && <div className="quiz-error" role="alert"><FaTimes aria-hidden="true" />{error}</div>}

          {questions.length > 0 && (
            <form className="quiz-question-form" onSubmit={submitQuiz}>
              <div className="quiz-question-heading">
                <div><h2>{selectedCourse?.courseName}</h2></div>
                <span className="quiz-question-count">{questions.length} {questions.length === 1 ? "question" : "questions"}</span>
              </div>
              <p className="quiz-selection-hint">Choose one answer for each question.</p>
              <div className="quiz-question-list">
                {questions.map((question, index) => (
                  <article className="quiz-question-card" key={question.id}>
                    <div className="quiz-question-meta">
                      <span>QUESTION {String(index + 1).padStart(2, "0")}</span>
                      <span>{question.difficulty}</span>
                      <span>Subtopic: {subtopicTitles.get(question.subtopicKey) || question.subtopicKey}</span>
                    </div>
                    <h3>{question.question}</h3>
                    <fieldset className="quiz-options">
                      <legend className="quiz-visually-hidden">Answer options for question {index + 1}</legend>
                      {(question.content?.options || []).map((option) => {
                        const checked = (answers[question.id] || []).includes(option.id);
                        return (
                          <label className={`quiz-option ${checked ? "selected" : ""}`} key={option.id}>
                            <input type="radio" name={`question-${question.id}`} checked={checked} onChange={() => toggleOption(question.id, option.id)} />
                            <span className="quiz-option-letter">{option.id}</span>
                            <span>{option.text}</span>
                          </label>
                        );
                      })}
                    </fieldset>
                  </article>
                ))}
              </div>
              <div className="quiz-submit-row">
                <span>{Object.values(answers).filter((selected) => selected.length > 0).length} of {questions.length} answered</span>
                <button className="quiz-primary-button" type="submit" disabled={submitting}>
                  {submitting ? "Checking answers…" : "Submit quiz"} <FaCheckCircle aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
    </DashboardLayout>
  );
};

export default QuizPage;
