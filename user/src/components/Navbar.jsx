import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaBars, FaChevronDown } from "react-icons/fa";
import Avatar from "./Avatar";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [consumer, setConsumer] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  // Load logged-in consumer (if any) from localStorage.
  // Re-runs on every route change too, so the avatar appears immediately
  // after a login redirect instead of needing a manual page refresh.
  useEffect(() => {
    const loadConsumer = () => {
      const stored = localStorage.getItem("consumer");
      setConsumer(stored ? JSON.parse(stored) : null);
    };

    loadConsumer();

    // Keep in sync if login/logout happens in another tab
    window.addEventListener("storage", loadConsumer);
    return () => window.removeEventListener("storage", loadConsumer);
  }, [location.pathname]);

  // Close the avatar dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("consumer");
    setConsumer(null);
    setDropdownOpen(false);
    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo-link" onClick={closeMenu}>
        <div className="logo-wrapper">
          <img src={logo} alt="PetroHub Logo" className="logo-img" />
          <div className="logo-container">
            <h2 className="logo">PetroHub</h2>
            <p className="slogan">Powering Every Kitchen!</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <ul className={menuOpen ? "nav-links active" : "nav-links"}>
        <li>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
        </li>

        <li>
          <NavLink to="/orders" onClick={closeMenu}>
            Orders
          </NavLink>
        </li>

        <li>
          <NavLink to="/safety" onClick={closeMenu}>
            Safety
          </NavLink>
        </li>

        <li>
          <NavLink to="/faq" onClick={closeMenu}>
            FAQ
          </NavLink>
        </li>

        <li>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </li>

        {/* Mobile */}
        <li className="mobile-only">
          <NavLink to="/book-cylinder" onClick={closeMenu}>
            Book Cylinder
          </NavLink>
        </li>

        {consumer ? (
          <>
            <li className="mobile-only">
              <NavLink to="/profile" onClick={closeMenu}>
                My Profile
              </NavLink>
            </li>
            <li className="mobile-only">
              <button className="mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li className="mobile-only">
            <NavLink to="/login" onClick={closeMenu}>
              Login
            </NavLink>
          </li>
        )}
      </ul>

      {/* Desktop Buttons */}
      <div className="nav-buttons">
        <Link to="/book-cylinder" className="book-btn">
          Book Cylinder
        </Link>

        {consumer ? (
          <div className="avatar-menu" ref={dropdownRef}>
            <button
              type="button"
              className="avatar-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <Avatar gender={consumer.gender} className="navbar-avatar" />
              <FaChevronDown
                className={`avatar-caret ${dropdownOpen ? "open" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <ul className="avatar-dropdown">
                <li>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    My Profile
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars />
      </div>
    </nav>
  );
}

export default Navbar;