import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Medicines" value="1,240" change="+2.4%" />
        <StatCard title="Low Stock Alerts" value="12" change="-1.2%" />
        <StatCard title="Active Agents" value="8" change="+1" />
        <StatCard title="Orders Today" value="326" change="+5.6%" />
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