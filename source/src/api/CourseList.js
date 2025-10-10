import axios from "axios";

/**
 * Fetch all courses from the API
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object[]>} - Array of courses
 */
export const fetchCourses = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
