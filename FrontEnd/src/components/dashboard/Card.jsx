import { colors } from "../../theme/colors";

export default function Card({ children }) {
  return (
    <div
      style={{
        background: colors.card,
        padding: "20px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}