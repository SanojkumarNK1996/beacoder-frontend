import axios from "axios";

export function fetchCourseHeader(id, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function fetchCourseTopics(id, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function fetchSubtopics(id, section, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics/${section.id}/subtopics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function fetchSubtopicContents(courseId, topicId, subtopicId, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/contents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function fetchSubtopicReview(subtopicId, token) {
  return axios.get(
    `${import.meta.env.VITE_BASE_URL}/api/v1/user/subtopics/${subtopicId}/review`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function saveSubtopicReview(subtopicId, selection, token) {
  return axios.post(
    `${import.meta.env.VITE_BASE_URL}/api/v1/user/subtopics/${subtopicId}/review`,
    { selection },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
