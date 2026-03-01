import { Link, useLocation } from "react-router-dom";
import { colors } from "../../theme/colors";

export default function Sidebar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    display: "block",
    padding: "8px 10px",
    borderRadius: "6px",
    marginBottom: "6px",
    color: location.pathname === path ? colors.textPrimary : colors.textSecondary,
    background: location.pathname === path ? "#1F2937" : "transparent",
    textDecoration: "none",
    fontWeight: location.pathname === path ? 600 : 400,
  });

  return (
    <div
      style={{
        width: "240px",
        background: "#0F172A",
        padding: "20px",
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <h2 style={{ color: colors.primary }}>Pharmacy AI</h2>

      <div style={{ marginTop: "30px" }}>
        <Link to="/dashboard" style={linkStyle("/dashboard")}>
          Dashboard
        </Link>
        <Link to="/chat" style={linkStyle("/chat")}>
          Chat
        </Link>
        <Link to="/profile" style={linkStyle("/profile")}>
          Profile
        </Link>
      </div>
    </div>
  );
}
