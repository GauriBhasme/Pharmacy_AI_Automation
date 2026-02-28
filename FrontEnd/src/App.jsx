import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Pages
import LandingPage from "./pages/User/LandingPage";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import UserDashboard from "./pages/User/UserDashboard";
import ChatPage from "./pages/User/ChatPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MedicineManagement from "./pages/Admin/MedicineManagement";
import AgentTracking from "./pages/Admin/AgentTracking";

// Layouts
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= USER ROUTES ================= */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="medicines" element={<MedicineManagement />} />
          <Route path="tracking" element={<AgentTracking />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;