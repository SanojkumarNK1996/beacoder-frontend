export const Achievements = ({ achievements }) => {
    const hasBadges = achievements && achievements.length > 0;

    return (
        <div style={{ width: "100%" }}>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#1e1e1e" }}>
                Unlocked Achievements
            </span>

            {!hasBadges ? (
                <div
                    style={{
                        marginTop: "14px",
                        background: "linear-gradient(135deg, #e3f2fd, #e8f5e9)",
                        borderRadius: "16px",
                        padding: "20px",
                        color: "#1f4e79",
                        border: "1px dashed #7da9c8",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "30px" }}>✨</div>
                    <p style={{ margin: "10px 0 0", fontSize: "16px", fontWeight: "600" }}>
                        No badges yet.
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#4e6f8f" }}>
                        Start learning to unlock your first badge!
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                    {achievements.map((ach) => (
                        <div
                            key={ach.id || ach.title}
                            style={{
                                background: "#fefefe",
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "14px 16px",
                                border: "1px solid rgba(25, 121, 218, 0.16)",
                                boxShadow: "0 8px 18px rgba(28, 118, 216, 0.08)",
                            }}
                        >
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #d1e9ff",
                                    borderRadius: "10px",
                                    height: "44px",
                                    width: "44px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span style={{ fontSize: "24px" }}>{ach.icon}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "#12395f" }}>
                                    {ach.title}
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: "500", color: "#4f6f91" }}>
                                    {ach.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};