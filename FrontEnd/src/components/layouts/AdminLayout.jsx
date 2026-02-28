import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {/* NAVBAR */}
      <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-blue-400">
          Pharmacy AI Admin
        </h1>

        <div className="flex gap-8 text-slate-300 font-medium">
          <Link to="/admin" className="hover:text-blue-400 transition">
            Dashboard
          </Link>
          <Link to="/admin/medicines" className="hover:text-blue-400 transition">
            Inventory Management
          </Link>
          <Link to="/admin/tracking" className="hover:text-blue-400 transition">
            Agent Tracking
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
}