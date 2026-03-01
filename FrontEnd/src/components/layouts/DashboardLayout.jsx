import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import { colors } from "../../theme/colors";

export default function DashboardLayout({ children, showSidebar = true }) {
  return (
    <div style={{ display: "flex", background: colors.background, minHeight: "100vh" }}>
      {showSidebar ? <Sidebar /> : null}
      <div style={{ flex: 1 }}>
        <Header />
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
