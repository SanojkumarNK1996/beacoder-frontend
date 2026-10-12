import axios from "axios";
import { isCourseActive } from "../utils/courseAvailability";

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
 * @param {number|string|Object} courseOrId - Course ID or course object
 */
export const enrollCourse = async (token, courseOrId) => {
  const courseId =
    courseOrId && typeof courseOrId === "object"
      ? courseOrId.id || courseOrId.courseId || courseOrId._id
      : courseOrId;

  if (!courseId) {
    throw new Error("A course ID is required for enrollment");
  }

  const config = { headers: { Authorization: `Bearer ${token}` } };
  if (typeof courseOrId === "object" && !isCourseActive(courseOrId)) {
    throw new Error("This course is inactive or its activity status is unavailable");
  }

  // Recheck the server status rather than trusting a potentially stale card.
  const course = (await axios.get(
    `${import.meta.env.VITE_BASE_URL}/api/v1/courses/${courseId}`,
    config
  )).data.data;

  if (!isCourseActive(course)) {
    throw new Error("This course is inactive or its activity status is unavailable");
  }

  const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/v1/user/${courseId}/enroll`, {}, {
    ...config,
  });
  return response.data;
};
