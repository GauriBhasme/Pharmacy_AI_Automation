import DashboardLayout from "../../components/layouts/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/dashboard/Card";
import Badge from "../../components/dashboard/Badge";
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                
                console.log('🔍 Token check:', token ? '✅ Found' : '❌ Not found');
                
                if (!token) {
                    setError("No authentication token found. Please login again.");
                    setLoading(false);
                    return;
                }

                console.log('📊 Fetching user dashboard...');
                console.log('   URL: http://localhost:5000/api/user/dashboard');
                console.log('   Token: ' + token.substring(0, 20) + '...');

                const res = await axios.get(
                    "http://localhost:5000/api/user/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        withCredentials: true,
                    }
                );
                
                console.log('✅ Dashboard API Response:', res.data);
                console.log('   Total Orders:', res.data.totalOrders);
                console.log('   Active Medications:', res.data.activeMedications?.length || 0);
                console.log('   Refill Alerts:', res.data.refillAlerts?.length || 0);
                console.log('   Total Chats:', res.data.totalChats);
                
                setDashboard(res.data);
                setError("");
            } catch (err) {
                console.error('❌ Dashboard fetch error!');
                console.error('   Status:', err.response?.status);
                console.error('   Message:', err.response?.data?.message);
                console.error('   Error:', err.response?.data?.error);
                console.error('   Full error:', err);
                
                const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load dashboard";
                setError(errorMessage);
                setDashboard(null);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    return (
        <DashboardLayout showSidebar={false}>
            <div style={{ padding: "20px 0" }}>
                <h1 style={{ color: colors.textPrimary, marginBottom: "25px" }}>
                    Welcome Back 👋
                </h1>

                {/* ================== DEBUG PANEL ================== */}
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#2a2a3e",
                    borderRadius: "8px",
                    fontSize: "12px",
                    borderLeft: "4px solid " + colors.accentBlue,
                    display: localStorage.getItem("token") ? "none" : "block"
                }}>
                    <p style={{ color: colors.orange, margin: "0 0 10px 0" }}>
                        🔍 Debug Info (hidden when logged in):
                    </p>
                    <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                        Token exists: {localStorage.getItem("token") ? "✅ Yes" : "❌ No"}
                    </p>
                    <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                        Error: {error || "None"}
                    </p>
                    <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                        Dashboard data: {dashboard ? "✅ Loaded" : "❌ Not loaded"}
                    </p>
                    <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                        Check browser console (F12) for detailed logs
                    </p>
                </div>

                {/* ================== STATS SECTION ================== */}
                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.accentBlue }} />
                        <p style={{ color: colors.textSecondary, marginLeft: "15px" }}>Loading dashboard...</p>
                    </div>
                ) : error ? (
                    <Card style={{ backgroundColor: "#5a3a3a", color: "#ffcccc" }}>
                        <p style={{ color: "#ffcccc" }}>❌ {error}</p>
                    </Card>
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
                            title="Low Stock Alerts"
                            value={dashboard?.lowStockAlerts?.length || 0}
                        />
                        <StatCard
                            title="AI Interactions"
                            value={dashboard?.totalChats || 0}
                        />
                    </div>
                )}

                {/* ================== LOW STOCK ALERTS ================== */}
                <h2
                    style={{
                        color: colors.textPrimary,
                        marginBottom: "15px",
                    }}
                >
                    ⚠️ Low Stock Alerts
                </h2>

                {dashboard?.lowStockAlerts?.length > 0 ? (
                    dashboard.lowStockAlerts.map((alert, index) => (
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
                                        {alert.medicine_name}
                                    </h3>
                                    <p style={{ color: colors.textSecondary }}>
                                        Current Stock: <strong style={{ color: colors.orange }}>{alert.current_stock} units</strong> • Price: ₹{alert.price}
                                    </p>
                                </div>
                                <Badge label="LOW STOCK" color={colors.orange} />
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ color: colors.textSecondary }}>
                            ✅ All your medicines have good stock levels.
                        </p>
                    </Card>
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
                                        {alert.medicine_name}
                                    </h3>
                                    <p style={{ color: colors.textSecondary }}>
                                        Ordered {alert.days_since_order} days ago — time to refill
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
                                        {med.medicine_name}
                                    </h3>
                                    <p style={{ color: colors.textSecondary }}>
                                        Quantity: {med.quantity} | Price: ₹{med.total_price}
                                    </p>
                                </div>
                                <Badge label="ACTIVE" color={colors.green} />
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

                <Card>
                    <p style={{ color: colors.textSecondary }}>
                        Total AI Interactions: <strong style={{ color: colors.textPrimary }}>{dashboard?.totalChats || 0}</strong>
                    </p>
                    <p style={{ color: colors.textSecondary, marginTop: "10px" }}>
                        Visit the chat page to interact with the AI pharmacist assistant.
                    </p>
                    <Link 
                        to="/chat" 
                        style={{
                            display: "inline-block",
                            marginTop: "10px",
                            padding: "8px 16px",
                            backgroundColor: colors.accentBlue,
                            color: "white",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontSize: "14px"
                        }}
                    >
                        Open Chat →
                    </Link>
                </Card>
            </div>
        </DashboardLayout>
    );
}
