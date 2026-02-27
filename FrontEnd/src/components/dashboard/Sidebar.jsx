import { colors } from "../../theme/colors";

export default function Sidebar() {
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

      <div style={{ marginTop: "30px", color: colors.textSecondary }}>
        <p>Dashboard</p>
        <p>Inventory</p>
        <p>Agents</p>
        <p>Notifications</p>
      </div>
    </div>
  );
}