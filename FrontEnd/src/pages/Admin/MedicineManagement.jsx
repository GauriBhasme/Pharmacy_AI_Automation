import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/dashboard/Card";
import Badge from "../../components/dashboard/Badge";
import { colors } from "../../theme/colors";

export default function MedicineManagement() {
  return (
    <DashboardLayout>
      <h1 style={{ color: colors.textPrimary }}>Medicine Management</h1>

      <Card>
        <table width="100%" style={{ color: colors.textPrimary }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Name</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Amoxicillin 500mg</td>
              <td>1450</td>
              <td><Badge label="In Stock" color={colors.green} /></td>
            </tr>

            <tr>
              <td>Lisinopril 10mg</td>
              <td>120</td>
              <td><Badge label="Low Stock" color={colors.yellow} /></td>
            </tr>

            <tr>
              <td>Insulin Glargine</td>
              <td>0</td>
              <td><Badge label="Out of Stock" color={colors.red} /></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}