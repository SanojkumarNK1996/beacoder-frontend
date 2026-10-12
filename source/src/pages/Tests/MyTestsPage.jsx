import { useEffect, useState } from "react";
import { FaCheckCircle, FaPlay, FaPaperPlane } from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchAssignedTests, startAssignedTest, submitAssignedTest } from "../../api/Questionnaires";
import "./MyTestsPage.css";

export default function MyTestsPage() {
  const [records, setRecords] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => setRecords(await fetchAssignedTests());
  useEffect(() => { load().catch((requestError) => setError(requestError.response?.data?.message || "Unable to load assigned tests.")); }, []);

  const start = async (record) => {
    setBusy(true); setError(""); setResult(null);
    try {
      const data = await startAssignedTest(record.testId);
      setActive({ ...data, testId: record.testId });
      setAnswers({});
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to start this test."); }
    finally { setBusy(false); }
  };

  const toggle = (questionKey, optionId) => setAnswers((current) => {
    const selected = current[questionKey] || [];
    return { ...current, [questionKey]: selected.includes(optionId) ? [] : [optionId] };
  });

  const submit = async (event) => {
    event.preventDefault(); if (!active) return;
    setBusy(true); setError("");
    try {
      const answersPayload = active.questions.map((question) => ({ questionKey: question.questionKey, selectedOptions: answers[question.questionKey] || [] }));
      setResult(await submitAssignedTest(active.testId, answersPayload));
      setActive(null); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to submit this test."); }
    finally { setBusy(false); }
  };

  const logout = () => { localStorage.removeItem("authToken"); localStorage.removeItem("userRole"); window.location.assign("/login"); };
  return (
    <DashboardLayout userName="Student" onLogout={logout} contentClassName="my-tests-content">
          {error && <p className="my-tests-error" role="alert">{error}</p>}
          {result && <section className="my-tests-result" role="status" aria-labelledby="my-tests-result-heading">
            <div className="my-tests-result-header">
              <span className="my-tests-result-icon"><FaCheckCircle aria-hidden="true" /></span>
              <div className="my-tests-result-title"><span>QUESTIONNAIRE RESULT</span><h2 id="my-tests-result-heading">Test completed</h2></div>
              <span className="my-tests-result-status">Completed</span>
            </div>
            <div className="my-tests-result-score">
              <div className="my-tests-result-score-label"><span>Your score</span><strong>{result.earnedMarks} <small>/ {result.totalMarks} correct</small></strong></div>
              <strong className="my-tests-result-percentage">{result.percentage}%</strong>
              <div className="my-tests-result-track" role="progressbar" aria-label="Test score" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(100, Math.max(0, Number(result.percentage) || 0))}>
                <span style={{ width: `${Math.min(100, Math.max(0, Number(result.percentage) || 0))}%` }} />
              </div>
            </div>
            {result.courseMarks?.length > 0 && <div className="my-tests-result-breakdown">
              <div className="my-tests-result-breakdown-heading"><h3>Performance by course</h3><span>Topic-level breakdown</span></div>
              <div className="my-tests-course-grid">
                {result.courseMarks.map((course) => <article className="my-tests-course-result" key={course.courseName}>
                  <div className="my-tests-course-result-heading"><strong>{course.courseName}</strong><span>{course.earnedMarks}<small> / {course.totalMarks}</small></span></div>
                  <div className="my-tests-course-topics">
                    {course.topics?.map((topic) => <div className="my-tests-topic-result" key={topic.topicName}><span>{topic.topicName}</span><strong>{topic.earnedMarks}<small> / {topic.totalMarks}</small></strong></div>)}
                  </div>
                </article>)}
              </div>
            </div>}
          </section>}
          {!active && <section className="my-tests-panel"><h2>Assigned tests</h2>{records.length ? records.map((record) => <article className="my-tests-row" key={record.id}><div><h3>{record.test?.testName || "Test"}</h3><p>{record.test?.description || "No description provided."}</p><p>{record.test?.questionCount || 0} questions</p></div><span className={`my-tests-status ${record.status.toLowerCase()}`}>{record.status}</span>{record.status === "NEW" && <button type="button" className="my-tests-button" disabled={busy} onClick={() => start(record)}><FaPlay /> Start</button>}</article>) : <p className="my-tests-muted">No tests have been assigned to you yet.</p>}</section>}
          {active && <form className="my-tests-panel" onSubmit={submit}><div className="my-tests-title-row"><div><span>ASSIGNED QUESTIONNAIRE</span><h2>{active.test.testName}</h2></div><span>{active.questions.length} questions</span></div><p className="my-tests-description">{active.test.description || "No description provided."}</p><p className="my-tests-muted">Choose one answer for each question. Your result is saved after submission.</p>{active.questions.map((question, index) => <article className="my-tests-question" key={question.questionKey}><small>QUESTION {index + 1} · {question.difficulty}</small><h3>{question.question}</h3>{(question.content?.options || []).map((option) => { const checked = (answers[question.questionKey] || []).includes(option.id); return <label key={option.id} className={checked ? "selected" : ""}><input type="radio" name={question.questionKey} checked={checked} onChange={() => toggle(question.questionKey, option.id)} />{option.text}</label>; })}</article>)}<button className="my-tests-button" disabled={busy} type="submit">{busy ? "Submitting…" : "Submit test"} <FaPaperPlane /></button></form>}
    </DashboardLayout>
  );
}
