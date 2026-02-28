import DashboardLayout from "../../components/layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/dashboard/Card";
import Badge from "../../components/dashboard/Badge";
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/user/dashboard", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                });
                setDashboard(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    return (
        <DashboardLayout>
            <h1 style={{ color: colors.textPrimary }}>User Dashboard</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                    <StatCard title="Total Orders" value={dashboard.totalOrders} />
                    {/* Add more StatCards for other dynamic data if needed */}
                </div>
            )}

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