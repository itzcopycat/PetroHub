import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Sidebar from "../components/Sidebar.jsx";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isMobileSidebar = () =>
    window.matchMedia("(max-width: 991.98px)").matches;

  const handleToggleSidebar = () => {
    if (isMobileSidebar()) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", mobileSidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [mobileSidebarOpen]);

  return (
    <div
      className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""} ${
        mobileSidebarOpen ? "sidebar-open" : ""
      }`}
    >
      <div
        className="sidebar-backdrop"
        data-sidebar-close=""
        onClick={() => setMobileSidebarOpen(false)}
      />
      <Sidebar collapsed={collapsed} />
      <div className="admin-main">
        <Navbar
          collapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="dashboard-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AdminLayout;
