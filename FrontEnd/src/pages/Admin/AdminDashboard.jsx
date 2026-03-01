import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockAlerts: 0,
    ordersToday: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.data) {
        setStats({
          totalMedicines: res.data.totalMedicines || 0,
          lowStockAlerts: res.data.lowStockAlerts || 0,
          ordersToday: res.data.ordersToday || 0,
          totalOrders: res.data.totalOrders || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-red-900 border border-red-700 p-4 rounded-lg text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Medicines" value={stats.totalMedicines.toLocaleString()} change="+2.4%" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockAlerts} change="-1.2%" />
        <StatCard title="Orders Today" value={stats.ordersToday} change="+5.6%" />
        <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} change="+1.2%" />
      </div>

      {/* Management Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <ManagementCard
          title="Inventory Management"
          description="Manage medicines, stock levels, and restocking alerts."
          link="/admin/medicines"
        />

        <ManagementCard
          title="Agent Tracking"
          description="Monitor AI agents, performance metrics, and alerts."
          link="/admin/tracking"
        />
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ title, value, change }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
      <span className="text-green-400 text-sm">{change}</span>
    </div>
  );
}

function ManagementCard({ title, description, link }) {
  return (
    <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 hover:border-blue-500 transition">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400 mb-6">{description}</p>

      <Link
        to={link}
        className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition"
      >
        Open →
      </Link>
    </div>
  );
}