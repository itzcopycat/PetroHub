import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer" id="footer">

      <div className="footer-container">

        <div className="footer-col">
          <h2>PetroHub</h2>
          <p>
            Fast, safe and reliable LPG cylinder booking and delivery
            service across India.
          </p>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/howitworks">About</NavLink></li>
            <li><NavLink to="/services">Services</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Services</h3>
          <ul className="footer-links">
            <li><NavLink to="/book-cylinder">LPG Booking</NavLink></li>
            <li><NavLink to="/track-order">Track Order</NavLink></li>
            <li><NavLink to="/services">Online Payment</NavLink></li>
            <li><NavLink to="/contact">Customer Support</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contact</h3>
          <p>📍 Kolkata, India</p>
          <p>📞 +91 9876543210</p>
          <p>✉ support@petrohub.com</p>
        </div>

      </div>

      <hr />

      <div className="footer-bottom">
        <p>© 2026 PetroHub. All Rights Reserved.</p>
      </div>

    </footer>
  );
}

export default Footer;