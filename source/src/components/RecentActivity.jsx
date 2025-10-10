import { ActivityItem } from "./ActivityItem";

export const RecentActivity = ({ activities = initialActivities }) => (
    <div style={{ width: "100%" }}>
        <span style={{ fontSize: "20px", fontWeight: "600", color: "#1e1e1e" }}>
            Recent Activity
        </span>
        <div
            style={{
                background: "#f8f8f8",
                borderRadius: "20px",
                padding: "16px",
                marginTop: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
            }}
        >
            {activities.map((activity, idx) => (
                <ActivityItem
                    key={idx}
                    img={activity.img}
                    title={activity.title}
                    date={activity.date}
                />
            ))}
        </div>
        <span
            style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#367cfe",
                marginTop: "8px",
                display: "block",
                textAlign: "right",
                cursor: "pointer",
            }}
        >
            View All
        </span>
    </div>
);