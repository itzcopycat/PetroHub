import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Sidebar from "../components/Sidebar.jsx";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div
        className="sidebar-backdrop"
        data-sidebar-close=""
        onClick={() => setCollapsed(true)}
      />
      <Sidebar collapsed={collapsed} />
      <div className="admin-main">
        <Navbar collapsed={collapsed} onToggleSidebar={() => setCollapsed(prev => !prev)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AdminLayout;