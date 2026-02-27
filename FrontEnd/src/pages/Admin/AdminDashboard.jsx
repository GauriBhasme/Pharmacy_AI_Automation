import DashboardLayout from "../../components/layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/dashboard/Card";
import { colors } from "../../theme/colors";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1 style={{ color: colors.textPrimary }}>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <StatCard title="Total SKU" value="1,240" extra="+2.4% MoM" />
        <StatCard title="Low Stock Alerts" value="12" />
        <StatCard title="Pending Restocks" value="08" />
      </div>

      <Card>
        <h3 style={{ color: colors.textPrimary }}>System Activity</h3>
        <p style={{ color: colors.textSecondary }}>
          AI agent flagged 2 prescription mismatches today.
        </p>
      </Card>
    </DashboardLayout>
  );
}
// 