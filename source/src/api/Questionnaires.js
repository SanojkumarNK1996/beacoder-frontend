import axios from "axios";

const API = `${import.meta.env.VITE_BASE_URL || ""}/api/v1/questionnaires`;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

export const fetchQuestionnaires = async () => (await axios.get(`${API}/mine`, auth())).data.data;
export const createQuestionnaire = async (payload) => (await axios.post(API, payload, auth())).data.data;
export const updateQuestionnaire = async (id, payload) => (await axios.put(`${API}/${id}`, payload, auth())).data.data;
export const assignQuestionnaire = async (id, userIds) => (await axios.post(`${API}/${id}/assign`, { userIds }, auth())).data.data;
export const allowQuestionnaireRetake = async (testId, userId) => (await axios.post(`${API}/${testId}/retake/${userId}`, {}, auth())).data.data;
export const fetchStudents = async (search) => (await axios.get(`${API}/students`, { ...auth(), params: { search } })).data.data;
export const fetchQuestionnaireResults = async (search, studentSearch) => (await axios.get(`${API}/results`, { ...auth(), params: { search, studentSearch } })).data.data;
export const previewQuestionnaire = async (id) => (await axios.get(`${API}/${id}/preview`, auth())).data.data;
export const fetchAssignedTests = async () => (await axios.get(`${API}/assigned`, auth())).data.data;
export const startAssignedTest = async (id) => (await axios.get(`${API}/${id}/start`, auth())).data;
export const submitAssignedTest = async (id, answers) => (await axios.post(`${API}/${id}/submit`, { answers }, auth())).data.data;
