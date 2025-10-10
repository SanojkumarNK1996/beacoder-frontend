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

export function fetchSubtopicContents(courseId, topicId, subtopicId, token) {
  return axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/contents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
