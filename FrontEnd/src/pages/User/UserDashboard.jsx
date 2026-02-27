import DashboardLayout from "../../components/layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/dashboard/Card";
import Badge from "../../components/dashboard/Badge";
import { colors } from "../../theme/colors";

export default function UserDashboard() {
  return (
    <DashboardLayout>
      <h1 style={{ color: colors.textPrimary }}>User Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <StatCard title="Active Prescriptions" value="12" extra="+2 this month" />
        <StatCard title="Pending Refills" value="2" />
        <StatCard title="Next Delivery" value="4 Days" />
      </div>

      <h2 style={{ color: colors.textPrimary, marginTop: "40px" }}>
        Active Medications
      </h2>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: colors.textPrimary }}>Lisinopril</h3>
            <p style={{ color: colors.textSecondary }}>10mg Daily</p>
          </div>
          <Badge label="EXHAUSTED" color={colors.red} />
        </div>
      </Card>
    </DashboardLayout>
  );
}