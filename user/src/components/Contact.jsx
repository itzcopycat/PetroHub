import { useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Only affects layout on mobile (<860px). Desktop always shows both panels.
  const [activeTab, setActiveTab] = useState("info"); // "info" | "query"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Something went wrong. Please try again.");
      return;
    }

    toast.success("Thanks for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  } catch (err) {
    console.error("Contact form submit error:", err);
    toast.error("Network error. Please try again.");
  }
};

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Get In Touch</h1>
        <p>Have a question or need help with your booking? We're here for you.</p>
      </div>

      <div className="contact-container">

        {/* Mobile-only tab bar */}
        <div className="mobile-tabs">
          <button
            type="button"
            className={`mobile-tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Contact Information
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${activeTab === "query" ? "active" : ""}`}
            onClick={() => setActiveTab("query")}
          >
            Your Query
          </button>
        </div>

        {/* Left info panel */}
        <div className={`contact-info ${activeTab === "info" ? "tab-active" : "tab-hidden"}`}>
          <h2>Contact Information</h2>
          <p className="info-subtext">
            Reach out to us directly or fill the form and we'll respond within 24 hours.
          </p>

          <div className="info-item">
            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h4>Our Location</h4>
              <p>Kolkata, India</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaPhoneAlt />
            </div>
            <div>
              <h4>Phone Number</h4>
              <p>+91 9876543210</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <div>
              <h4>Email Address</h4>
              <p>support@petrohub.com</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaPaperPlane />
            </div>
            <div>
              <h4>Working Hours</h4>
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* Right contact form */}
        <div className={`contact-form-wrapper ${activeTab === "query" ? "tab-active" : "tab-hidden"}`}>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="What is this regarding?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Message</label>
              <textarea
                name="message"
                rows="5"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">
              Send Message <FaPaperPlane />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;