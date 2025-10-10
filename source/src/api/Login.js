import axios from "axios";

/**
 * Logs in the user by sending email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Response data
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/v1/auth/login`,
      { email, password }
    );
    return response.data;
  } catch (error) {
    // Custom error handling
    const message =
      error.response?.data?.msg ||
      (error.response?.status === 400
        ? "Invalid credentials. Please check your email or password."
        : "Something went wrong. Please try again later.");

    throw new Error(message);
  }
};
