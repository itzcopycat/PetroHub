const express = require("express");
const router = express.Router();
const DeliveryPartner = require("../models/DeliveryPartner");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");
const generateDeliveryPartnerId = require("../utils/generateDeliveryPartnerId");

// GET /api/delivery-partners
router.get("/", authMiddleware, async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json({ partners });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch delivery partners" });
  }
});

// POST /api/delivery-partners
// `rating` is intentionally NOT accepted here. It's a derived value —
// the only place it's ever written is routes/bookings.js POST /:id/rate,
// which recomputes it as the live average of a partner's rated bookings.
// A brand new partner always starts at the schema default (0) until their
// first delivery gets rated.
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, area, dailyCapacity } = req.body;

    if (!name || !phone || !area || !dailyCapacity) {
      return res.status(400).json({
        message: "Name, phone, area, and daily capacity are required.",
      });
    }

    const partnerId = await generateDeliveryPartnerId();

    const partner = await DeliveryPartner.create({
      partnerId,
      name,
      phone,
      area,
      dailyCapacity,
    });

    res.status(201).json({ partner });
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: "Failed to add delivery partner" });
  }
});

// PATCH /api/delivery-partners/:id
// Deliberately restricted to editable identity/capacity fields — currentLoad,
// lastAssignedDate, and rating are never touched here. currentLoad/
// lastAssignedDate are only ever set by /bookings/:id/assign, and rating is
// only ever set by /bookings/:id/rate, so an admin edit here can't
// accidentally corrupt today's load tracking or overwrite a real rating.
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, phone, area, dailyCapacity } = req.body;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.params.id,
      { name, phone, area, dailyCapacity },
      { new: true, runValidators: true }
    );

    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    res.json({ partner });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Failed to update delivery partner" });
  }
});

// DELETE /api/delivery-partners/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Guard: don't delete a partner who's actively assigned to a booking
    // that isn't finished yet — that would leave the booking's
    // deliveryPartner reference dangling mid-delivery.
    const activeBooking = await Booking.findOne({
      deliveryPartner: req.params.id,
      status: { $nin: ["Delivered", "Cancelled"] },
    });

    if (activeBooking) {
      return res.status(400).json({
        message: `Cannot delete — this partner is currently assigned to booking ${activeBooking.bookingId}.`,
      });
    }

    const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    res.json({ message: "Delivery partner deleted", partner });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid partner ID" });
    }
    res.status(500).json({ message: "Failed to delete delivery partner" });
  }
});

module.exports = router;