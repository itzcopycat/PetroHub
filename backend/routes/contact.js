const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");
const contactThankYouTemplate = require("../templates/contactThankYou");

// ================= PUBLIC: Submit Contact Form =================
// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const contact = await Contact.create({ name, email, subject, message });

    // Send thank-you email — don't let a mail failure block the DB save/response
    try {
      await sendEmail({
        to: email,
        subject: "We've received your message — PetroHub",
        html: contactThankYouTemplate(name),
      });
    } catch (mailErr) {
      console.error("Contact form email failed:", mailErr);
    }

    res.status(201).json({
      message: "Thanks for reaching out! We'll get back to you soon.",
      contact,
    });
  } catch (err) {
    console.error("Contact form error:", err);
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;