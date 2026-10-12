import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEye, FaSave, FaSearch, FaRegCalendarAlt, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import {
  createStudentActivity,
  fetchManagedProgress,
  fetchStudentActivities,
  saveManagedProgress,
} from "../../api/StudentProgress";
import "./StudentProgressManagement.css";

const emptyDraft = {
  overallProgress: 0,
  liveInterviewNumber: 0,
  onlineMockTestNumber: 0,
};

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const StudentProgressManagement = () => {
  const [userName, setUserName] = useState("User");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogMode, setDialogMode] = useState("edit");
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityDraft, setActivityDraft] = useState({ activityDate: today(), title: "", details: "" });
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const editButtonRef = useRef(null);
  const selectedStudentId = selectedStudent?.studentId;

  const loadStudents = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      setStudents(await fetchManagedProgress(query));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load student progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    fetchUserProfile(token)
      .then((profile) => setUserName(profile.userName || "User"))
      .catch((profileError) => console.error("Unable to load user profile", profileError));
    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setActivities([]);
      return undefined;
    }
    let active = true;
    setActivitiesLoading(true);
    setActivityError("");
    fetchStudentActivities(selectedStudentId)
      .then((items) => { if (active) setActivities(items); })
      .catch((requestError) => {
        if (active) setActivityError(requestError.response?.data?.message || "Unable to load the activity timeline.");
      })
      .finally(() => { if (active) setActivitiesLoading(false); });
    return () => { active = false; };
  }, [selectedStudentId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedStudent && dialog && !dialog.open) dialog.showModal();
    if (!selectedStudent && dialog?.open) dialog.close();
  }, [selectedStudent]);

  const closeEditor = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setSelectedStudent(null);
    editButtonRef.current?.focus();
  };

  const chooseStudent = (student, mode = "edit") => {
    setSelectedStudent(student);
    setDialogMode(mode);
    setActivityDraft({ activityDate: today(), title: "", details: "" });
    setActivityError("");
    setDraft({
      overallProgress: student.overallProgress,
      liveInterviewNumber: student.liveInterviewNumber,
      onlineMockTestNumber: student.onlineMockTestNumber,
    });
    setNotice("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await saveManagedProgress(selectedStudent.studentId, {
        overallProgress: Number(draft.overallProgress),
        liveInterviewNumber: Number(draft.liveInterviewNumber),
        onlineMockTestNumber: Number(draft.onlineMockTestNumber),
      });
      const updated = { ...selectedStudent, ...saved };
      setSelectedStudent(updated);
      setStudents((current) => current.map((student) => (
        student.studentId === updated.studentId ? { ...student, ...updated } : student
      )));
      setNotice("Student progress saved.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save student progress.");
    } finally {
      setSaving(false);
    }
  };

  const handleActivitySave = async (event) => {
    event.preventDefault();
    if (!selectedStudent) return;
    setActivitySaving(true);
    setActivityError("");
    try {
      const saved = await createStudentActivity(selectedStudent.studentId, activityDraft);
      setActivities((current) => [saved, ...current].sort((a, b) => (
        b.activityDate.localeCompare(a.activityDate) || new Date(b.createdAt) - new Date(a.createdAt)
      )));
      setActivityDraft({ activityDate: today(), title: "", details: "" });
    } catch (requestError) {
      setActivityError(requestError.response?.data?.message || "Unable to save this activity.");
    } finally {
      setActivitySaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="student-progress-main">

        <section className="student-progress-panel">
          <label className="student-progress-search">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                loadStudents(event.target.value);
              }}
              placeholder="Search candidates by name, email or ID"
              aria-label="Search candidates"
            />
          </label>

          {error && <p className="student-progress-alert error" role="alert">{error}</p>}
          {notice && <p className="student-progress-alert success" role="status">{notice}</p>}

          <div className="student-progress-content">
            <div className="student-progress-table-wrap">
              <table className="student-progress-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Overall</th>
                    <th>Courses</th>
                    <th>Live interview</th>
                    <th>Online tests</th>
                    <th>Assignments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="student-progress-state">Loading candidates…</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan="7" className="student-progress-state">No student candidates found.</td></tr>
                  ) : students.map((student) => (
                    <tr key={student.studentId} className={selectedStudent?.studentId === student.studentId ? "selected" : ""}>
                      <td>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                      </td>
                      <td>{student.overallProgress}%</td>
                      <td>{student.numberOfCourses}</td>
                      <td>{student.liveInterviewNumber}</td>
                      <td>{student.onlineMockTestNumber}</td>
                      <td>{student.assignmentCompleted}/{student.assignmentTotal}</td>
                      <td>
                        <div className="student-progress-actions">
                        <button
                          type="button"
                          className="student-progress-view"
                          aria-label={`View details for ${student.name}`}
                          aria-haspopup="dialog"
                          aria-controls="student-progress-dialog"
                          ref={editButtonRef}
                          onClick={(event) => {
                            editButtonRef.current = event.currentTarget;
                            chooseStudent(student, "view");
                          }}
                        >
                          <FaEye /> View
                        </button>
                        <button
                          type="button"
                          className="student-progress-edit"
                          aria-label={`Edit progress for ${student.name}`}
                          aria-haspopup="dialog"
                          aria-controls="student-progress-dialog"
                          ref={editButtonRef}
                          onClick={(event) => {
                            editButtonRef.current = event.currentTarget;
                            chooseStudent(student, "edit");
                          }}
                        >
                          <FaEdit /> Edit
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          <dialog
            id="student-progress-dialog"
            className="student-progress-dialog"
            ref={dialogRef}
            aria-labelledby="student-progress-dialog-title"
            onClose={() => {
              setSelectedStudent(null);
              editButtonRef.current?.focus();
            }}
            onClick={(event) => {
              if (event.target === dialogRef.current) closeEditor();
            }}
          >
            {selectedStudent && (
              <div className="student-progress-details">
                <header className="student-progress-dialog-header">
                  <div>
                    <h2 id="student-progress-dialog-title">{selectedStudent.name}</h2>
                    <p>{selectedStudent.email} · {selectedStudent.numberOfCourses} courses enrolled</p>
                  </div>
                  <button type="button" className="student-progress-dialog-close" onClick={closeEditor} aria-label="Close progress editor">
                    <FaTimes aria-hidden="true" />
                  </button>
                </header>

                {dialogMode === "edit" && error && <p className="student-progress-alert error" role="alert">{error}</p>}
                {dialogMode === "edit" && notice && <p className="student-progress-alert success" role="status">{notice}</p>}

                {dialogMode === "view" ? (
                  <section className="student-progress-profile" aria-label="Candidate progress details">
                    <div className="student-progress-profile-heading">
                      <h3>Progress overview</h3>
                      <button type="button" className="student-progress-profile-edit" onClick={() => chooseStudent(selectedStudent, "edit")}>
                        <FaEdit aria-hidden="true" /> Edit progress
                      </button>
                    </div>
                    <dl className="student-progress-profile-grid">
                      <div><dt>Overall progress</dt><dd>{selectedStudent.overallProgress}%</dd></div>
                      <div><dt>Courses</dt><dd>{selectedStudent.numberOfCourses}</dd></div>
                      <div><dt>Live interviews</dt><dd>{selectedStudent.liveInterviewNumber}</dd></div>
                      <div><dt>Online tests</dt><dd>{selectedStudent.onlineMockTestNumber}</dd></div>
                      <div><dt>Assignments</dt><dd>{selectedStudent.assignmentCompleted} of {selectedStudent.assignmentTotal} completed</dd></div>
                    </dl>
                  </section>
                ) : (
                  <form className="student-progress-editor" onSubmit={handleSave}>
                    <h3>Progress summary</h3>
                    <label>
                      <span>Overall progress (%)</span>
                      <input type="number" min="0" max="100" step="0.01" value={draft.overallProgress} onChange={(event) => setDraft({ ...draft, overallProgress: event.target.value })} required />
                    </label>
                    <label>
                      <span>Live interviews</span>
                      <input type="number" min="0" step="1" value={draft.liveInterviewNumber} onChange={(event) => setDraft({ ...draft, liveInterviewNumber: event.target.value })} required />
                    </label>
                    <label>
                      <span>Online mock tests</span>
                      <input type="number" min="0" step="1" value={draft.onlineMockTestNumber} onChange={(event) => setDraft({ ...draft, onlineMockTestNumber: event.target.value })} required />
                    </label>
                    <button className="student-progress-save" type="submit" disabled={saving}>
                      <FaSave /> {saving ? "Saving…" : "Save progress"}
                    </button>
                  </form>
                )}

                <section className="student-progress-timeline" aria-labelledby="student-progress-timeline-title">
                  <div className="student-progress-timeline-heading">
                    <div>
                      <h2 id="student-progress-timeline-title">Activity timeline</h2>
                      <p>{dialogMode === "edit" ? "Keep a dated record of learning milestones and tutor updates." : "Dated learning milestones and tutor updates."}</p>
                    </div>
                    <FaRegCalendarAlt aria-hidden="true" />
                  </div>

                  {dialogMode === "edit" && <form className="student-progress-activity-form" onSubmit={handleActivitySave}>
                    <label>
                      <span>Activity date</span>
                      <input
                        type="date"
                        value={activityDraft.activityDate}
                        onChange={(event) => setActivityDraft({ ...activityDraft, activityDate: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>What did the student do?</span>
                      <input
                        type="text"
                        maxLength="120"
                        value={activityDraft.title}
                        onChange={(event) => setActivityDraft({ ...activityDraft, title: event.target.value })}
                        placeholder="e.g. Completed Java arrays"
                        required
                      />
                    </label>
                    <label>
                      <span>Notes <small>(optional)</small></span>
                      <textarea
                        rows="3"
                        maxLength="5000"
                        value={activityDraft.details}
                        onChange={(event) => setActivityDraft({ ...activityDraft, details: event.target.value })}
                        placeholder="Add context, feedback, or next steps"
                      />
                    </label>
                    {activityError && <p className="student-progress-alert error" role="alert">{activityError}</p>}
                    <button className="student-progress-activity-submit" type="submit" disabled={activitySaving}>
                      <FaPlus aria-hidden="true" /> {activitySaving ? "Adding daily update…" : "Add daily update"}
                    </button>
                  </form>}

                  <div className="student-progress-activity-list" aria-live="polite">
                    {activitiesLoading ? (
                      <p className="student-progress-activity-empty">Loading activity…</p>
                    ) : activities.length === 0 ? (
                      <p className="student-progress-activity-empty">
                        {dialogMode === "edit" ? "No updates yet. Add the first one to start this student’s timeline." : "No timeline updates have been recorded."}
                      </p>
                    ) : activities.map((activity) => (
                      <article className="student-progress-activity" key={activity.id}>
                        <span className="student-progress-activity-dot" aria-hidden="true" />
                        <div>
                          <time dateTime={activity.activityDate}>
                            {new Date(`${activity.activityDate}T00:00:00`).toLocaleDateString(undefined, {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </time>
                          <h3>{activity.title}</h3>
                          {activity.details && <p>{activity.details}</p>}
                          <span className="student-progress-activity-author">Updated by {activity.recorder?.name || "Tutor"}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </dialog>
        </section>
    </DashboardLayout>
  );
};

export default StudentProgressManagement;
