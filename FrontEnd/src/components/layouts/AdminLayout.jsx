import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // continue logout cleanup even if backend logout fails
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
        <Link to="/admin" className="text-xl font-bold text-blue-400">
          Pharmacy AI Admin
        </Link>

        <div className="flex gap-8 text-slate-300 font-medium">
          <Link to="/admin" className={`hover:text-blue-400 transition ${isActive("/admin", true) ? "text-blue-400" : ""}`}>
            Dashboard
          </Link>
          <Link
            to="/admin/medicines"
            className={`hover:text-blue-400 transition ${isActive("/admin/medicines") ? "text-blue-400" : ""}`}
          >
            Inventory
          </Link>
          <Link
            to="/admin/tracking"
            className={`hover:text-blue-400 transition ${isActive("/admin/tracking") ? "text-blue-400" : ""}`}
          >
            Agent Tracking
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-300 hover:text-blue-400 text-sm">
            User App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
}
