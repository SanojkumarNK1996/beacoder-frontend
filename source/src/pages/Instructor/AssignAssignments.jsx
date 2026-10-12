import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaClipboardList,
  FaInfoCircle,
  FaLightbulb,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSave,
  FaTasks,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "../../components/DashboardLayout";
import { descriptionToText, normalizeAssignmentDescription } from "../../utils/assignmentDescription";
import "./AssignAssignments.css";

const apiBase = `${import.meta.env.VITE_BASE_URL}/api/v1`;

const authConfig = () => {
  const token = localStorage.getItem("authToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const extractArray = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (payload?.data && payload.data !== payload) return extractArray(payload.data, keys);
  return [];
};

const normalizeId = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== "" ? number : value;
};

const descriptionFieldLabels = {
  learningBenefits: "Learning benefits",
  context: "Context",
  expectedOutput: "Expected output",
};

const descriptionFieldIcons = {
  learningBenefits: FaLightbulb,
  context: FaInfoCircle,
  expectedOutput: FaCheckCircle,
};

const formatDescriptionFieldLabel = (field) => descriptionFieldLabels[field]
  || field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());

const makeAssignmentDraft = (assignment, displayOrder = 1) => {
  const description = normalizeAssignmentDescription(assignment?.description);
  return {
    title: assignment?.title || "",
    difficulty: assignment?.difficulty || "",
    task: descriptionToText(description.task),
    learningBenefits: descriptionToText(description.learningBenefits),
    context: descriptionToText(description.context),
    expectedOutput: descriptionToText(description.expectedOutput),
    displayOrder: String(assignment?.displayOrder ?? displayOrder),
  };
};

const AssignAssignments = () => {
  const [userName, setUserName] = useState("Instructor");
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentEditor, setAssignmentEditor] = useState(null);
  const [assignmentDraft, setAssignmentDraft] = useState(null);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [assignmentIds, setAssignmentIds] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!message && !error) return undefined;
    const dismissTimer = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 4500);
    return () => window.clearTimeout(dismissTimer);
  }, [message, error]);

  const selectedSubtopic = subtopics.find((subtopic) =>
    String(subtopic.id ?? subtopic.subtopicId) === String(subtopicId)
  );
  const selectedSubtopicKey = selectedSubtopic?.subtopicKey || "";
  const normalizedStudentSearch = studentSearch.trim().toLowerCase();
  const visibleEligibleUsers = eligibleUsers.filter((student) => {
    const user = student.User || student.user || student;
    const id = student.userId ?? user.id ?? student.id;
    const searchableText = [user.name, user.userName, user.email, id].filter(Boolean).join(" ").toLowerCase();
    return searchableText.includes(normalizedStudentSearch);
  });

  useEffect(() => {
    const loadPage = async () => {
      try {
        const [courseResponse, profileResponse] = await Promise.all([
          axios.get(`${apiBase}/content-editor/courses`, authConfig()),
          axios.get(`${apiBase}/user/profile`, authConfig()),
        ]);
        const loadedCourses = extractArray(courseResponse.data, ["courses", "data"]);
        setCourses([...loadedCourses].sort((first, second) =>
          String(first.courseName || first.name || first.courseKey || "").localeCompare(
            String(second.courseName || second.name || second.courseKey || "")
          )
        ));
        setUserName(profileResponse.data?.userName || profileResponse.data?.name || "Instructor");
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load courses.");
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, []);

  useEffect(() => {
    if (!courseId) {
      setTopics([]);
      setEligibleUsers([]);
      return;
    }
    let cancelled = false;
    const loadCourseData = async () => {
      setLoadingTopics(true);
      setLoadingUsers(true);
      try {
        const [topicsResponse, usersResponse] = await Promise.all([
          axios.get(`${apiBase}/courses/${courseId}/topics`, authConfig()),
          axios.get(`${apiBase}/assignments/eligible-users`, {
            ...authConfig(),
            params: { courseId },
          }),
        ]);
        if (cancelled) return;
        setTopics(extractArray(topicsResponse.data, ["topics", "data"]));
        setEligibleUsers(extractArray(usersResponse.data, ["users", "eligibleUsers", "students", "data"]));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || "Unable to load course topics or eligible students.");
          setTopics([]);
          setEligibleUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingTopics(false);
          setLoadingUsers(false);
        }
      }
    };
    loadCourseData();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !topicId) {
      setSubtopics([]);
      return;
    }
    let cancelled = false;
    const loadSubtopics = async () => {
      setLoadingSubtopics(true);
      try {
        const response = await axios.get(
          `${apiBase}/courses/${courseId}/topics/${topicId}/subtopics`,
          authConfig()
        );
        if (!cancelled) {
          const topicGroups = extractArray(response.data, ["topics", "data"]);
          const selectedTopic = topicGroups.find((topic) => String(topic.id) === String(topicId));
          setSubtopics(selectedTopic?.subtopics || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || "Unable to load subtopics.");
          setSubtopics([]);
        }
      } finally {
        if (!cancelled) setLoadingSubtopics(false);
      }
    };
    loadSubtopics();
    return () => {
      cancelled = true;
    };
  }, [courseId, topicId]);

  useEffect(() => {
    if (!courseId || !topicId || !selectedSubtopicKey) {
      setAssignments([]);
      return;
    }
    let cancelled = false;
    const loadCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const response = await axios.get(`${apiBase}/assignments/available`, {
          ...authConfig(),
          params: { courseId, topicId, subtopicKey: selectedSubtopicKey },
        });
        if (!cancelled) {
          setAssignments(extractArray(response.data, ["assignments", "catalog", "data"]));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.response?.data?.message || "Unable to load available assignments.");
          setAssignments([]);
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    };
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [courseId, topicId, subtopicId, selectedSubtopicKey]);

  const changeCourse = (value) => {
    setCourseId(value);
    setTopicId("");
    setSubtopicId("");
    setAssignmentIds([]);
    setUserIds([]);
    setStudentSearch("");
    setAssignmentEditor(null);
    setAssignmentDraft(null);
    setMessage("");
    setError("");
  };

  const changeTopic = (value) => {
    setTopicId(value);
    setSubtopicId("");
    setAssignmentIds([]);
    setAssignmentEditor(null);
    setAssignmentDraft(null);
    setMessage("");
    setError("");
  };

  const toggleAssignment = (assignmentId) => {
    setAssignmentIds((selectedIds) =>
      selectedIds.includes(String(assignmentId))
        ? selectedIds.filter((id) => id !== String(assignmentId))
        : [...selectedIds, String(assignmentId)]
    );
  };

  const toggleStudent = (studentId) => {
    const id = String(studentId);
    setUserIds((selectedIds) => selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id]);
    setMessage("");
    setError("");
  };

  const openAssignmentEditor = (assignment = null) => {
    setAssignmentEditor(assignment ? { mode: "edit", id: assignment.id } : { mode: "create" });
    setAssignmentDraft(makeAssignmentDraft(assignment, assignments.length + 1));
    setMessage("");
    setError("");
  };

  const closeAssignmentEditor = () => {
    if (savingAssignment) return;
    setAssignmentEditor(null);
    setAssignmentDraft(null);
  };

  const changeAssignmentDraft = (event) => {
    const { name, value } = event.target;
    setAssignmentDraft((current) => ({ ...current, [name]: value }));
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    if (!assignmentDraft || !selectedSubtopicKey) return;
    if (![assignmentDraft.title, assignmentDraft.difficulty, assignmentDraft.task, assignmentDraft.learningBenefits, assignmentDraft.context, assignmentDraft.expectedOutput]
      .every((value) => typeof value === "string" && value.trim())) {
      setError("Title, difficulty, task, learning benefits, context, and expected output are required.");
      return;
    }
    if (!["easy", "medium", "tough"].includes(assignmentDraft.difficulty)) {
      setError("Choose an assignment difficulty: easy, medium, or tough.");
      return;
    }
    if (!Number.isInteger(Number(assignmentDraft.displayOrder)) || Number(assignmentDraft.displayOrder) < 1) {
      setError("Display order must be a positive whole number.");
      return;
    }

    const description = { task: assignmentDraft.task.trim() };
    if (assignmentDraft.learningBenefits.trim()) description.learningBenefits = assignmentDraft.learningBenefits.trim();
    if (assignmentDraft.context.trim()) description.context = assignmentDraft.context.trim();
    if (assignmentDraft.expectedOutput.trim()) description.expectedOutput = assignmentDraft.expectedOutput.trim();

    const payload = {
      title: assignmentDraft.title.trim(),
      difficulty: assignmentDraft.difficulty,
      description,
      displayOrder: Number(assignmentDraft.displayOrder),
    };
    setSavingAssignment(true);
    setMessage("");
    setError("");
    try {
      const isEditing = assignmentEditor.mode === "edit";
      const response = isEditing
        ? await axios.put(`${apiBase}/assignments/${assignmentEditor.id}`, payload, authConfig())
        : await axios.post(`${apiBase}/assignments`, { ...payload, subtopicKey: selectedSubtopicKey }, authConfig());
      const savedAssignment = response.data?.assignment;
      if (savedAssignment) {
        setAssignments((current) => isEditing
          ? current.map((item) => item.id === savedAssignment.id ? savedAssignment : item)
          : [...current, savedAssignment].sort((first, second) =>
            Number(first.displayOrder || 0) - Number(second.displayOrder || 0) || Number(first.id) - Number(second.id)));
      }
      setAssignmentEditor(null);
      setAssignmentDraft(null);
      setMessage(isEditing ? "Assignment updated." : "Assignment created and added to this subtopic.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save the assignment.");
    } finally {
      setSavingAssignment(false);
    }
  };

  const submitAssignments = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!courseId || !topicId || !selectedSubtopicKey || !assignmentIds.length || !userIds.length) {
      setError("Choose a course, topic, subtopic, at least one assignment, and at least one student.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${apiBase}/assignments/assign`,
        {
          courseId: normalizeId(courseId),
          topicId: normalizeId(topicId),
          subtopicKey: selectedSubtopicKey,
          assignmentIds: assignmentIds.map(normalizeId),
          userIds: userIds.map(normalizeId),
        },
        authConfig()
      );
      const {
        createdCount = 0,
        duplicateCount = 0,
        ignoredUserCount = 0,
      } = response.data || {};
      const assignmentMessage = createdCount > 0
        ? `Assigned ${createdCount} new assignment${createdCount === 1 ? "" : "s"}${duplicateCount > 0 ? `; skipped ${duplicateCount} already assigned or duplicate item${duplicateCount === 1 ? "" : "s"}` : ""}${ignoredUserCount > 0 ? `; skipped ${ignoredUserCount} ineligible student${ignoredUserCount === 1 ? "" : "s"}` : ""}.`
        : duplicateCount > 0
          ? `No new assignments were created; ${duplicateCount} duplicate assignment${duplicateCount === 1 ? " was" : "s were"} skipped.`
          : ignoredUserCount > 0
            ? `No assignments were created; ${ignoredUserCount} selected student${ignoredUserCount === 1 ? " is" : "s are"} no longer eligible.`
            : "No new assignments were created.";
      setMessage(assignmentMessage);
      setAssignmentIds([]);
      setUserIds([]);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to assign the selected assignments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout userName={userName}><div className="dashboard-layout__loading" role="status">Loading assignment tools…</div></DashboardLayout>;

  return (
    <DashboardLayout
      userName={userName}
      contentClassName="assignment-content assignment-manager"
      overlays={
        <>
          {message && <div className="assignment-manager-message success" role="status"><FaCheckCircle />{message}</div>}
          {error && <div className="assignment-manager-message error" role="alert">{error}</div>}
        </>
      }
    >

            <form className="assignment-manager-form" onSubmit={submitAssignments} noValidate>
              <div className="assignment-manager-field">
                <label htmlFor="assign-course">Course</label>
                <select id="assign-course" value={courseId} onChange={(event) => changeCourse(event.target.value)} required>
                  <option value="">Select a course</option>
                  {courses.map((course) => {
                    const id = course.id ?? course.courseId;
                    return <option key={id} value={id}>{course.courseName || course.name || `Course ${id}`}</option>;
                  })}
                </select>
              </div>

              <div className="assignment-manager-field">
                <label htmlFor="assign-topic">Topic</label>
                <select id="assign-topic" value={topicId} onChange={(event) => changeTopic(event.target.value)} disabled={!courseId || loadingTopics} required>
                  <option value="">{loadingTopics ? "Loading topics..." : "Select a topic"}</option>
                  {topics.map((topic) => {
                    const id = topic.id ?? topic.topicId;
                    return <option key={id} value={id}>{topic.title || topic.topicName || topic.name || `Topic ${id}`}</option>;
                  })}
                </select>
              </div>

              <div className="assignment-manager-field">
                <label htmlFor="assign-subtopic">Subtopic</label>
                <select id="assign-subtopic" value={subtopicId} onChange={(event) => { setSubtopicId(event.target.value); setAssignmentIds([]); setAssignmentEditor(null); setAssignmentDraft(null); setMessage(""); setError(""); }} disabled={!topicId || loadingSubtopics} required>
                  <option value="">{loadingSubtopics ? "Loading subtopics..." : "Select a subtopic"}</option>
                  {subtopics.map((subtopic) => {
                    const id = subtopic.id ?? subtopic.subtopicId;
                    return <option key={id} value={id}>{subtopic.title || subtopic.subtopicName || subtopic.name || `Subtopic ${id}`}</option>;
                  })}
                </select>
              </div>

              <div className="assignment-manager-field assignment-catalog-field">
                <div className="assignment-catalog-heading">
                  <label id="assign-catalog-label">Available assignments</label>
                  <button
                    className="assignment-editor-open-button"
                    type="button"
                    onClick={() => openAssignmentEditor()}
                    disabled={!selectedSubtopicKey}
                  >
                    <FaPlus aria-hidden="true" /> Add assignment
                  </button>
                </div>
                {assignmentEditor && assignmentDraft && (
                  <div
                    className="assignment-authoring-form"
                    role="group"
                    aria-label={assignmentEditor.mode === "edit" ? "Edit assignment" : "Create assignment"}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") saveAssignment(event);
                    }}
                  >
                    <div className="assignment-authoring-heading">
                      <div>
                        <h2>{assignmentEditor.mode === "edit" ? "Edit assignment" : "Create assignment"}</h2>
                        <p>Applies to the selected subtopic. Students submit their work using a URL.</p>
                      </div>
                      <button className="assignment-editor-close" type="button" onClick={closeAssignmentEditor} disabled={savingAssignment} aria-label="Close assignment editor">
                        <FaTimes aria-hidden="true" />
                      </button>
                    </div>
                    <div className="assignment-authoring-fields">
                      <label className="assignment-authoring-field">
                        <span>Title</span>
                        <input name="title" value={assignmentDraft.title} onChange={changeAssignmentDraft} maxLength={255} required />
                      </label>
                      <label className="assignment-authoring-field">
                        <span>Difficulty</span>
                        <select name="difficulty" value={assignmentDraft.difficulty} onChange={changeAssignmentDraft} required>
                          <option value="">Select difficulty</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="tough">Tough</option>
                        </select>
                      </label>
                      <label className="assignment-authoring-field full-width">
                        <span>Task</span>
                        <textarea name="task" value={assignmentDraft.task} onChange={changeAssignmentDraft} rows={3} required />
                      </label>
                      <label className="assignment-authoring-field full-width">
                        <span>Learning benefits</span>
                        <textarea name="learningBenefits" value={assignmentDraft.learningBenefits} onChange={changeAssignmentDraft} rows={2} placeholder="Describe the skills or improvements students can gain by completing this task." required />
                      </label>
                      <label className="assignment-authoring-field full-width">
                        <span>Context</span>
                        <textarea name="context" value={assignmentDraft.context} onChange={changeAssignmentDraft} rows={2} required />
                      </label>
                      <label className="assignment-authoring-field">
                        <span>Expected output</span>
                        <textarea name="expectedOutput" value={assignmentDraft.expectedOutput} onChange={changeAssignmentDraft} rows={3} required />
                      </label>
                      <label className="assignment-authoring-field">
                        <span>Display order</span>
                        <input name="displayOrder" type="number" min="1" step="1" value={assignmentDraft.displayOrder} onChange={changeAssignmentDraft} required />
                      </label>
                    </div>
                    <div className="assignment-authoring-actions">
                      <button className="assignment-editor-cancel" type="button" onClick={closeAssignmentEditor} disabled={savingAssignment}>Cancel</button>
                      <button className="assignment-editor-save" type="button" onClick={saveAssignment} disabled={savingAssignment}>
                        <FaSave aria-hidden="true" /> {savingAssignment ? "Saving..." : assignmentEditor.mode === "edit" ? "Save changes" : "Create assignment"}
                      </button>
                    </div>
                  </div>
                )}
                <div className="assignment-catalog" id="assign-catalog" aria-busy={loadingCatalog}>
                  {loadingCatalog && <div className="assignment-catalog-empty">Loading assignments...</div>}
                  {!loadingCatalog && !assignments.length && (
                    <div className="assignment-catalog-empty">No assignments are available for this subtopic.</div>
                  )}
                  {!loadingCatalog && assignments.map((assignment) => {
                    const assignmentId = String(assignment.id);
                    const isSelected = assignmentIds.includes(assignmentId);
                    const rawDescription = normalizeAssignmentDescription(assignment.description);
                    const summary = descriptionToText(rawDescription.task) || "No description provided.";
                    const detailEntries = ["learningBenefits", "context", "expectedOutput"]
                      .filter((field) => rawDescription[field])
                      .map((field) => [field, rawDescription[field]]);
                    return (
                      <article className={`assignment-card${isSelected ? " selected" : ""}`} key={assignment.id}>
                        <div className="assignment-card-content">
                          <div className="assignment-card-heading">
                            <input
                              id={`assignment-${assignmentId}`}
                              type="checkbox"
                              value={assignmentId}
                              checked={isSelected}
                              onChange={() => toggleAssignment(assignment.id)}
                              disabled={!subtopicId}
                            />
                            <div className="assignment-card-title-row">
                              <label className="assignment-card-title" htmlFor={`assignment-${assignmentId}`}>
                                {assignment.title || assignment.name || `Assignment ${assignment.id}`}
                              </label>
                              <span className={`assignment-difficulty-tag ${assignment.difficulty || ""}`}>
                                {assignment.difficulty || "Difficulty missing"}
                              </span>
                              <button
                                className="assignment-card-edit"
                                type="button"
                                onClick={() => openAssignmentEditor(assignment)}
                                aria-label={`Edit ${assignment.title || "assignment"}`}
                                title="Edit assignment"
                              >
                                <FaEdit aria-hidden="true" /> Edit
                              </button>
                            </div>
                          </div>
                          <div className="assignment-card-description" id={`assignment-description-${assignmentId}`}>
                            <section className="assignment-card-detail assignment-card-task">
                              <h3><FaClipboardList aria-hidden="true" /> Task</h3>
                              <p>{summary}</p>
                            </section>
                            {detailEntries.map(([field, value]) => {
                              const FieldIcon = descriptionFieldIcons[field];
                              return (
                                <section className="assignment-card-detail" key={field}>
                                  <h3><FieldIcon aria-hidden="true" /> {formatDescriptionFieldLabel(field)}</h3>
                                  <p>{descriptionToText(value)}</p>
                                </section>
                              );
                            })}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <small>{loadingCatalog ? "Loading catalog..." : `${assignmentIds.length} selected.`}</small>
              </div>

              <div className="assignment-manager-field assignment-students-field">
                <div className="assignment-students-heading">
                  <span id="assign-students-label">Eligible students</span>
                  <small>{userIds.length} selected · {eligibleUsers.length} active enrolled</small>
                </div>
                <div className="assignment-student-picker">
                  <label className="assignment-student-search">
                    <FaSearch aria-hidden="true" />
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                      placeholder="Search students by name or email"
                      aria-label="Search eligible students"
                      disabled={!courseId || loadingUsers || eligibleUsers.length === 0}
                    />
                  </label>
                  <div className="assignment-student-list" role="group" aria-labelledby="assign-students-label" aria-busy={loadingUsers}>
                    {loadingUsers ? (
                      <p className="assignment-students-empty" role="status">Loading eligible students...</p>
                    ) : !courseId ? (
                      <p className="assignment-students-empty">Choose a course to load its eligible students.</p>
                    ) : eligibleUsers.length === 0 ? (
                      <p className="assignment-students-empty">No active enrolled students are available for this course.</p>
                    ) : visibleEligibleUsers.length === 0 ? (
                      <p className="assignment-students-empty">No students match your search.</p>
                    ) : visibleEligibleUsers.map((student) => {
                      const user = student.User || student.user || student;
                      const id = student.userId ?? user.id ?? student.id;
                      const selected = userIds.includes(String(id));
                      const displayName = user.name || user.userName || user.email || `Student ${id}`;
                      return (
                        <label className={`assignment-student-option${selected ? " selected" : ""}`} key={id}>
                          <input
                            type="checkbox"
                            value={id}
                            checked={selected}
                            onChange={() => toggleStudent(id)}
                            disabled={!courseId || loadingUsers}
                          />
                          <span className="assignment-student-option-copy">
                            <strong>{displayName}</strong>
                            {user.email && user.email !== displayName && <small>{user.email}</small>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button className="assignment-manager-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign to selected students"}
              </button>
            </form>
    </DashboardLayout>
  );
};

export default AssignAssignments;
