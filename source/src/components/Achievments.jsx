export const Achievements = ({ achievements }) => (
    <div style={{ width: "100%" }}>
        <span style={{ fontSize: "20px", fontWeight: "600", color: "#1e1e1e" }}>
            Unlocked Achievements
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
            {achievements.map((ach, idx) => (
                <div
                    key={idx}
                    style={{
                        background: "#f5f5f5",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            border: "0.7px solid #ffb74d",
                            borderRadius: "8.4px",
                            height: "40.6px",
                            width: "40.6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span style={{ fontSize: "26px" }}>{ach.icon}</span>
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#1e1e1e" }}>
                        {ach.title}
                        <span style={{ fontWeight: "500", fontSize: "15px" }}> – {ach.description}</span>
                    </span>
                </div>
            ))}
        </div>
    </div>
);