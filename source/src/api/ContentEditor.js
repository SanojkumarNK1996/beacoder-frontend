import axios from "axios";

const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/content-editor`;
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

const fetchData = async (path) => {
  const response = await axios.get(`${endpoint}${path}`, authConfig());
  return response.data.data;
};

export const fetchEditorCourses = () => fetchData("/courses");
export const fetchEditorTopics = (courseId) => fetchData(`/courses/${courseId}/topics`);
export const fetchEditorSubtopics = (courseId, topicId) =>
  fetchData(`/courses/${courseId}/topics/${topicId}/subtopics`);
export const fetchEditorContent = (courseId, topicId, subtopicId) =>
  fetchData(`/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/content`);

export const saveEditorContent = async (courseId, topicId, subtopicId, contentId, description) => {
  const response = await axios.patch(
    `${endpoint}/courses/${courseId}/topics/${topicId}/subtopics/${subtopicId}/content/${contentId}`,
    { description },
    authConfig(),
  );
  return response.data.data;
};
