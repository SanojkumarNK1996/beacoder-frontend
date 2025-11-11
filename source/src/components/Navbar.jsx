import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
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
    minHeight: "80px", // ✅ ensures consistent height and vertical centering
  };

  const logoContainer = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "2px",
    cursor: "pointer",
  };

  const logoText1 = { fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 900, color: "#367cfe" };
  const logoText2 = { fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 900, color: "#fff" };
  const logoText3 = { fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 900, color: "#ffb74d" };

  const menuMobile = {
    display: open ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    position: "absolute",
    top: "75px",
    right: "25px",
    background: "#0072FF",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  };

  const menuDesktop = {
    display: "flex",
    alignItems: "center",
    gap: "35px",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
    transition: "color 0.3s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center", // ✅ ensures link text aligns vertically with buttons
  };

  const buttonStyle = {
    backgroundColor: "#fff",
    color: "#0072FF",
    border: "none",
    borderRadius: "30px",
    padding: "clamp(12px, 2vw, 16px) clamp(30px, 4vw, 45px)",
    fontWeight: 600,
    fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
    cursor: "pointer",
    transition: "0.4s",
  };

  const hamburger = {
    display: isMobile ? "flex" : "none",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
        <span style={logoText1}>Be</span>
        <span style={logoText2}>A</span>
        <span style={logoText3}>Coder</span>
      </div>

      {/* ✅ Menu */}
      <div style={isMobile ? menuMobile : menuDesktop}>
        <span style={linkStyle} onClick={() => handleScroll("home")}>Home</span>
        <span style={linkStyle} onClick={() => handleScroll("courses")}>Courses</span>
        <span style={linkStyle} onClick={() => handleScroll("features")}>Features</span>
        <span style={linkStyle} onClick={() => handleScroll("contact")}>Contact</span>

   <motion.button
  onClick={() => handleScroll("membership")}
  whileHover={{
    scale: 1.06,
    backgroundColor: "#FFD700",
    color: "#fff",
    boxShadow: "0 8px 25px rgba(255, 215, 0, 0.6)",
    borderColor: "#FFD700",
  }}
  whileTap={{ scale: 0.95 }}
  style={{
    backgroundColor: "transparent",
    color: "#fff",
    border: "2px solid transparent",
    padding: "clamp(8px, 2vw, 12px) clamp(16px, 3vw, 28px)",
    borderRadius: "35px",
    fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)", // 👈 slightly larger text
    cursor: "pointer",
    fontWeight: 700,
    transition: "all 0.4s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
  }}
>
  Membership
</motion.button>


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
