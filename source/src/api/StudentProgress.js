import axios from "axios";

const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/progress/manage`;

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export const fetchManagedProgress = async (search = "") => {
  const response = await axios.get(endpoint, {
    ...authConfig(),
    params: search ? { search } : {},
  });
  return response.data.data || [];
};

export const saveManagedProgress = async (studentId, values) => {
  const response = await axios.put(`${endpoint}/${encodeURIComponent(studentId)}`, values, authConfig());
  return response.data.data;
};

export const fetchStudentActivities = async (studentId) => {
  const response = await axios.get(`${endpoint}/${encodeURIComponent(studentId)}/activities`, authConfig());
  return response.data.data || [];
};

export const createStudentActivity = async (studentId, values) => {
  const response = await axios.post(`${endpoint}/${encodeURIComponent(studentId)}/activities`, values, authConfig());
  return response.data.data;
};
