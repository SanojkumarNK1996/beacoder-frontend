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

export async function fetchSubtopicsAndQuiz(id, section, token) {
  const subtopicsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics/${section.id}/subtopics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const quizRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${id}/topics/${section.id}/quiz`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return {
    subtopicsData: subtopicsRes.data.data,
    quizData: quizRes.data.quizzes
  };
}

export function fetchTopicNotes(topicId, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/notes/${topicId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function fetchSubtopicContents(courseId, topicId, subtopicId, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/contents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

/**
 * Mark a content block (or quiz) as completed for the current user
 * @param {string|number} contentBlockId
 * @param {string} token - JWT auth token
 */
export function completeContentBlock(contentBlockId, token) {
  return axios.post(
    `${import.meta.env.VITE_BASE_URL}/api/v1/user/content/${contentBlockId}/complete`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}
