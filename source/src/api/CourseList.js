import axios from "axios";

/**
 * Fetch all courses from the API
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object[]>} - Array of courses
 */
export const fetchCourses = async (token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses`, config);
  return response.data.data;
};

/**
 * Fetch user profile details
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - User profile data
 */
export const fetchUserProfile = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch courses the current user is enrolled in
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object[]>} - Array of enrolled courses
 */
export const fetchEnrolledCourses = async (token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/user/my-courses`, config);
  return response.data.data;
};

/**
 * Enroll the current user in a course
 * @param {string} token 
 * @param {number|string} courseId
 */
export const enrollCourse = async (token, courseId) => {
  const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/user/${courseId}/enroll`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
