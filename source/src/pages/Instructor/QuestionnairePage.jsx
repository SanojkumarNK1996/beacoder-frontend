import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaSearch, FaClipboardList, FaUsers, FaSave, FaPlus, FaChartBar, FaEye, FaRedoAlt } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import { allowQuestionnaireRetake, assignQuestionnaire, createQuestionnaire, fetchQuestionnaires, fetchQuestionnaireResults, fetchStudents, previewQuestionnaire, updateQuestionnaire } from "../../api/Questionnaires";
import "./QuestionnairePage.css";

const API = `${import.meta.env.VITE_BASE_URL || ""}/api/v1`;
const tokenConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
const difficultyLabels = { EASY: "Easy", MEDIUM: "Medium", HARD: "Tough", "VERY HARD": "Tough" };
const difficultyOptions = ["ALL", "EASY", "MEDIUM", "TOUGH"];
const difficultyLabel = (difficulty) => difficultyLabels[difficulty] || difficulty || "Unknown";

function QuestionDetails({ question }) {
  const options = question.content?.options || [];
  const correctOptions = new Set(question.answer?.correct_options || []);
  const explanation = question.explanation || question.content?.hint || question.hint;
  const correctAnswer = options.filter((option) => correctOptions.has(option.id)).map((option) => `${option.id}. ${option.text}`).join("; ");

  return (
    <div className="questionnaire-question-details">
      <div className="questionnaire-question-detail-body">
        <ol className="questionnaire-options">
          {options.map((option) => (
            <li className={correctOptions.has(option.id) ? "questionnaire-correct-option" : ""} key={option.id}>
              <span className="questionnaire-option-content"><b>{option.id}.</b><span>{option.text}</span></span>
              {correctOptions.has(option.id) && <span className="questionnaire-option-check" aria-label="Correct answer">✓</span>}
            </li>
          ))}
        </ol>
        <p className="questionnaire-answer-note"><span aria-hidden="true">✓</span><strong>Correct answer:</strong> {correctAnswer || "Not configured"}</p>
        <p className="questionnaire-explanation-note"><span aria-hidden="true">✦</span><span><strong>Explanation</strong><br />{explanation || "No explanation or hint provided."}</span></p>
      </div>
    </div>
  );
}

function QuestionMetadata({ metadata }) {
  return (
    <div className="questionnaire-question-metadata" aria-label={`Course: ${metadata.course}; Topic: ${metadata.topic}; Subtopic: ${metadata.subtopic}; Difficulty: ${metadata.difficulty}`}>
      <span className="questionnaire-curriculum-path">
        <span className="questionnaire-meta-chip course" title={`Course: ${metadata.course}`}><span aria-hidden="true">▣</span>{metadata.course}</span>
        <span className="questionnaire-meta-chip topic" title={`Topic: ${metadata.topic}`}><span aria-hidden="true">▤</span>{metadata.topic}</span>
        <span className="questionnaire-meta-chip subtopic" title={`Subtopic: ${metadata.subtopic}`}><span aria-hidden="true">⌘</span>{metadata.subtopic}</span>
      </span>
      <span className={`questionnaire-difficulty-badge ${metadata.difficulty.toLowerCase()}`}>{metadata.difficulty}</span>
      {metadata.timeLimitSeconds && <span className="questionnaire-time-badge">{metadata.timeLimitSeconds}s</span>}
    </div>
  );
}

export default function QuestionnairePage() {
  const [userName, setUserName] = useState("Mentor");
  const [courses, setCourses] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [testName, setTestName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [selectedSubtopicKeys, setSelectedSubtopicKeys] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionListTab, setQuestionListTab] = useState("available");
  const [studentSearch, setStudentSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [resultsStudentSearch, setResultsStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [resultsSearched, setResultsSearched] = useState(false);
  const [retakeLoadingId, setRetakeLoadingId] = useState(null);
  const tabIds = ["create", "manage", "results"];

  const load = async () => {
    const [courseResponse, testResponse] = await Promise.all([
      axios.get(`${API}/quizzes/courses`, tokenConfig()), fetchQuestionnaires(),
    ]);
    setCourses(courseResponse.data.courses || []);
    setTests(testResponse || []);
  };
  useEffect(() => {
    fetchUserProfile(localStorage.getItem("authToken")).then((profile) => setUserName(profile.userName || "Mentor")).catch(() => {});
    load().catch((requestError) => setError(requestError.response?.data?.message || "Unable to load questionnaire data."));
  }, []);

  useEffect(() => {
    if (!selectedResult) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedResult(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedResult]);

  const course = courses.find((item) => String(item.id) === courseId);
  const topics = course?.topics || [];
  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || Number(a.id) - Number(b.id)),
    [courses],
  );
  const curriculumBySubtopic = useMemo(() => {
    const metadata = new Map();
    courses.forEach((courseItem) => courseItem.topics?.forEach((topicItem) => topicItem.subtopics?.forEach((subtopicItem) => {
      metadata.set(subtopicItem.subtopicKey, { course: courseItem.courseName, topic: topicItem.title, subtopic: subtopicItem.title });
    })));
    return metadata;
  }, [courses]);
  const questionMetadata = (question) => {
    const metadata = curriculumBySubtopic.get(question.subtopicKey);
    return {
      course: metadata?.course || "Course unavailable",
      topic: metadata?.topic || "Topic unavailable",
      subtopic: metadata?.subtopic || question.subtopicKey || "Subtopic unavailable",
      difficulty: difficultyLabel(question.difficulty),
      timeLimitSeconds: question.timeLimitSeconds,
    };
  };
  const filteredQuestions = useMemo(() => questions
    .filter((question) => difficultyFilter === "ALL" || difficultyLabel(question.difficulty).toUpperCase() === difficultyFilter),
  [questions, difficultyFilter]);
  const availableQuestions = useMemo(
    () => filteredQuestions.filter((question) => !selectedKeys.includes(question.questionKey)),
    [filteredQuestions, selectedKeys],
  );

  useEffect(() => {
    if (!selectedSubtopicKeys.length) {
      setQuestions([]);
      setQuestionsLoading(false);
      return undefined;
    }
    let active = true;
    setQuestionsLoading(true);
    setError("");
    Promise.all(selectedSubtopicKeys.map((key) =>
      axios.get(`${API}/quizzes/subtopic/${encodeURIComponent(key)}/authoring`, tokenConfig()),
    )).then((responses) => {
      if (!active) return;
      const uniqueQuestions = new Map();
      responses.forEach(({ data }) => (data.questions || []).forEach((question) => {
        uniqueQuestions.set(question.questionKey, question);
      }));
      setQuestions([...uniqueQuestions.values()]);
    }).catch((requestError) => {
      if (active) {
        setQuestions([]);
        setError(requestError.response?.data?.message || "Could not load questions for the selected subtopics.");
      }
    }).finally(() => {
      if (active) setQuestionsLoading(false);
    });
    return () => { active = false; };
  }, [selectedSubtopicKeys]);

  const toggleSubtopic = (key) => {
    setSelectedSubtopicKeys((keys) => keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]);
  };
  const toggleTopic = (topicItem) => {
    const keys = (topicItem.subtopics || []).map((item) => item.subtopicKey);
    if (!keys.length) return;
    const allSelected = keys.every((key) => selectedSubtopicKeys.includes(key));
    setSelectedSubtopicKeys((current) => allSelected
      ? current.filter((key) => !keys.includes(key))
      : [...new Set([...current, ...keys])]);
  };

  const toggleQuestion = (question) => {
    setSelectedKeys((keys) => keys.includes(question.questionKey) ? keys.filter((item) => item !== question.questionKey) : [...keys, question.questionKey]);
    setSelectedQuestions((items) => items.some((item) => item.questionKey === question.questionKey)
      ? items.filter((item) => item.questionKey !== question.questionKey)
      : [...items, question]);
  };
  const removeSelectedQuestion = (key) => {
    setSelectedKeys((keys) => keys.filter((item) => item !== key));
    setSelectedQuestions((items) => items.filter((item) => item.questionKey !== key));
  };
  const resetForm = () => { setEditingId(null); setTestName(""); setDescription(""); setSelectedKeys([]); setSelectedQuestions([]); setCourseId(""); setSelectedSubtopicKeys([]); setQuestions([]); setDifficultyFilter("ALL"); };

  const save = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    try {
      const payload = { testName, description, questionKeys: selectedKeys };
      if (editingId) await updateQuestionnaire(editingId, payload); else await createQuestionnaire(payload);
      await load(); resetForm(); setNotice("Questionnaire saved."); setActiveTab("manage");
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save questionnaire."); }
  };

  const editTest = async (test) => {
    try {
      const preview = await previewQuestionnaire(test.id);
      setEditingId(test.id); setTestName(test.testName); setDescription(test.description || ""); setSelectedKeys(test.questionKeys || []);
      setCourseId(""); setSelectedSubtopicKeys([]); setQuestions(preview.questions || []);
      setSelectedQuestions(preview.questions || []);
      setActiveTab("create");
      setNotice("Edit the selected questions below, or browse a curriculum subtopic to add more.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to open questionnaire."); }
  };

  const searchForStudents = async (event) => {
    event.preventDefault();
    try { setStudents(await fetchStudents(studentSearch)); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to search students."); }
  };
  const assign = async (test) => {
    if (!selectedStudents.length) { setError("Select at least one student before assigning."); return; }
    try { await assignQuestionnaire(test.id, selectedStudents); setNotice(`Assigned “${test.testName}” to ${selectedStudents.length} student(s).`); setSelectedStudents([]); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to assign questionnaire."); }
  };
  const searchResults = async (event) => {
    event.preventDefault();
    setError("");
    try { setResults(await fetchQuestionnaireResults(testSearch, resultsStudentSearch)); setResultsSearched(true); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to find results."); }
  };

  const allowRetake = async (result) => {
    const studentName = result.user?.name || "this student";
    const testName = result.test?.testName || "this questionnaire";
    if (!window.confirm(`Allow ${studentName} to take “${testName}” again? This clears their current score from the results table. Their previous completion remains in their progress timeline.`)) return;
    setRetakeLoadingId(result.id);
    setError("");
    setNotice("");
    try {
      await allowQuestionnaireRetake(result.test?.id, result.user?.id);
      setNotice(`Retake allowed for ${studentName} on “${testName}”.`);
      setResults(await fetchQuestionnaireResults(testSearch, resultsStudentSearch));
      setResultsSearched(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to allow this student to retake the questionnaire.");
    } finally {
      setRetakeLoadingId(null);
    }
  };

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setNotice("");
    setError("");
  };

  const handleTabKeyDown = (event) => {
    const currentIndex = tabIds.indexOf(activeTab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabIds.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabIds.length - 1;
    else return;
    event.preventDefault();
    switchTab(tabIds[nextIndex]);
    document.getElementById(`questionnaire-tab-${tabIds[nextIndex]}`)?.focus();
  };

  const allSelected = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  return (
    <DashboardLayout
      userName={userName}
      onLogout={() => { localStorage.removeItem("authToken"); localStorage.removeItem("userRole"); window.location.assign("/login"); }}
      contentClassName="questionnaire-scroll"
      overlays={selectedResult && (() => {
        const earned = Number(selectedResult.earnedMarks) || 0;
        const total = Number(selectedResult.totalMarks) || 0;
        const percentage = total > 0 ? Math.min(100, Math.max(0, Math.round((earned / total) * 100))) : 0;
        const courseMarks = Array.isArray(selectedResult.courseMarks) ? selectedResult.courseMarks : [];
        return (
          <div className="questionnaire-result-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedResult(null); }}>
            <section className="questionnaire-result-modal" role="dialog" aria-modal="true" aria-labelledby="questionnaire-result-title">
              <header className="questionnaire-result-modal-header">
                <div><span>STUDENT QUESTIONNAIRE RESULT</span><h2 id="questionnaire-result-title">{selectedResult.test?.testName || "Test result"}</h2><p>{selectedResult.user?.name || "Student"}{selectedResult.user?.email ? ` · ${selectedResult.user.email}` : ""}</p></div>
                <button type="button" className="questionnaire-result-close" aria-label="Close result details" onClick={() => setSelectedResult(null)}>×</button>
              </header>
              <div className="questionnaire-result-score">
                <div><span>Score</span><strong>{earned} <small>/ {total} correct</small></strong></div>
                <strong className="questionnaire-result-percentage">{percentage}%</strong>
                <div className="questionnaire-result-track" role="progressbar" aria-label="Student test score" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}><span style={{ width: `${percentage}%` }} /></div>
              </div>
              {courseMarks.length > 0 ? <div className="questionnaire-result-breakdown">
                <div className="questionnaire-result-breakdown-heading"><h3>Performance by course</h3><span>Topic-level breakdown</span></div>
                <div className="questionnaire-result-course-grid">{courseMarks.map((course) => <article className="questionnaire-result-course" key={course.courseName}>
                  <div className="questionnaire-result-course-heading"><strong>{course.courseName}</strong><span>{Number(course.earnedMarks) || 0}<small> / {Number(course.totalMarks) || 0}</small></span></div>
                  {Array.isArray(course.topics) && course.topics.length > 0 ? <div className="questionnaire-result-topics">{course.topics.map((topic) => <div className="questionnaire-result-topic" key={topic.topicName}><span>{topic.topicName}</span><strong>{Number(topic.earnedMarks) || 0}<small> / {Number(topic.totalMarks) || 0}</small></strong></div>)}</div> : <p className="questionnaire-muted">No topic breakdown available.</p>}
                </article>)}</div>
              </div> : <p className="questionnaire-muted questionnaire-result-no-breakdown">No course or topic breakdown is available for this result.</p>}
            </section>
          </div>
        );
      })()}
    >
          <div className="questionnaire-tabs" role="tablist" aria-label="Questionnaire tasks">
            <button id="questionnaire-tab-create" type="button" role="tab" aria-selected={activeTab === "create"} aria-controls="questionnaire-panel-create" tabIndex={activeTab === "create" ? 0 : -1} className={activeTab === "create" ? "active" : ""} onKeyDown={handleTabKeyDown} onClick={() => switchTab("create")}>
              <FaPlus aria-hidden="true" /><span>Create questionnaire</span>
            </button>
            <button id="questionnaire-tab-manage" type="button" role="tab" aria-selected={activeTab === "manage"} aria-controls="questionnaire-panel-manage" tabIndex={activeTab === "manage" ? 0 : -1} className={activeTab === "manage" ? "active" : ""} onKeyDown={handleTabKeyDown} onClick={() => switchTab("manage")}>
              <FaUsers aria-hidden="true" /><span>View &amp; assign</span><span className="questionnaire-tab-count" aria-label={`${tests.length} questionnaires`}>{tests.length}</span>
            </button>
            <button id="questionnaire-tab-results" type="button" role="tab" aria-selected={activeTab === "results"} aria-controls="questionnaire-panel-results" tabIndex={activeTab === "results" ? 0 : -1} className={activeTab === "results" ? "active" : ""} onKeyDown={handleTabKeyDown} onClick={() => switchTab("results")}>
              <FaChartBar aria-hidden="true" /><span>Student results</span>
            </button>
          </div>
          {notice && <p className="questionnaire-notice" role="status">{notice}</p>}{error && <p className="questionnaire-error" role="alert">{error}</p>}
          <div id="questionnaire-panel-create" role="tabpanel" tabIndex={0} aria-labelledby="questionnaire-tab-create" hidden={activeTab !== "create"}>
          <section className="questionnaire-panel">
            <h2>{editingId ? "Edit questionnaire" : "Create questionnaire"}</h2>
            <form onSubmit={save}>
              <div className="questionnaire-form-grid">
                <label className="questionnaire-label">Test name<input value={testName} onChange={(event) => setTestName(event.target.value)} required maxLength={160} placeholder="e.g. JavaScript fundamentals" /></label>
                <label className="questionnaire-label">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={3} placeholder="Covers arrays, functions, and objects for beginner JavaScript learners." /></label>
              </div>
              <div className="questionnaire-selects">
                <label className="questionnaire-label">Course<select value={courseId} onChange={(event) => { setCourseId(event.target.value); setSelectedSubtopicKeys([]); setQuestions([]); }}><option value="">Choose course to browse questions</option>{sortedCourses.map((item) => <option key={item.id} value={item.id}>{item.courseName}</option>)}</select></label>
              </div>
              {courseId && <fieldset className="questionnaire-topic-picker">
                <legend>Choose topics and subtopics</legend>
                <p>Select a topic to include all its subtopics, or choose individual subtopics. You can select from multiple topics.</p>
                <div className="questionnaire-topic-list">
                  {topics.map((topicItem) => {
                    const topicSubtopics = topicItem.subtopics || [];
                    const selectedCount = topicSubtopics.filter((item) => selectedSubtopicKeys.includes(item.subtopicKey)).length;
                    const allSelected = topicSubtopics.length > 0 && selectedCount === topicSubtopics.length;
                    return <div className="questionnaire-topic-group" key={topicItem.id}>
                      <label className="questionnaire-topic-option">
                        <input type="checkbox" checked={allSelected} disabled={!topicSubtopics.length} onChange={() => toggleTopic(topicItem)} />
                        <strong>{topicItem.title}</strong>
                        <small>{selectedCount ? `${selectedCount} of ${topicSubtopics.length} selected` : `${topicSubtopics.length} subtopics`}</small>
                      </label>
                      {topicSubtopics.length > 0 && <div className="questionnaire-subtopic-options">
                        {topicSubtopics.map((item) => <label key={item.subtopicKey}>
                          <input type="checkbox" checked={selectedSubtopicKeys.includes(item.subtopicKey)} onChange={() => toggleSubtopic(item.subtopicKey)} />
                          <span>{item.title}</span>
                        </label>)}
                      </div>}
                    </div>;
                  })}
                </div>
              </fieldset>}
              <div className="questionnaire-question-tabs" role="tablist" aria-label="Question selection">
                <button id="questionnaire-questions-available-tab" type="button" role="tab" aria-selected={questionListTab === "available"} aria-controls="questionnaire-questions-available-panel" className={questionListTab === "available" ? "active" : ""} onClick={() => setQuestionListTab("available")}>
                  Available questions <span>{availableQuestions.length}</span>
                </button>
                <button id="questionnaire-questions-selected-tab" type="button" role="tab" aria-selected={questionListTab === "selected"} aria-controls="questionnaire-questions-selected-panel" className={questionListTab === "selected" ? "active" : ""} onClick={() => setQuestionListTab("selected")}>
                  Selected questions <span>{selectedKeys.length}</span>
                </button>
              </div>
              <div id="questionnaire-questions-available-panel" role="tabpanel" aria-labelledby="questionnaire-questions-available-tab" hidden={questionListTab !== "available"}>
                <div className="questionnaire-question-list">
                  <div className="questionnaire-list-heading"><h3>Choose questions to add</h3><label className="questionnaire-label questionnaire-filter">Difficulty<select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>{difficultyOptions.map((option) => <option key={option} value={option}>{option === "ALL" ? "All" : option[0] + option.slice(1).toLowerCase()}</option>)}</select></label></div>
                  {questionsLoading ? <p className="questionnaire-muted" role="status">Loading questions from selected subtopics…</p>
                    : availableQuestions.length ? availableQuestions.map((question) => <div className={`questionnaire-question questionnaire-question-card ${question.isActive === false ? "questionnaire-question-disabled" : ""}`} key={question.questionKey}><label className="questionnaire-question-select"><input type="checkbox" disabled={question.isActive === false} checked={allSelected.has(question.questionKey)} onChange={() => toggleQuestion(question)} /><div className="questionnaire-question-copy"><strong>{question.question}</strong><QuestionMetadata metadata={questionMetadata(question)} /></div></label><QuestionDetails question={question} /></div>)
                      : <p className="questionnaire-muted">{!courseId || selectedSubtopicKeys.length === 0 ? "Choose a course and one or more subtopics above to browse questions." : questions.length ? "All matching questions are selected." : "No questions found for the selected subtopics and difficulty."}</p>}
                </div>
              </div>
              <div id="questionnaire-questions-selected-panel" role="tabpanel" aria-labelledby="questionnaire-questions-selected-tab" hidden={questionListTab !== "selected"}>
                <div className="questionnaire-question-list">
                  {selectedQuestions.length ? selectedQuestions.map((question) => <div className="questionnaire-question questionnaire-question-card" key={question.questionKey}><div className="questionnaire-question-heading"><div className="questionnaire-question-copy"><strong>{question.question}</strong><QuestionMetadata metadata={questionMetadata(question)} /></div><button className="questionnaire-secondary" type="button" onClick={() => removeSelectedQuestion(question.questionKey)}>Remove</button></div><QuestionDetails question={question} /></div>)
                    : <p className="questionnaire-muted">No questions selected yet. Browse available questions and select the ones to include.</p>}
                </div>
              </div>
              <div className="questionnaire-actions"><span>{selectedKeys.length} questions selected</span><button className="questionnaire-primary" type="submit" disabled={!selectedKeys.length}><FaSave />{editingId ? "Save changes" : "Save questionnaire"}</button>{editingId && <button className="questionnaire-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div>
            </form>
          </section>
          </div>
          <div id="questionnaire-panel-manage" role="tabpanel" tabIndex={0} aria-labelledby="questionnaire-tab-manage" hidden={activeTab !== "manage"}>
          <section className="questionnaire-panel"><h2>Assign to students</h2><form className="questionnaire-search" onSubmit={searchForStudents}><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search students by name or email" /><button className="questionnaire-primary"><FaSearch />Search</button></form>{students.length > 0 && <><p className="questionnaire-muted">Select learners, then choose “Assign selected” on a questionnaire.</p><div className="questionnaire-student-list">{students.map((student) => <label key={student.id}><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => setSelectedStudents((ids) => ids.includes(student.id) ? ids.filter((id) => id !== student.id) : [...ids, student.id])} />{student.name} <small>{student.email}</small></label>)}</div></>}</section>
          <section className="questionnaire-panel"><h2><FaClipboardList /> Saved questionnaires</h2>{tests.length ? <div className="questionnaire-table-wrap"><table className="questionnaire-table"><thead><tr><th>Name</th><th>Description</th><th>Questions</th><th>Actions</th></tr></thead><tbody>{tests.map((test) => <tr key={test.id}><td>{test.testName}</td><td>{test.description || "No description provided."}</td><td>{test.questionCount}</td><td className="questionnaire-row-actions"><button type="button" onClick={() => editTest(test)}>Edit</button><button type="button" disabled={!selectedStudents.length} onClick={() => assign(test)}><FaUsers /> Assign selected</button></td></tr>)}</tbody></table></div> : <div className="questionnaire-empty"><FaClipboardList aria-hidden="true" /><h3>No questionnaires yet</h3><p>Create and save a questionnaire first. It will appear here so you can edit it or assign it to learners.</p><button type="button" className="questionnaire-primary" onClick={() => setActiveTab("create")}><FaPlus />Create questionnaire</button></div>}</section>
          </div>
          <div id="questionnaire-panel-results" role="tabpanel" tabIndex={0} aria-labelledby="questionnaire-tab-results" hidden={activeTab !== "results"}>
          <section className="questionnaire-panel"><h2><FaChartBar /> Student results</h2><p className="questionnaire-muted">Search by questionnaire or student name to review learner completion, scores, and course/topic breakdowns.</p><form className="questionnaire-search questionnaire-results-search" onSubmit={searchResults}><input value={testSearch} onChange={(event) => setTestSearch(event.target.value)} placeholder="Questionnaire name (optional)" aria-label="Filter results by questionnaire name" /><input value={resultsStudentSearch} onChange={(event) => setResultsStudentSearch(event.target.value)} placeholder="Student name or email (optional)" aria-label="Filter results by student name or email" /><button className="questionnaire-primary"><FaSearch />Search results</button></form>{results.length > 0 ? <div className="questionnaire-table-wrap"><table className="questionnaire-table"><thead><tr><th>Student</th><th>Test</th><th>Status</th><th>Score</th><th>Result details</th></tr></thead><tbody>{results.map((result) => <tr key={result.id}><td>{result.user?.name || "Student"}<small>{result.user?.email}</small></td><td>{result.test?.testName || "Questionnaire"}</td><td><span className={`questionnaire-status ${String(result.status || "").toLowerCase()}`}>{result.status}</span></td><td>{result.status === "COMPLETED" ? `${Number(result.earnedMarks) || 0} / ${Number(result.totalMarks) || 0} correct` : "—"}</td><td><div className="questionnaire-result-actions"><button className="questionnaire-result-view-button" type="button" disabled={result.status !== "COMPLETED"} onClick={() => setSelectedResult(result)}><FaEye aria-hidden="true" />View result</button>{result.status === "COMPLETED" && <button className="questionnaire-retake-button" type="button" disabled={retakeLoadingId === result.id} onClick={() => allowRetake(result)}><FaRedoAlt aria-hidden="true" />{retakeLoadingId === result.id ? "Allowing…" : "Allow retake"}</button>}</div></td></tr>)}</tbody></table></div> : <div className="questionnaire-empty"><FaChartBar aria-hidden="true" /><h3>{resultsSearched ? "No results found" : "Results at a glance"}</h3><p>{resultsSearched ? "Try another questionnaire or student name, or check back after learners have submitted their tests." : "Search by questionnaire or student name to see learner status, scores, and topic-level performance."}</p></div>}</section>
          </div>
    </DashboardLayout>
  );
}
