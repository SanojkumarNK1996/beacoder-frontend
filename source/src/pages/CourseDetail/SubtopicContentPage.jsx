import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import MainPageLoader from "../../components/MainPageLoader";
import { FaChevronLeft } from "react-icons/fa";
import MCQSet from "../../components/MCQSet";
import { InterviewQuiz } from "../../components/InterviewQuiz";
import { fetchSubtopicContents, completeContentBlock } from "../../api/CourseDetailPage";
import "./CourseDetailPage.css";


const SubtopicContentPage = () => {
  const { cId, tId, sId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState(1);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtopicTitle, setSubtopicTitle] = useState(location.state?.subtopicTitle || "");
  const [linearContent, setLinearContent] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  // track whether we've already marked the last item complete so the effect
  // doesn't fire repeatedly when visibleIndex stays at the end
  const lastMarkedRef = useRef(false);

  const videoBlock = contentData.find(item => item.dataType === "youtube_video");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    fetchSubtopicContents(cId, tId, sId, token)
      .then(res => {
        setContentData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setContentData([]);
        setLoading(false);
      });
  }, [cId, tId, sId]);

  useEffect(() => {
    if (!contentData || contentData.length === 0) return;

    const filteredContent = contentData
      .filter((item) => item.dataType !== "youtube_video")
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const expandedList = [];

    filteredContent.forEach((item) => {
      expandedList.push({ ...item, isQuiz: false });

      if (item.Quizzes && item.Quizzes.length > 0) {
        item.Quizzes.forEach((quiz) => {
          expandedList.push({
            ...quiz,
            isQuiz: true,
            parentTitle: item.title,
          });
        });
      }
    });

    setLinearContent(expandedList);

    const firstNonVideoIndex = expandedList.findIndex(
      (item) => item.dataType !== "youtube_video"
    );
    setVisibleIndex(firstNonVideoIndex !== -1 ? firstNonVideoIndex : 0);
  }, [contentData]);

  const handleNext = () => {
    // when user clicks next, mark the currently visible item as complete
    const currentItem = linearContent[visibleIndex];
    if (currentItem) {
      const blockId = currentItem.contentBlockId || currentItem.id;
      if (blockId) {
        const token = localStorage.getItem("authToken");
        completeContentBlock(blockId, token)
          .then(() => {
            console.log("marked content complete", blockId);
          })
          .catch((err) => {
            console.error("error marking content complete", err);
          });
      }
    }

    setVisibleIndex((prev) =>
      prev < linearContent.length - 1 ? prev + 1 : prev
    );
  };

  const handleBack = () => {
    navigate(`/courses/${cId}`, {
      state: {
        expandedTopicId: tId,
        selectedSubtopicId: sId
      }
    });
  };

  // when the visible index reaches the very last item we need to behave the
  // same way as handleNext did (marking it complete). this effect only runs
  // once per session of the last item; lastMarkedRef prevents duplicate
  // network calls if the user repeatedly re-renders on the same index.
  useEffect(() => {
    if (
      linearContent.length > 0 &&
      visibleIndex === linearContent.length - 1 &&
      !lastMarkedRef.current
    ) {
      const lastItem = linearContent[visibleIndex];
      const blockId = lastItem?.contentBlockId || lastItem?.id;
      if (blockId) {
        const token = localStorage.getItem("authToken");
        completeContentBlock(blockId, token)
          .then(() => {
            console.log("marked last content complete via effect", blockId);
            lastMarkedRef.current = true;
          })
          .catch((err) => {
            console.error("error marking last content complete", err);
          });
      }
    }
  }, [visibleIndex, linearContent]);

  if (loading) {
    return (
      <MainPageLoader
        variant="headerSidebarSkeleton"
        text="Loading content..."
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
        <div
          className="course-split-layout"
          style={{
            height: "calc(100vh - 140px)",
            overflowY: "auto",
          }}
        >
          <div className="right-container">
            {/* Back Button */}
            <div className="back-button-container">
              <button
                className="back-button"
                onClick={handleBack}
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
                {subtopicTitle}
              </span>
            </div>

            {/* Video Block */}
            {videoBlock && (
              <div className="video-player">
                <iframe
                  src={videoBlock.data.videoUrl.replace("watch?v=", "embed/")}
                  title={videoBlock.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Description Block */}
            <div className="description-block">
              {linearContent.length > 0 && (
                <div style={{ marginBottom: "36px" }}>
                  {linearContent.slice(0, visibleIndex + 1).map((item, index) => (
                    <div key={index} style={{ marginBottom: "36px" }}>
                      {!item.isQuiz ? (
                        <>
                          {item.dataType !== "mcq_set" &&
                            item.dataType !== "youtube_video" && (
                              <div className="description-title">{item.title}</div>
                            )}

                          {item.dataType === "notes" && (
                            <div
                              className="description-text"
                              dangerouslySetInnerHTML={{
                                __html: item.data.description,
                              }}
                            />
                          )}

                          {item.data && item.data.codeSnippet && (
                            <div className="code-block">
                              <div className="code-header">code</div>
                              <pre className="code-body">
                                {item.data.codeSnippet}
                              </pre>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {item.type === "mcq_set" ? (
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "20px",
                              }}
                            >
                              <MCQSet questions={item.questionData} />
                            </div>
                          ) : (
                            <div style={{ marginBottom: "20px" }}>
                              <InterviewQuiz questions={item.questionData} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Next Button */}
              {linearContent.length > 0 && visibleIndex < linearContent.length - 1 && (
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                  <button
                    onClick={handleNext}
                    disabled={visibleIndex >= linearContent.length - 1}
                    style={{
                      backgroundColor: "#367cfe",
                      color: "white",
                      padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 36px)",
                      fontSize: "clamp(14px, 2vw, 18px)",
                      fontWeight: "600",
                      border: "none",
                      borderRadius: "12px",
                      cursor:
                        visibleIndex >= linearContent.length - 1 ? "not-allowed" : "pointer",
                      opacity: visibleIndex >= linearContent.length - 1 ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      if (visibleIndex < linearContent.length - 1) {
                        e.target.style.backgroundColor = "white";
                        e.target.style.color = "#367cfe";
                        e.target.style.border = "2px solid black";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (visibleIndex < linearContent.length - 1) {
                        e.target.style.backgroundColor = "#367cfe";
                        e.target.style.color = "white";
                        e.target.style.border = "none";
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="notes-section">
              <h3>Take Notes</h3>
              <textarea placeholder="Write your notes here..." />
              <button onClick={() => alert("Notes submitted ✅")}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtopicContentPage;
