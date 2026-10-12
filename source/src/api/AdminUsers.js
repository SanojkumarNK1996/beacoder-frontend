import axios from "axios";

const endpoint = `${import.meta.env.VITE_BASE_URL}/api/v1/admin/users`;

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

export const fetchAdminUsers = async (search = "") => {
  const response = await axios.get(endpoint, {
    ...authConfig(),
    params: search ? { search } : {},
  });
  const result = response.data?.data;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.users)) return result.users;
  if (Array.isArray(response.data?.users)) return response.data.users;
  return [];
};

export const updateAdminUser = async (userId, updates) => {
  const response = await axios.put(`${endpoint}/${encodeURIComponent(userId)}`, updates, authConfig());
  return response.data?.data ?? response.data;
};
