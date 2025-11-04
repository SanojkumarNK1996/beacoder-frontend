import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SpinningCircleLoader from "../../components/SpinningCircleLoader";
import { loginUser } from "../../api/Login";
import "./Login.css";

const LoginToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="toast success">
      <span className="toast-icon">✔</span>
      Login Successful! Redirecting to homepage...
    </div>
  );
};

const LoginFailedToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="toast failed">
      <span className="toast-icon">✖</span>
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

    try {
      const data = await loginUser(email, password);

      if (data && data.token) {
        localStorage.setItem("authToken", data.token);
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/homepage");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Unable to login");
      setShowFailedToast(true);
      setTimeout(() => setShowFailedToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginToast show={showToast} />
      <LoginFailedToast show={showFailedToast} message={errorMsg} />

      <div className="login-container">
        <div className="login-card">
          {/* RIGHT (form) appears first on mobile via CSS order */}
          <section className="login-right" aria-labelledby="login-heading">
            <h2 id="login-heading">Login</h2>

            <form onSubmit={formSubmit} className="login-form" noValidate>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={hoveredInput === "email" ? "input active" : "input"}
                  onFocus={() => setHoveredInput("email")}
                  onBlur={() => setHoveredInput(null)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={hoveredInput === "password" ? "input active" : "input"}
                  onFocus={() => setHoveredInput("password")}
                  onBlur={() => setHoveredInput(null)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`login-btn ${hoveredButton ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="loading-wrapper">
                    <SpinningCircleLoader />
                    <span>Logging In...</span>
                  </span>
                ) : (
                  "Login"
                )}
              </button>

              <div className="signup-link">
                Don't have an account?
                <Link to="/signup" className="signup-text">
                  Sign Up
                </Link>
              </div>
            </form>
          </section>

          {/* LEFT — decorative, minimal on mobile */}
          <aside className="login-left" aria-hidden="true">
            <div className="left-inner">
              <h1>Bright Ideas Start Here</h1>
              <p className="quote">{quote}</p>

              <div className="lightbulb" aria-hidden="true">
                {/* simple svg with subtle animation */}
                <svg width="96" height="96" viewBox="0 0 120 120" fill="none" className="glow">
                  <ellipse cx="60" cy="60" rx="28" ry="28" fill="#e3eafc" />
                  <rect x="52" y="88" width="16" height="12" rx="4" fill="#367cfe" />
                  <circle cx="60" cy="60" r="18" fill="#fff" />
                </svg>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Login;
