import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { FaChevronRight, FaChevronDown, FaRegFileAlt } from "react-icons/fa";
import {
  fetchCourseHeader,
  fetchCourseTopics,
  fetchSubtopics
} from "../../api/CourseDetailPage";
import "./CourseDetailPage.css";
const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [openIndex, setOpenIndex] = useState(null);
  const [courseHeader, setCourseHeader] = useState({});
  const [topicData, setTopicData] = useState([]);
  const [currentSubtopics, setCurrentSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtopicLoading, setSubtopicLoading] = useState(false);
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
      .catch(() => {
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
        fetchSubtopics(id, section, token)
          .then(response => {
            setCurrentSubtopics(response.data.data);
            setSubtopicLoading(false);
          })
          .catch(() => {
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
      const response = await fetchSubtopics(id, section, token);
      setCurrentSubtopics(response.data.data);
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
      <DashboardLayout contentClassName="course-main"><div className="dashboard-layout__loading" role="status">{loading ? "Loading course details…" : "Loading subtopics…"}</div></DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      contentClassName="course-main"
      pageTitle={courseHeader?.courseName || "Course Details"}
      pageDescription={courseHeader?.description || "Explore the topics and lessons in this course."}
    >

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
                    return (
                      <React.Fragment key={section.title}>
                        <li
                          className={`syllabus-item ${openIndex === idx ? "active" : ""
                            }`}
                          onClick={() => handleTopicDropdown(section, idx)}
                        >
                          <span className="syllabus-item-left">
                            <span className="syllabus-item-title">{section.title}</span>
                          </span>
                          <span className="syllabus-item-right">
                            {openIndex === idx ? (
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

                        {openIndex === idx && (
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

                              return subtopics;
                            })()}
                          </ul>
                        )}
                      </React.Fragment>
                    );
                  })}
            </ul>
          </div>
        </div>

    </DashboardLayout>
  );
};

export default CourseDetailPage;