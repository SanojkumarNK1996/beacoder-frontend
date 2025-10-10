import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Handles user signup API request
 * @param {Object} payload - user signup data
 * @returns {Promise<Object>} response data
 */
export const signupUser = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/auth/signup`, payload);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.msg ||
      (error.response?.status === 400
        ? "Invalid credentials. Please check your email or password."
        : "Something went wrong. Please try again later.");

    // Rethrow with a clean message
    throw new Error(message);
  }
};
