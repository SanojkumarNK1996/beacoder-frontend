import { useEffect, useRef, useState } from "react";
import { FaSave, FaTimes, FaEdit, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { fetchUserProfile } from "../../api/CourseList";
import {
  fetchEditorCourses,
  fetchEditorTopics,
  fetchEditorSubtopics,
  fetchEditorContent,
  saveEditorContent,
} from "../../api/ContentEditor";
import "./ContentEditor.css";

const EditableHtml = ({ initialHtml, title, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialHtml;
  }, [initialHtml]);

  return (
    <div
      ref={editorRef}
      className="content-editor-editable"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={`Edit content for ${title || "section"}`}
      aria-multiline="true"
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
    />
  );
};

const ContentEditor = () => {
  const [userName, setUserName] = useState("User");
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedLessonPath, setSavedLessonPath] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetchUserProfile(token)
      .then((profile) => setUserName(profile.userName || "User"))
      .catch((profileError) => console.error("Unable to load user profile", profileError));
  }, []);

  useEffect(() => {
    let current = true;
    fetchEditorCourses()
      .then((data) => { if (current) setCourses(data); })
      .catch(() => { if (current) setError("Unable to load courses. Please try again."); })
      .finally(() => { if (current) setLoadingCourses(false); });
    return () => { current = false; };
  }, []);

  useEffect(() => {
    if (!courseId) return;
    let current = true;
    setTopics([]);
    setSubtopics([]);
    setBlocks([]);
    setTopicId("");
    setSubtopicId("");
    setEditingId(null);
    setDraft("");
    setLoadingTopics(true);
    fetchEditorTopics(courseId)
      .then((data) => { if (current) setTopics(data); })
      .catch(() => { if (current) setError("Unable to load topics. Please try again."); })
      .finally(() => { if (current) setLoadingTopics(false); });
    return () => { current = false; };
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !topicId) return;
    let current = true;
    setSubtopics([]);
    setBlocks([]);
    setSubtopicId("");
    setEditingId(null);
    setDraft("");
    setLoadingSubtopics(true);
    fetchEditorSubtopics(courseId, topicId)
      .then((data) => { if (current) setSubtopics(data); })
      .catch(() => { if (current) setError("Unable to load subtopics. Please try again."); })
      .finally(() => { if (current) setLoadingSubtopics(false); });
    return () => { current = false; };
  }, [courseId, topicId]);

  useEffect(() => {
    if (!courseId || !topicId || !subtopicId) return;
    let current = true;
    setBlocks([]);
    setEditingId(null);
    setDraft("");
    setLoadingBlocks(true);
    fetchEditorContent(courseId, topicId, subtopicId)
      .then((data) => { if (current) setBlocks(data); })
      .catch(() => { if (current) setError("Unable to load lesson content. Please try again."); })
      .finally(() => { if (current) setLoadingBlocks(false); });
    return () => { current = false; };
  }, [courseId, topicId, subtopicId]);

  const handleCourseChange = (event) => {
    setError("");
    setNotice("");
    setSavedLessonPath("");
    setLoadingTopics(false);
    setLoadingSubtopics(false);
    setLoadingBlocks(false);
    setCourseId(event.target.value);
  };

  const handleTopicChange = (event) => {
    setError("");
    setNotice("");
    setSavedLessonPath("");
    setLoadingSubtopics(false);
    setLoadingBlocks(false);
    setTopicId(event.target.value);
  };

  const handleSubtopicChange = (event) => {
    setError("");
    setNotice("");
    setSavedLessonPath("");
    setLoadingBlocks(false);
    setSubtopicId(event.target.value);
  };

  const beginEdit = (block) => {
    const description = block.data.description || "";
    setEditingId(block.id);
    setDraft(description);
    setError("");
    setNotice("");
    setSavedLessonPath("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const handleSave = async (block) => {
    setSaving(true);
    setError("");
    setNotice("");
    setSavedLessonPath("");
    try {
      const saved = await saveEditorContent(courseId, topicId, subtopicId, block.id, draft);
      setBlocks((current) => current.map((item) => item.id === block.id ? saved : item));
      setEditingId(null);
      setDraft("");
      setSavedLessonPath(`/course/${courseId}/topic/${topicId}/sub/${subtopicId}`);
      setNotice("Content saved.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <DashboardLayout userName={userName} onLogout={handleLogout} contentClassName="content-editor-main">

        <section className="content-editor-panel" aria-label="Select lesson">
          <div className="content-editor-select">
            <label htmlFor="editor-course">Course</label>
            <select id="editor-course" value={courseId} onChange={handleCourseChange} disabled={loadingCourses || saving}>
              <option value="">{loadingCourses ? "Loading courses..." : "Select a course"}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}{course.isActive ? "" : " (Inactive)"}
                </option>
              ))}
            </select>
          </div>
          <div className="content-editor-select">
            <label htmlFor="editor-topic">Topic</label>
            <select id="editor-topic" value={topicId} onChange={handleTopicChange} disabled={!courseId || loadingTopics || saving}>
              <option value="">{loadingTopics ? "Loading topics..." : "Select a topic"}</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
            </select>
          </div>
          <div className="content-editor-select">
            <label htmlFor="editor-subtopic">Subtopic</label>
            <select id="editor-subtopic" value={subtopicId} onChange={handleSubtopicChange} disabled={!topicId || loadingSubtopics || saving}>
              <option value="">{loadingSubtopics ? "Loading subtopics..." : "Select a subtopic"}</option>
              {subtopics.map((subtopic) => <option key={subtopic.id} value={subtopic.id}>{subtopic.title}</option>)}
            </select>
          </div>
        </section>

        {error && <div className="content-editor-alert error" role="alert">{error}</div>}
        {notice && (
          <div className="content-editor-alert success" role="status">
            {notice}{" "}
            {savedLessonPath && (
              <Link
                to={`${savedLessonPath}?contentPreview=true`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View saved lesson
              </Link>
            )}
          </div>
        )}

        {loadingBlocks && <div className="content-editor-empty">Loading lesson content...</div>}
        {!loadingBlocks && subtopicId && blocks.length === 0 && (
          <div className="content-editor-empty">No editable heading content was found for this subtopic.</div>
        )}
        {!loadingBlocks && blocks.map((block) => {
          const isEditing = editingId === block.id;
          return (
            <article className="content-editor-block" key={block.id}>
              <div className="content-editor-block-header">
                <div>
                  <span className="content-editor-block-label">Section {block.displayOrder}</span>
                  <h2>{block.title || "Untitled section"}</h2>
                </div>
                {!isEditing && (
                  <button type="button" className="content-editor-button primary" onClick={() => beginEdit(block)} disabled={saving}>
                    <FaEdit aria-hidden="true" /> Edit
                  </button>
                )}
              </div>
              {isEditing ? (
                <>
                  <EditableHtml
                    initialHtml={block.data.description || ""}
                    title={block.title}
                    onChange={setDraft}
                  />
                  <p className="content-editor-hint">
                    Edit the formatted content below. The section heading and order cannot be changed here.
                  </p>
                  <div className="content-editor-actions">
                    <button type="button" className="content-editor-button secondary" onClick={cancelEdit} disabled={saving}>
                      <FaTimes aria-hidden="true" /> Cancel
                    </button>
                    <button type="button" className="content-editor-button primary" onClick={() => handleSave(block)} disabled={saving}>
                      <FaSave aria-hidden="true" /> {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="content-editor-preview" dangerouslySetInnerHTML={{ __html: block.data.description || "" }} />
              )}
            </article>
          );
        })}
        {!subtopicId && (
          <div className="content-editor-empty">
            <FaLock aria-hidden="true" />
            Choose a course, topic, and subtopic to view editable lesson sections.
          </div>
        )}
    </DashboardLayout>
  );
};

export default ContentEditor;
