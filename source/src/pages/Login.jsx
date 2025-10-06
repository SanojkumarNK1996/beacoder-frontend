
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import SpinningCircleLoader from "../components/SpinningCircleLoader";

// Toast component for login success
const LoginToast = ({ show }) => {
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
      Login Successful! Redirecting to courses...
    </div>
  );
};

// Toast component for login failed
const LoginFailedToast = ({ show, message }) => {
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
        animation: "fadeIn 0.3s",
      }}
    >
      <span style={{ fontSize: "24px" }}>✖</span>
      {message || "Login Failed! Please check your credentials."}
    </div>
  );
};

const catchyQuotes = [
  "Empower your mind, one lesson at a time.",
  "Unlock your potential. Start learning today!",
  "Knowledge is the passport to your future.",
  "Every click is a step towards success.",
  "Learning never exhausts the mind.",
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hoveredInput, setHoveredInput] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showFailedToast, setShowFailedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const quote = catchyQuotes[Math.floor(Math.random() * catchyQuotes.length)];

  const formSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_BASE_URL}/api/v1/auth/login`, { email, password })
      .then((response) => {
        if (response.data && response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        setShowToast(true);
        setLoading(false);
        setTimeout(() => {
          setShowToast(false);
          navigate("/courses");
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
    <>
      <LoginToast show={showToast} />
      <LoginFailedToast show={showFailedToast} message={errorMsg} />
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
            width: "1400px",
            minHeight: "700px",
            background: "#fff",
            borderRadius: "40px",
            boxShadow: "0 12px 40px rgba(54,124,254,0.14)",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Left Side - Welcome & Quotes */}
          <div
            style={{
              flex: 1.2,
              background: "linear-gradient(120deg, #367cfe 0%, #6ad7ff 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 60px",
              color: "#fff",
              position: "relative",
            }}
          >
            <h1
              style={{
                fontSize: "3.2rem",
                fontWeight: 800,
                marginBottom: "22px",
                letterSpacing: "2px",
                textShadow: "0 2px 16px #367cfe55",
                textAlign: "center",
              }}
            >
              Bright Ideas Start Here
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
              {quote}
            </p>
            {/* Lightbulb Glow Animation */}
            <div style={{ marginBottom: "32px" }}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                style={{ animation: "glow 2s infinite" }}
              >
                <ellipse cx="60" cy="60" rx="28" ry="28" fill="#e3eafc" />
                <rect x="52" y="88" width="16" height="12" rx="4" fill="#367cfe" />
                <circle cx="60" cy="60" r="18" fill="#fff" />
                <style>
                  {`
                    @keyframes glow {
                      0%, 100% { filter: drop-shadow(0 0 0px #6ad7ff);}
                      50% { filter: drop-shadow(0 0 16px #6ad7ff);}
                    }
                  `}
                </style>
              </svg>
            </div>
          </div>
          {/* Right Side - Login Form */}
          <div
            style={{
              flex: 1,
              padding: "80px 70px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "40px",
              alignItems: "center",
              background: "linear-gradient(120deg, #f6f8fc 0%, #e3eafc 100%)",
            }}
          >
            <h2
              style={{
                fontSize: "2.8rem",
                fontWeight: 700,
                color: "#367cfe",
                marginBottom: "18px",
                letterSpacing: "1px",
              }}
            >
              Login
            </h2>
            <form
              onSubmit={formSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "36px",
                width: "100%",
                maxWidth: "480px",
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: "10px",
                    display: "block",
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "22px 28px",
                    borderRadius: "18px",
                    border:
                      hoveredInput === "email"
                        ? "2.5px solid #367cfe"
                        : "2px solid #e3eafc",
                    fontSize: "22px",
                    fontWeight: 500,
                    outline: "none",
                    transition: "border 0.2s, box-shadow 0.2s",
                    marginBottom: "2px",
                    background:
                      "linear-gradient(90deg, #e3edff 0%, #f9f9f9 100%)",
                    boxShadow:
                      hoveredInput === "email"
                        ? "0 2px 12px #e3eafc"
                        : "none",
                  }}
                  onFocus={() => setHoveredInput("email")}
                  onBlur={() => setHoveredInput(null)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: "10px",
                    display: "block",
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "22px 28px",
                    borderRadius: "18px",
                    border:
                      hoveredInput === "password"
                        ? "2.5px solid #367cfe"
                        : "2px solid #e3eafc",
                    fontSize: "22px",
                    fontWeight: 500,
                    outline: "none",
                    transition: "border 0.2s, box-shadow 0.2s",
                    background:
                      "linear-gradient(90deg, #e3edff 0%, #f9f9f9 100%)",
                    boxShadow:
                      hoveredInput === "password"
                        ? "0 2px 12px #e3eafc"
                        : "none",
                  }}
                  onFocus={() => setHoveredInput("password")}
                  onBlur={() => setHoveredInput(null)}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: hoveredButton
                    ? "linear-gradient(90deg, #367cfe 0%, #5ab1ff 100%)"
                    : "#367cfe",
                  color: "#fff",
                  border: "none",
                  borderRadius: "32px",
                  padding: "22px 0",
                  fontSize: "26px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: hoveredButton
                    ? "0 4px 16px rgba(54,124,254,0.18)"
                    : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                  marginTop: "18px",
                  marginBottom: "14px",
                  letterSpacing: "1px",
                  opacity: loading ? 0.7 : 1,
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <SpinningCircleLoader />
                    <span style={{ fontWeight: 600, fontSize: "22px" }}>Logging In...</span>
                  </span>
                ) : (
                  "Login"
                )}
              </button>
              <style>{`
    @keyframes dotFlashing {
      0% { opacity: 0.2; }
      50% { opacity: 1; }
      100% { opacity: 0.2; }
    }
  `}</style>
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "18px",
                  color: "#444",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Do not have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "#367cfe",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginLeft: "4px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  SignUp
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
