import Card from "./Card";
import { colors } from "../../theme/colors";

export default function StatCard({ title, value, extra }) {
  return (
    <Card>
      <h4 style={{ color: colors.textSecondary }}>{title}</h4>
      <h2 style={{ color: colors.textPrimary, margin: "10px 0" }}>
        {value}
      </h2>
      {extra && <p style={{ color: colors.green }}>{extra}</p>}
    </Card>
  );
}