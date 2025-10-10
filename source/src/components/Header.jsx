export const Header = ({userName}) => (
    <div
        style={{
            background: "#367cfe",
            borderRadius: "20px",
            height: "136px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "10px",
            padding: "36px 30px",
        }}
    >
        <span style={{ fontSize: "46px", fontWeight: "700", color: "#fff" }}>
           {`Hello! ${userName}`}
        </span>
        <span style={{ fontSize: "20px", fontWeight: "500", color: "#fff" }}>
            Ready to learn coding? Learn2Code makes it easy, fun, and perfect for your future!
        </span>
    </div>
);