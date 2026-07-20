import { useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Hook this up to your backend / email service later
    alert("Thanks for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Get In Touch</h1>
        <p>Have a question or need help with your booking? We're here for you.</p>
      </div>

      <div className="contact-container">

        {/* Left info panel */}
        <div className="contact-info">
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
        <div className="contact-form-wrapper">
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