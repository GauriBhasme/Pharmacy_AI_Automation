import { colors } from "../../theme/colors";

export default function Header() {
  return (
    <div
      style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: colors.background,
      }}
    >
      <input
        placeholder="Search medicines..."
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          padding: "8px 12px",
          color: colors.textPrimary,
        }}
      />
    </div>
  );
}