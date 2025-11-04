import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    // ✅ Smooth scroll to section
  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setOpen(false); // close menu on mobile
    }
  };

  const navStyle = {
    background: "linear-gradient(90deg, #0a1931, #185adb, #367cfe)",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const logoContainer = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer", // ✅ show hand on hover
  };

  const logoText1 = {
    fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
    fontWeight: "900",
    color: "#367cfe",
  };

  const logoText2 = {
    fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
    fontWeight: "900",
    color: "#fff",
  };

  const logoText3 = {
    fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
    fontWeight: "900",
    color: "#ffb74d",
  };

  const menuMobile = {
    display: open ? "flex" : "none",
    flexDirection: "column",
    gap: "15px",
    position: "absolute",
    top: "70px",
    right: "25px",
    background: "#0072FF",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  };

  const menuDesktop = {
    display: "flex",
    gap: "35px",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "clamp(1rem, 1.6vw, 1.25rem)", // 👈 scales smoothly
    transition: "color 0.3s",
     cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: "#fff",
    color: "#0072FF",
    border: "none",
    borderRadius: "25px",
    padding: "10px 22px",
    fontWeight: "700",
    fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
    cursor: "pointer",
    transition: "0.3s",
  };

  const hamburger = {
    display: isMobile ? "flex" : "none",
    flexDirection: "column",
    cursor: "pointer",
  };

  const bar = {
    height: "3px",
    width: "25px",
    backgroundColor: "#fff",
    margin: "3px 0",
    borderRadius: "2px",
  };

  return (
    <nav style={navStyle}>
      {/* ✅ Logo */}
      <div style={logoContainer} onClick={() => handleScroll("home")}>
        <span style={logoText1}>Learn</span>
        <span style={logoText2}>2</span>
        <span style={logoText3}>Code</span>
      </div>

      {/* ✅ Menu */}
      <div style={isMobile ? menuMobile : menuDesktop}>
        <span style={linkStyle} onClick={() => handleScroll("home")}>
          Home
        </span>
        <span style={linkStyle} onClick={() => handleScroll("courses")}>
          Courses
        </span>
        <span style={linkStyle} onClick={() => handleScroll("features")}>
          Features
        </span>
        <span style={linkStyle} onClick={() => handleScroll("contact")}>
          Contact
        </span>
       <button
          style={buttonStyle}
          onClick={() => {
            setOpen(false);
            navigate("/signup");
          }}
        >
          Get Started
        </button>
      </div>

      {/* ✅ Hamburger for mobile */}
      <div style={hamburger} onClick={() => setOpen(!open)}>
        <div style={bar}></div>
        <div style={bar}></div>
        <div style={bar}></div>
      </div>
    </nav>
  );
};

export default Navbar;
