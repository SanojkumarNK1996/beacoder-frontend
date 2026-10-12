import axios from "axios";

export const fetchStudentProgress = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const fetchMyStudentActivities = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/progress/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data || [];
};

export const fetchMyAssignmentStats = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/assignments/my-assignments/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
