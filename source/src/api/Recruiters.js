import axios from "axios";

const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/recruiters`;

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export const fetchRecruiters = async (view) => {
  const response = await axios.get(endpoint, {
    ...authConfig(),
    params: view === "mine" ? { view } : {},
  });
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const createRecruiter = async (details) => {
  const response = await axios.post(endpoint, details, authConfig());
  return response.data?.data;
};

export const updateRecruiter = async (id, details) => {
  const response = await axios.put(`${endpoint}/${encodeURIComponent(id)}`, details, authConfig());
  return response.data?.data;
};

export const deleteRecruiter = async (id) => {
  await axios.delete(`${endpoint}/${encodeURIComponent(id)}`, authConfig());
};
