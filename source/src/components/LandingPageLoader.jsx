const LandingPageLoader = ({ accent = "#367cfe", text = "Loading..." }) => (
<div
    style={{
      height: "100vh",
      width: "100vw",
      background: "#f6f8fc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Montserrat, Arial, sans-serif",
    }}
  >
    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: accent,
            animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
    <div
      style={{
        marginTop: "20px",
        fontSize: "1.4rem",
        fontWeight: 600,
        color: accent,
        letterSpacing: "1px",
      }}
    >
      {text}
    </div>

    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.6; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

export default LandingPageLoader;
