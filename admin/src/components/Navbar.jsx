import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function Navbar({ collapsed, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(() => {
    const stored =
      localStorage.getItem("admin") || sessionStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const refreshAdmin = () => {
      const stored =
        localStorage.getItem("admin") || sessionStorage.getItem("admin");
      setAdmin(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("admin-updated", refreshAdmin);
    return () => window.removeEventListener("admin-updated", refreshAdmin);
  }, []);

  const adminName = admin?.name || "Admin";
const adminAvatarUrl = admin?.avatarUrl ? `http://localhost:3000${admin.avatarUrl}` : "";

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <nav className="navbar admin-navbar navbar-expand bg-white">
      <div className="container-fluid px-3 px-lg-4">
        <button
          className="sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-controls="adminSidebar"
          aria-expanded={!collapsed}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>
        <form className="d-none d-md-flex ms-3 flex-grow-1" role="search">
          <input
            className="form-control search-input"
            type="search"
            placeholder="Search users, orders, reports"
            aria-label="Search"
          />
        </form>
        <div className="navbar-actions ms-auto">
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Switch color theme"
            title="Switch color theme"
          >
            <i
              className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}
              aria-hidden="true"
            />
          </button>
          <div className="dropdown">
            <button
              className="icon-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
            >
              <span className="notification-dot" />
              <i className="bi bi-bell" aria-hidden="true" />
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu">
              <div className="dropdown-header fw-bold text-body">
                Notifications
              </div>
              <a className="dropdown-item" href="users.html">
                <span className="notification-title">New user registered</span>
                <span className="notification-time">4 minutes ago</span>
              </a>
              <a className="dropdown-item" href="charts.html">
                <span className="notification-title">
                  Revenue target reached
                </span>
                <span className="notification-time">32 minutes ago</span>
              </a>
              <a className="dropdown-item" href="settings.html">
                <span className="notification-title">
                  Security review completed
                </span>
                <span className="notification-time">1 hour ago</span>
              </a>
            </div>
          </div>
          <div className="dropdown">
            <button
  className="profile-button dropdown-toggle"
  type="button"
  data-bs-toggle="dropdown"
  aria-expanded="false"
>
  {adminAvatarUrl ? (
    <img
      className="avatar-img avatar-sm"
      src={adminAvatarUrl}
      alt={adminName}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : null}
  <span
    className="avatar-img avatar-sm d-flex align-items-center justify-content-center"
    style={{
      display: adminAvatarUrl ? "none" : "flex",
      background: "var(--bs-primary, #0d6efd)",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
    }}
  >
    {initials(adminName)}
  </span>
  <span className="profile-name d-none d-sm-inline">{adminName}</span>
</button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="/profile">
                  Profile
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;