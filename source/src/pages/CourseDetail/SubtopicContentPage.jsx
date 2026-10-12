import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { FaChevronLeft } from "react-icons/fa";
import {
  fetchSubtopicContents,
  fetchSubtopicReview,
  saveSubtopicReview,
} from "../../api/CourseDetailPage";
import "./CourseDetailPage.css";

const SubtopicContentPage = () => {
  const { cId, tId, sId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isContentPreview = new URLSearchParams(location.search).get("contentPreview") === "true";
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const subtopicTitle = location.state?.subtopicTitle || "";
  const [linearContent, setLinearContent] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const videoBlock = contentData.find(item => item.dataType === "youtube_video");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    fetchSubtopicContents(cId, tId, sId, token)
      .then(res => {
        setContentData(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setContentData([]);
        setLoading(false);
      });
  }, [cId, tId, sId]);

  useEffect(() => {
    if (isContentPreview) return;
    let isCurrent = true;
    const token = localStorage.getItem("authToken");
    setReviewLoading(true);
    setSelectedReview(null);
    fetchSubtopicReview(sId, token)
      .then((res) => {
        if (isCurrent) setSelectedReview(res.data.data.selection);
      })
      .catch(() => {
        if (isCurrent) setReviewMessage("Unable to load your previous response.");
      })
      .finally(() => {
        if (isCurrent) setReviewLoading(false);
      });

    return () => { isCurrent = false; };
  }, [sId, isContentPreview]);

  useEffect(() => {
    if (!contentData || contentData.length === 0) return;

    const filteredContent = contentData
      .filter((item) => item.dataType !== "youtube_video")
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const expandedList = [];

    filteredContent.forEach((item) => {
      expandedList.push(item);
    });

    setLinearContent(expandedList);

    const firstNonVideoIndex = expandedList.findIndex(
      (item) => item.dataType !== "youtube_video"
    );
    setVisibleIndex(firstNonVideoIndex !== -1 ? firstNonVideoIndex : 0);
  }, [contentData]);

  const handleNext = () => {
    setVisibleIndex((prev) =>
      prev < linearContent.length - 1 ? prev + 1 : prev
    );
  };

  const handleReviewSelection = async (selection) => {
    if (reviewSaving) return;
    setReviewSaving(true);
    setReviewMessage("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await saveSubtopicReview(sId, selection, token);
      setSelectedReview(response.data.data.selection);
      navigate(`/courses/${cId}`, {
        state: {
          expandedTopicId: tId,
          selectedSubtopicId: sId,
        },
      });
    } catch {
      setReviewMessage("We couldn't save your response. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/courses/${cId}`, {
      state: {
        expandedTopicId: tId,
        selectedSubtopicId: sId
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout contentClassName="course-main"><div className="dashboard-layout__loading" role="status">Loading lesson content…</div></DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      contentClassName="course-main"
      pageTitle={subtopicTitle || contentData.find((item) => item.subtopicTitle)?.subtopicTitle || contentData.find((item) => item.title)?.title || "Lesson Content"}
      pageDescription="Work through this lesson and record your understanding when you're done."
    >
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
                      {item.dataType !== "youtube_video" && item.title?.trim() && (
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

              {!isContentPreview && (linearContent.length === 0 || visibleIndex === linearContent.length - 1) && (
                <section className="subtopic-review" aria-labelledby="subtopic-review-title">
                  <h2 id="subtopic-review-title">How was this subtopic?</h2>
                  <p>Your response helps you track which subtopics you have reviewed.</p>
                  <div className="subtopic-review-options">
                    {[
                      { value: "UNDERSTOOD", label: "I understood this well" },
                      { value: "NEEDS_MORE", label: "Something is missing" },
                      { value: "NOT_GOOD", label: "Not good" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`subtopic-review-option${selectedReview === option.value ? " selected" : ""}`}
                        aria-pressed={selectedReview === option.value}
                        disabled={reviewLoading || reviewSaving}
                        onClick={() => handleReviewSelection(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="subtopic-review-message" role="status" aria-live="polite">
                    {reviewLoading ? "Loading your response..." : reviewMessage}
                  </p>
                </section>
              )}
            </div>

          </div>
        </div>
    </DashboardLayout>
  );
};

export default SubtopicContentPage;
