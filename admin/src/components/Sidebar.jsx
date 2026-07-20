import { NavLink } from "react-router-dom";
import logo from "../assets/images/brand/logo/logo.png";
function Sidebar({ collapsed }) {
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
          to="/users"
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
          to="/users"
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
            <i className="bi bi-pencil" aria-hidden="true" />
          </span>
          <span className="nav-text">Edit LPG Price</span>
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
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-bar-chart" aria-hidden="true" />
          </span>
          <span className="nav-text">Reports</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-gear" aria-hidden="true" />
          </span>
          <span className="nav-text">Settings</span>
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <i className="bi bi-power" aria-hidden="true" />
          </span>
          <span className="nav-text">LogOut</span>
        </NavLink>
        {/* repeat this NavLink pattern for add-user, profile, charts, tables, forms, components, alerts, modals, settings, blank */}
      </nav>
      {/* ...sidebar-user and sidebar-footer unchanged... */}
    </aside>
  );
}

export default Sidebar;