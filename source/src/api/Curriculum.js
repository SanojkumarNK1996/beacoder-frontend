import axios from "axios";

const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/v1/curriculum`;

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export const fetchCurriculum = async () => {
  const response = await axios.get(baseUrl, authConfig());
  return response.data.data;
};

export const fetchCurriculumRoadmap = async () => {
  const response = await axios.get(`${baseUrl}/roadmap`, authConfig());
  return response.data.data;
};
