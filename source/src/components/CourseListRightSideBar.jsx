import { Achievements } from "./Achievments";

export const CourseListRightSidebar = ({ achievements }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "20px",
            width: "321px",
            minWidth: "321px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            overflow: "hidden",
            padding: "20px",
            gap: "20px",
            marginTop: "0px",
        }}
    >
        <Achievements achievements={achievements} /> {/* Pass achievements prop */}
    </div>
);