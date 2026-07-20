import { FaBolt, FaShieldAlt, FaTruck, FaHeadset, FaLeaf, FaAward } from "react-icons/fa";
import truckImage from "../assets/truck.png";
import logo from "../assets/logo.png";
function About() {
  return (
    <div className="about-page">

  <section className="about-intro">

    <div className="about-intro-text">
    
      <h1>Who We Are</h1>
      <img src={logo} alt="PetroHub Logo" className="about-brand-logo" />

      <p>
        PetroHub is a modern LPG cylinder booking and delivery platform
        built to make one of the most essential household needs simple,
        fast, and reliable. We connect customers directly with us across India, removing the hassle of long queues,
        phone bookings, and uncertain delivery timelines. Our mission is straightforward: ensure every home and business
        gets safe, timely, and affordable LPG delivery, backed by
        real-time order tracking and dedicated customer support.
      </p>

    </div>

    <div className="about-intro-image">
      <img
        src={truckImage}
        alt="PetroHub Delivery Truck"
        className="truck-img"
      />
    </div>

  </section>
      {/* Stats */}
      <section className="about-stats">
        <div className="stat-box">
          <h3>50,000+</h3>
          <p>Cylinders Delivered</p>
        </div>
        <div className="stat-box">
          <h3>120+</h3>
          <p>Cities Covered</p>
        </div>
        <div className="stat-box">
          <h3>98%</h3>
          <p>On-Time Delivery Rate</p>
        </div>
        <div className="stat-box">
          <h3>24/7</h3>
          <p>Customer Support</p>
        </div>
      </section>

      {/* Why choose us */}
      <section className="about-features">
        <h2>Why Choose PetroHub</h2>
        <p className="works-description">
          Everything we build is focused on speed, safety, and trust.
        </p>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon"><FaBolt /></div>
            <h3>Fast Booking</h3>
            <p>Book a cylinder in under two minutes, from any device, anytime.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaShieldAlt /></div>
            <h3>Safety First</h3>
            <p>Every delivery agent is verified, and cylinders are quality-checked before dispatch.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaTruck /></div>
            <h3>Real-Time Tracking</h3>
            <p>Track your order status live, from confirmation to doorstep delivery.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaHeadset /></div>
            <h3>Dedicated Support</h3>
            <p>Our support team is available round the clock to resolve any issue quickly.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaLeaf /></div>
            <h3>Eco-Conscious</h3>
            <p>We partner with agencies committed to safe handling and reduced carbon footprint.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaAward /></div>
            <h3>Trusted Platform</h3>
            <p>Thousands of households rely on PetroHub for consistent, dependable service.</p>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">

        <h2>How It Works</h2>

        <p className="works-description">
          Get your LPG cylinder delivered in just three simple steps.
        </p>

        <div className="steps-container">

          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Book Cylinder</h3>
            <p>
              Select your cylinder and place your order easily.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Confirm Order</h3>
            <p>
              Your order is verified and prepared for delivery.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Doorstep Delivery</h3>
            <p>
              Receive your LPG cylinder safely at your home.
            </p>
          </div>

        </div>

      </section>

      <section className="services" id="services">
      <h2>Our Services</h2>
      <p className="service-text">
        Reliable LPG solutions designed to make your cooking fuel delivery
        faster, safer, and easier.
      </p>

      <div className="service-cards">

        <div className="service-card">
          <h3>🔥 LPG Booking</h3>
          <p>
            Book your LPG cylinder online anytime with just a few clicks.
          </p>
        </div>

        <div className="service-card">
          <h3>🚚 Fast Delivery</h3>
          <p>
            Get your cylinder delivered quickly and safely at your doorstep.
          </p>
        </div>

        <div className="service-card">
          <h3>📍 Track Order</h3>
          <p>
            Track your LPG delivery status in real time with PetroHub.
          </p>
        </div>

      </div>
    </section>

    </div>

    
  );
}

export default About;