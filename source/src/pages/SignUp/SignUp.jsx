import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpinningCircleLoader from "../../components/SpinningCircleLoader";
import { signupUser } from "../../api/SignUp"; // 👈 Import API call
import "./SignUp.css";

const SignupToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      Signup Successful! Redirecting to login...
    </div>
  );
};

const SignupFailedToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast failed">
      <span className="toast-icon">✖</span>
      {message}
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    fullName: "",
    college: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showToast, setShowToast] = useState(false);
  const [showFailedToast, setShowFailedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fields.fullName || !fields.phone || !fields.email || !fields.password) {
      setErrorMsg("Please fill all mandatory fields: Name, Phone, Email, Password.");
      setShowFailedToast(true);
      setTimeout(() => setShowFailedToast(false), 2500);
      return;
    }

    if (fields.password !== fields.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setShowFailedToast(true);
      setTimeout(() => setShowFailedToast(false), 2500);
      return;
    }

    setLoading(true);

    const payload = {
      name: fields.fullName,
      college: fields.college,
      phone: fields.phone,
      address: fields.address,
      email: fields.email,
      password: fields.password,
    };

    try {
      await signupUser(payload);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/login");
      }, 1800);
    } catch (error) {
      setErrorMsg(error.message);
      setShowFailedToast(true);
      setTimeout(() => setShowFailedToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-left">
          <h1>Every expert was once a beginner</h1>
          <p>start your journey today</p>
        </div>

        <div className="signup-right">
          <h2>Create an Account</h2>
          <form onSubmit={handleSignup}>
            {[
              "fullName",
              "college",
              "phone",
              "address",
              "email",
              "password",
              "confirmPassword",
            ].map((field) => (
              <input
                key={field}
                name={field}
                type={
                  field.includes("password")
                    ? "password"
                    : field === "email"
                    ? "email"
                    : "text"
                }
                placeholder={
                  field === "fullName"
                    ? "Full Name"
                    : field === "college"
                    ? "College / Organization / Not Working"
                    : field === "phone"
                    ? "Phone"
                    : field === "address"
                    ? "Address (optional)"
                    : field === "email"
                    ? "Email"
                    : field === "password"
                    ? "Create Password"
                    : "Confirm Password"
                }
                value={fields[field]}
                onChange={handleChange}
                required={field !== "address"}
              />
            ))}

            <button type="submit" disabled={loading}>
              {loading ? (
                <span className="loading-wrapper">
                  <SpinningCircleLoader size={22} color="#367cfe" />
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="login-text">
              Login
            </Link>
          </div>
        </div>
      </div>

      <SignupToast show={showToast} />
      <SignupFailedToast show={showFailedToast} message={errorMsg} />
    </div>
  );
};

export default SignUp;
