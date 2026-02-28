import DashboardLayout from "../../components/layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/dashboard/Card";
import Badge from "../../components/dashboard/Badge";
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

const token = localStorage.getItem("token");

export default function UserDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/user/dashboard",
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        withCredentials: true,
                    }
                );
                setDashboard(res.data);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    return (
        <DashboardLayout>
            <div style={{ padding: "20px 0" }}>
                <h1 style={{ color: colors.textPrimary, marginBottom: "25px" }}>
                    Welcome Back 👋
                </h1>

                {/* ================== STATS SECTION ================== */}
                {loading ? (
                    <p>Loading dashboard...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "20px",
                            marginBottom: "40px",
                        }}
                    >
                        <StatCard
                            title="Total Orders"
                            value={dashboard?.totalOrders || 0}
                        />
                        <StatCard
                            title="Active Medications"
                            value={dashboard?.activeMedications?.length || 0}
                        />
                        <StatCard
                            title="Refill Alerts"
                            value={dashboard?.refillAlerts?.length || 0}
                        />
                        <StatCard
                            title="AI Interactions"
                            value={dashboard?.totalChats || 0}
                        />
                    </div>
                )}

                {/* ================== REFILL ALERTS ================== */}
                <h2
                    style={{
                        color: colors.textPrimary,
                        marginBottom: "15px",
                    }}
                >
                    🚨 AI Refill Alerts
                </h2>

                {dashboard?.refillAlerts?.length > 0 ? (
                    dashboard.refillAlerts.map((alert, index) => (
                        <Card key={index}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <h3 style={{ color: colors.textPrimary }}>
                                        {alert.name}
                                    </h3>
                                    <p style={{ color: colors.textSecondary }}>
                                        Running low — reorder recommended
                                    </p>
                                </div>
                                <Badge label="REFILL SOON" color={colors.orange} />
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ color: colors.textSecondary }}>
                            No refill alerts. You're all set 👍
                        </p>
                    </Card>
                )}

                {/* ================== ACTIVE MEDICATIONS ================== */}
                <h2
                    style={{
                        color: colors.textPrimary,
                        marginTop: "40px",
                        marginBottom: "15px",
                    }}
                >
                    💊 Active Medications
                </h2>

                {dashboard?.activeMedications?.length > 0 ? (
                    dashboard.activeMedications.map((med, index) => (
                        <Card key={index}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <h3 style={{ color: colors.textPrimary }}>
                                        {med.name}
                                    </h3>
                                    <p style={{ color: colors.textSecondary }}>
                                        {med.dosage}
                                    </p>
                                </div>

                                {med.status === "EXHAUSTED" ? (
                                    <Badge label="EXHAUSTED" color={colors.red} />
                                ) : med.status === "LOW" ? (
                                    <Badge label="LOW STOCK" color={colors.orange} />
                                ) : (
                                    <Badge label="ACTIVE" color={colors.green} />
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ color: colors.textSecondary }}>
                            No active medications yet.
                        </p>
                    </Card>
                )}

                {/* ================== RECENT AI ACTIVITY ================== */}
                <h2
                    style={{
                        color: colors.textPrimary,
                        marginTop: "40px",
                        marginBottom: "15px",
                    }}
                >
                    🤖 Recent AI Activity
                </h2>

                {dashboard?.recentChats?.length > 0 ? (
                    dashboard.recentChats.map((chat, index) => (
                        <Card key={index}>
                            <p style={{ color: colors.textSecondary }}>
                                "{chat.preview}"
                            </p>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ color: colors.textSecondary }}>
                            No recent AI conversations.
                        </p>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}