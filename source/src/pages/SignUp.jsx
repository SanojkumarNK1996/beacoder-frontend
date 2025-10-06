import React, { useState } from "react";
import SpinningCircleLoader from "../components/SpinningCircleLoader";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Signup Success Toast
const SignupToast = ({ show }) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(90deg, #367cfe 0%, #5ab1ff 100%)",
        color: "#fff",
        padding: "18px 40px",
        borderRadius: "24px",
        boxShadow: "0 4px 24px rgba(54,124,254,0.18)",
        fontSize: "18px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 10001,
        animation: "fadeIn 0.3s",
      }}
    >
      <span style={{ fontSize: "24px" }}>✔</span>
      Signup Successful! Redirecting to login...
    </div>
  );
};

// ❌ Signup Failed Toast
const SignupFailedToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(90deg, #fe5f5f 0%, #ffb6b6 100%)",
        color: "#fff",
        padding: "18px 40px",
        borderRadius: "24px",
        boxShadow: "0 4px 24px rgba(254,95,95,0.18)",
        fontSize: "18px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 10001,
      }}
    >
      <span style={{ fontSize: "24px" }}>✖</span>
      {message}
    </div>
  );
};

const SignUpSplit = () => {
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
    // Mandatory field validation
    if (!fields.fullName || !fields.phone || !fields.email || !fields.password) {
      setShowFailedToast(true);
      setErrorMsg("Please fill all mandatory fields: Name, Phone, Email, Password.");
      setTimeout(() => setShowFailedToast(false), 2500);
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      setShowFailedToast(true);
      setErrorMsg("Passwords do not match.");
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
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/api/v1/auth/signup`, payload)
      .then((response) => {
        setShowToast(true);
        setLoading(false);
        setTimeout(() => {
          setShowToast(false);
          navigate("/login");
        }, 1800);
      })
      .catch((error) => {
        setLoading(false);
        const message =
          error.response?.data?.msg ||
          (error.response?.status === 400
            ? "Invalid credentials. Please check your email or password."
            : "Something went wrong. Please try again later.");
        setErrorMsg(message);
        setShowFailedToast(true);
        setTimeout(() => {
          setShowFailedToast(false);
        }, 3000);
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(120deg, #f6f8fc 0%, #e3eafc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Montserrat, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          background: "none",
          gap: "0px",
        }}
      >
        {/* 🌟 Left Section */}
        <div
          style={{
            width: "700px",
            height: "700px",
            background: "linear-gradient(120deg, #367cfe 0%, #6ad7ff 100%)",
            borderRadius: "32px 0 0 32px",
            boxShadow: "0 8px 32px rgba(54,124,254,0.14)",
            padding: "64px 56px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              marginBottom: "22px",
              letterSpacing: "2px",
              textShadow: "0 2px 16px #367cfe55",
              textAlign: "center",
            }}
          >
            Every expert was once a beginner
          </h1>
          <p
            style={{
              fontSize: "1.4rem",
              fontWeight: 600,
              marginBottom: "38px",
              opacity: 0.98,
              textAlign: "center",
              maxWidth: "440px",
              lineHeight: 1.4,
            }}
          >
            start your journey today
          </p>
        </div>

        {/* 📝 Right Section - Signup Form */}
        <div
          style={{
            width: "700px",
            height: "700px",
            background: "#fff",
            borderRadius: "0 32px 32px 0",
            boxShadow: "0 8px 32px rgba(54,124,254,0.14)",
            padding: "64px 56px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#367cfe",
              marginBottom: "12px",
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            Create an Account
          </h2>

          <form
            onSubmit={handleSignup}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              width: "100%",
              maxWidth: "340px",
            }}
          >
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
                      ? "College / Organization"
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
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid #e3eafc",
                  fontSize: "16px",
                  outline: "none",
                  background: "#f6f8fc",
                }}
              />
            ))}

            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #367cfe 0%, #5ab1ff 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "18px",
                padding: "14px 0",
                fontSize: "18px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px",
                opacity: loading ? 0.7 : 1,
                position: "relative",
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <SpinningCircleLoader size={22} color="#367cfe" />
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div style={{ marginTop: "14px", fontSize: "15px", color: "#444" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#367cfe", fontWeight: 700 }}>
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Toast Components */}
      <SignupToast show={showToast} />
      <SignupFailedToast show={showFailedToast} message={errorMsg} />
      <style>{`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
      @keyframes dotFlashing {
        0% { opacity: 0.2; }
        50% { opacity: 1; }
        100% { opacity: 0.2; }
      }
  `}</style>
    </div>
  );
};

export default SignUpSplit;
