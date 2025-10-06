const MainLoader = ({ color = "#e3eafc", accent = "#367cfe", text = "Loading..." }) => (
  <div style={{
    minHeight: "80vh",
    width: "100vw",
    background: "#f6f8fc",
    display: "flex",
    flexDirection: "row",
    fontFamily: "Montserrat, Arial, sans-serif",
  }}>
    {/* Sidebar skeleton */}
    <div style={{
      width: "80px",
      minHeight: "100vh",
      background: color,
      borderRadius: "24px",
      margin: "32px 32px 32px 32px",
      boxShadow: `0 2px 12px ${accent}11`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 0",
      gap: "18px",
      position: "relative",
      overflow: "hidden",
    }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: color,
          marginBottom: "10px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, ${color} 0%, #f6f8fc 50%, ${color} 100%)`,
            animation: "skeletonShimmer 1.2s infinite linear",
            opacity: 0.7,
          }} />
        </div>
      ))}
    </div>
    {/* Main content skeleton */}
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "32px",
      margin: "32px 0",
    }}>
      {/* Header skeleton */}
      <div style={{
        width: "80%",
        height: "48px",
        borderRadius: "16px",
        background: color,
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, ${color} 0%, #f6f8fc 50%, ${color} 100%)`,
          animation: "skeletonShimmer 1.2s infinite linear",
          opacity: 0.7,
        }} />
      </div>
      {/* Content grid skeleton */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "32px",
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            background: color,
            borderRadius: "18px",
            boxShadow: `0 2px 12px ${accent}11`,
            height: "120px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              width: "60%",
              height: "18px",
              borderRadius: "8px",
              background: color,
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: `linear-gradient(90deg, ${color} 0%, #f6f8fc 50%, ${color} 100%)`,
                animation: "skeletonShimmer 1.2s infinite linear",
                opacity: 0.7,
              }} />
            </div>
          </div>
        ))}
      </div>
      {/* Ripple loader centered below skeleton */}
      <div style={{ position: "relative", width: 64, height: 64, margin: "32px auto 0 auto" }}>
        <div style={{
          position: "absolute",
          border: `4px solid ${accent}`,
          opacity: 0.6,
          borderRadius: "50%",
          animation: "ripple 1.2s infinite",
          width: 64,
          height: 64,
          left: 0,
          top: 0,
        }} />
        <div style={{
          position: "absolute",
          border: `4px solid ${accent}`,
          opacity: 1,
          borderRadius: "50%",
          animation: "ripple 1.2s infinite 0.6s",
          width: 64,
          height: 64,
          left: 0,
          top: 0,
        }} />
      </div>
      <div style={{
        fontSize: "1.5rem",
        fontWeight: 700,
        color: accent,
        letterSpacing: "1px",
        textShadow: `0 2px 12px ${accent}22`,
        marginTop: "8px",
        userSelect: "none",
        textAlign: "center",
      }}>
        {text}
      </div>
    </div>
    <style>{`
      @keyframes skeletonShimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes ripple {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `}</style>
  </div>
);

export default MainLoader;
