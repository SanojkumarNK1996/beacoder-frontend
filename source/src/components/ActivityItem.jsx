// ActivityItem component
export const ActivityItem = ({ img, title, date }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
        }}
    >
        <div
            style={{
                background: "#f0f6ff",
                height: "53px",
                width: "53px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <img
                src={img}
                alt="Activity"
                style={{ height: "30px", width: "30px", objectFit: "contain" }}
            />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#000" }}>
                {title}
            </span>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#5d5d5d" }}>
                {date}
            </span>
        </div>
    </div>
);