import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainPageLoader from "../../components/MainPageLoader";
import { InstructorSidebar } from "../../components/InstructorSidebar";
import { TopBar } from "../../components/TopBar";
import axios from "axios";
import { FaClock, FaCheckCircle, FaUser, FaCalendarAlt, FaLink, FaBookOpen, FaEye } from "react-icons/fa";
import "./InstructorAssignments.css";

const LogoutToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="logout-toast" style={{ zIndex: 12000 }}>
      <span className="logout-toast-icon">✔</span>
      Logout Successful! Redirecting to login...
    </div>
  );
};

const InstructorAssignments = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("Instructor");
  const [isLoading, setIsLoading] = useState(true);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [assignmentStats, setAssignmentStats] = useState({
    pendingCount: 0,
    reviewedCount: 0
  });
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    // Check if user has instructor role
    if (role !== "instructor") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, submittedAssignmentsData, coursesData] = await Promise.all([
          fetchInstructorProfile(token),
          fetchSubmittedAssignments(token),
          fetchCourses(token),
        ]);
        setUserName(userData.userName || "Instructor");
        setSubmittedAssignments(submittedAssignmentsData.assignments || []);
        setAssignmentStats({
          pendingCount: submittedAssignmentsData.status?.pendingCount || 0,
          reviewedCount: submittedAssignmentsData.status?.reviewedCount || 0
        });
        setCourses(coursesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedCourse, selectedStatus]);

  const fetchInstructorProfile = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`, config);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      return { userName: "Instructor" };
    }
  };

  const fetchSubmittedAssignments = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/assignments/admin/submitted`;
      const params = [];
      
      if (selectedCourse) {
        params.push(`courseId=${selectedCourse}`);
      }
      if (selectedStatus) {
        params.push(`status=${selectedStatus}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url, config);
      // Handle different possible response structures
      const data = response.data;
      const assignments = data.assignments || data.data || data.submissions || [];
      const status = data.status || { pendingCount: 0, reviewedCount: 0 };
      return { assignments, status };
    } catch (error) {
      console.error('Error fetching submitted assignments:', error);
      console.error('Error details:', error.response?.data);

      // Temporary mock data for testing UI
      const mockData = {
        assignments: selectedCourse ? [
          {
            id: 1,
            textAnswer: null,
            submissionUrl: "https://github.com/beacoder199-ui",
            marksObtained: null,
            feedback: null,
            status: "submitted",
            submittedAt: "2026-03-31T15:40:24.108Z",
            reviewedAt: null,
            createdAt: "2026-03-30T16:24:43.699Z",
            updatedAt: "2026-03-31T15:40:24.109Z",
            assignmentId: 1,
            userId: 1,
            Assignment: {
              id: 1,
              title: "JS Challenge: The Discount Filter",
              description: {
                task: "Create a function that filters an array of products and returns only the names of products that cost more than $50 and are marked as 'onSale'.",
                context: "You are building an e-commerce store. You need to identify 'Premium' products that are currently on sale.",
                language: "javascript",
                starterCode: "const products = [\n  { name: 'Laptop', price: 1200, onSale: true },\n  { name: 'Mouse', price: 25, onSale: true },\n  { name: 'Keyboard', price: 80, onSale: false },\n  { name: 'Monitor', price: 150, onSale: true }\n];\n\nfunction getPremiumSales(items) {\n  // Your code here\n}\n\nconsole.log(getPremiumSales(products));",
                instructions: [
                  "Use the .filter() method to find products where price > 50 AND onSale === true.",
                  "Use the .map() method on the filtered result to return only the 'name' of the product.",
                  "Return the final array of names."
                ],
                expectedOutput: "['Laptop', 'Monitor']"
              },
              allowedSubmissionType: "URL",
              maxMarks: 100,
              dueDate: null,
              displayOrder: 1,
              isActive: true,
              createdAt: "2026-03-30T16:22:13.220Z",
              updatedAt: "2026-03-30T16:22:13.220Z",
              courseId: parseInt(selectedCourse),
              topicId: 1,
              subtopicId: 1,
              Course: {
                courseName: courses.find(c => c.id === parseInt(selectedCourse))?.courseName || "Selected Course"
              }
            },
            User: {
              id: 1,
              name: "Akshay",
              email: "akshay@gmail.com"
            }
          }
        ] : [
          {
            id: 1,
            textAnswer: null,
            submissionUrl: "https://github.com/beacoder199-ui",
            marksObtained: null,
            feedback: null,
            status: "submitted",
            submittedAt: "2026-03-31T15:40:24.108Z",
            reviewedAt: null,
            createdAt: "2026-03-30T16:24:43.699Z",
            updatedAt: "2026-03-31T15:40:24.109Z",
            assignmentId: 1,
            userId: 1,
            Assignment: {
              id: 1,
              title: "JS Challenge: The Discount Filter",
              description: {
                task: "Create a function that filters an array of products and returns only the names of products that cost more than $50 and are marked as 'onSale'.",
                context: "You are building an e-commerce store. You need to identify 'Premium' products that are currently on sale.",
                language: "javascript",
                starterCode: "const products = [\n  { name: 'Laptop', price: 1200, onSale: true },\n  { name: 'Mouse', price: 25, onSale: true },\n  { name: 'Keyboard', price: 80, onSale: false },\n  { name: 'Monitor', price: 150, onSale: true }\n];\n\nfunction getPremiumSales(items) {\n  // Your code here\n}\n\nconsole.log(getPremiumSales(products));",
                instructions: [
                  "Use the .filter() method to find products where price > 50 AND onSale === true.",
                  "Use the .map() method on the filtered result to return only the 'name' of the product.",
                  "Return the final array of names."
                ],
                expectedOutput: "['Laptop', 'Monitor']"
              },
              allowedSubmissionType: "URL",
              maxMarks: 100,
              dueDate: null,
              displayOrder: 1,
              isActive: true,
              createdAt: "2026-03-30T16:22:13.220Z",
              updatedAt: "2026-03-30T16:22:13.220Z",
              courseId: 3,
              topicId: 1,
              subtopicId: 1,
              Course: {
                courseName: "c++"
              }
            },
            User: {
              id: 1,
              name: "Akshay",
              email: "akshay@gmail.com"
            }
          }
        ],
        status: {
          pendingCount: selectedCourse ? 1 : 1,
          reviewedCount: 0
        }
      };
      return mockData;
    }
  };

  const fetchCourses = async (token) => {
    try {
      const config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses`, config);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };

  const handleViewDetails = (submission) => {
    navigate("/instructor/assignments/detail", {
      state: { submission, userName }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setShowLogoutToast(true);
  };

  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => {
        setShowLogoutToast(false);
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast, navigate]);

  if (isLoading) {
    return <MainPageLoader variant="headerSidebarSkeleton" text="Loading assignments..." />;
  }

  return (
    <div className="course-list-container">
      <InstructorSidebar hovered={hovered} setHovered={setHovered} />

      <div className="course-list-main">
        <TopBar userName={userName} onLogout={handleLogout} />

        <div className="course-list-inner">
          <div className="course-list-content">
            {/* Assignment Stats Section */}
            <div className="assignment-stats-container">
              <div className="stat-card stat-pending">
                <div className="stat-card-header"><FaClock /> Pending Review</div>
                <h3 className="stat-card-value">{assignmentStats.pendingCount}</h3>
                <p className="stat-card-label">Submissions</p>
              </div>

              <div className="stat-card stat-reviewed">
                <div className="stat-card-header"><FaCheckCircle /> Reviewed</div>
                <h3 className="stat-card-value">{assignmentStats.reviewedCount}</h3>
                <p className="stat-card-label">Submissions</p>
              </div>
            </div>

            {/* Submitted Assignments Section */}
            <div className="submitted-assignments-section">
              <h2 className="section-title">Submitted Assignments</h2>

              {/* Combined Filters Section */}
              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="course-filter" className="filter-label">
                    <FaBookOpen className="filter-icon" />
                    Course
                  </label>
                  <select
                    id="course-filter"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-divider"></div>

                <div className="filter-group">
                  <label htmlFor="status-filter" className="filter-label">
                    <FaClock className="filter-icon" />
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>
              </div>

              {submittedAssignments && submittedAssignments.length > 0 ? (
                <div className="assignments-list">
                  {submittedAssignments.map((submission) => (
                    <div key={submission.id} className="assignment-item">
                      <div className="assignment-header">
                        <div className="assignment-title-section">
                          <h3 className="assignment-title">{submission.Assignment?.title}</h3>
                          <span className={`status-badge ${submission.status}`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="course-info">
                          <FaBookOpen className="course-icon" />
                          <span>{submission.Assignment?.Course?.courseName}</span>
                        </div>
                      </div>

                      <div className="assignment-details">
                        <div className="detail-row">
                          <FaUser className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Submitted by:</span>
                            <span className="detail-value">{submission.User?.name} ({submission.User?.email})</span>
                          </div>
                        </div>

                        <div className="detail-row">
                          <FaCalendarAlt className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Submitted on:</span>
                            <span className="detail-value">
                              {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {submission.marksObtained !== null && (
                          <div className="detail-row">
                            <div className="marks-info">
                              <span className="marks-label">Marks:</span>
                              <span className="marks-value">
                                {submission.marksObtained}/{submission.Assignment?.maxMarks}
                              </span>
                            </div>
                          </div>
                        )}

                        {submission.feedback && (
                          <div className="feedback-section">
                            <span className="feedback-label">Feedback:</span>
                            <p className="feedback-text">{submission.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="assignment-actions">
                        <button 
                          onClick={() => handleViewDetails(submission)}
                          className="view-details-btn"
                        >
                          <FaEye /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-assignments">
                  <p>No assignments submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <LogoutToast show={showLogoutToast} />
      </div>
    </div>
  );
};

export default InstructorAssignments;
