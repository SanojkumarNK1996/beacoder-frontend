import axios from "axios";

export const fetchMentors = async () => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/mentors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mentors = response.data?.data;
  if (!Array.isArray(mentors)) {
    throw new Error("Mentor response has an unexpected format");
  }
  return mentors;
};
