import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/brand/logo/logo.png";

const settingsSubmenu = [
  { to: "/profile", label: "Profile Settings", icon: "bi-person-gear" },
  { to: "/change-password", label: "Change Password", icon: "bi-shield-lock" },
  { to: "/edit-lpg-prices", label: "Edit LPG Price", icon: "bi-currency-rupee" },
  { to: "/fees-and-taxes", label: "Edit Fees and Taxes", icon: "bi-currency-dollar" },
];

function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-expand Settings if the current route is one of its submenu items
  const isSettingsRoute = settingsSubmenu.some((item) => item.to === location.pathname);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      id="adminSidebar"
      aria-label="Main navigation"
    >
      <div className="sidebar-brand">
        <img src={logo} alt="PetroHub" className="brand-logo" />
        <div className="brand-copy">
          <h2 className="brand-title">PetroHub</h2>
          <span className="brand-subtitle">Administrator</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-speedometer2" aria-hidden="true" />
          </span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/consumers"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-people" aria-hidden="true" />
          </span>
          <span className="nav-text">Consumers</span>
        </NavLink>

        <NavLink
          to="/lpgbookings"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-ticket" aria-hidden="true" />
          </span>
          <span className="nav-text">LPG Bookings</span>
        </NavLink>

        <NavLink
          to="/delivery"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-truck" aria-hidden="true" />
          </span>
          <span className="nav-text">Delivery</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-currency-rupee" aria-hidden="true" />
          </span>
          <span className="nav-text">Payments</span>
        </NavLink>

        <NavLink
          to="/cylinderstock"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-fire" aria-hidden="true" />
          </span>
          <span className="nav-text">Cylinder Stock</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-bell" aria-hidden="true" />
          </span>
          <span className="nav-text">Notifications</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-bar-chart" aria-hidden="true" />
          </span>
          <span className="nav-text">Reports</span>
        </NavLink>

        {/* Settings — parent menu with submenu */}
        <button
          type="button"
          className={`nav-link ${isSettingsRoute ? "active" : ""}`}
          onClick={() => setSettingsOpen((prev) => !prev)}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            justifyContent: "space-between",
          }}
          aria-expanded={settingsOpen}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="nav-icon">
              <i className="bi bi-gear" aria-hidden="true" />
            </span>
            <span className="nav-text">Settings</span>
          </span>
          <i
            className={`bi bi-chevron-down nav-text`}
            style={{
              fontSize: "0.75rem",
              transition: "transform 0.16s ease",
              transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
            aria-hidden="true"
          />
        </button>

        {settingsOpen && (
          <div
            style={{
              display: "grid",
              gap: "0.3rem",
              paddingLeft: "0.5rem",
              marginTop: "-0.15rem",
            }}
          >
            {settingsSubmenu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                style={{ minHeight: 40, padding: "0.6rem 0.9rem 0.6rem 1.6rem" }}
              >
                <span
                  className="nav-icon"
                  style={{ width: 24, height: 24, fontSize: "0.7rem" }}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                </span>
                <span className="nav-text" style={{ fontSize: "0.9rem" }}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        )}

        <button
          type="button"
          className="nav-link"
          onClick={handleLogout}
          style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer" }}
        >
          <span className="nav-icon">
            <i className="bi bi-power" aria-hidden="true" />
          </span>
          <span className="nav-text">LogOut</span>
        </button>
        {/* repeat this NavLink pattern for add-user, profile, charts, tables, forms, components, alerts, modals, blank */}
      </nav>
      {/* ...sidebar-user and sidebar-footer unchanged... */}
    </aside>
  );
}

export default Sidebar;