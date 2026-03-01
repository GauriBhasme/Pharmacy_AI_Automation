import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    try {
      const userRaw = localStorage.getItem("user");
      const parsed = userRaw ? JSON.parse(userRaw) : null;
      setUserRole(parsed?.role || "user");
    } catch {
      setUserRole("user");
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] border-b border-blue-900">
      <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 text-white font-semibold text-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">AI</div>
        Pharmacy AI
      </Link>

      <div className="hidden md:flex gap-8 text-gray-300">
        {!isLoggedIn ? (
          <>
            <a href="#features" className="hover:text-blue-400">Features</a>
            <a href="#how" className="hover:text-blue-400">How it Works</a>
            <a href="#safety" className="hover:text-blue-400">Safety</a>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`hover:text-blue-400 ${location.pathname === "/dashboard" ? "text-blue-400" : ""}`}>
              Dashboard
            </Link>
            <Link to="/chat" className={`hover:text-blue-400 ${location.pathname === "/chat" ? "text-blue-400" : ""}`}>
              Chat
            </Link>
            <Link to="/profile" className={`hover:text-blue-400 ${location.pathname === "/profile" ? "text-blue-400" : ""}`}>
              Profile
            </Link>
            {userRole === "admin" ? (
              <Link to="/admin" className={`hover:text-blue-400 ${location.pathname.startsWith("/admin") ? "text-blue-400" : ""}`}>
                Admin
              </Link>
            ) : null}
          </>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="text-white hover:text-blue-400">
              Login
            </Link>

            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg font-medium"
            >
              Start Chat
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="text-white hover:text-blue-400 hidden sm:inline">
              Dashboard
            </Link>

            <Link
              to="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg font-medium"
            >
              Start Chat
            </Link>

            <Link
              to="/profile"
              className="p-2 rounded-full hover:bg-[#135C8C]"
              title="Profile"
            >
              <User className="h-5 w-5 text-[#9FB7C8]" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-[#135C8C]"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-[#9FB7C8]" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
