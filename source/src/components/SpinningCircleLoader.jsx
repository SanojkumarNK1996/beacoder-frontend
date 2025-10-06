// Spinning Circle Loader Component
const SpinningCircleLoader = () => (
  <>
    <span style={{
      width: "28px",
      height: "28px",
      border: "4px solid #fff",
      borderTop: "4px solid #367cfe",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
      marginRight: "10px"
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </>
);

export default SpinningCircleLoader;