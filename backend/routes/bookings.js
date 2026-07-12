const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Consumer = require("../models/Consumer");
const authMiddleware = require("../middleware/auth");
const generateBookingId = require("../utils/generateBookingId");

// GET all bookings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// POST - create a new booking
// Used by: (1) admin panel, selecting any consumer
//          (2) future consumer panel, where req.body.consumer will be the logged-in consumer's own ID
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { consumer, cylinderType, quantity, deliveryAddress } = req.body;

    if (!consumer) {
      return res.status(400).json({ message: "Consumer is required" });
    }

    const consumerDoc = await Consumer.findById(consumer);
    if (!consumerDoc) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      consumer: consumerDoc._id,
      consumerName: consumerDoc.name,
      phone: consumerDoc.mobileNumber,
      cylinderType: cylinderType || consumerDoc.cylinderSize,
      quantity: quantity || (consumerDoc.cylinderCount === "Double" ? 2 : 1),
      deliveryAddress: deliveryAddress || {
        line1: consumerDoc.address?.line1 || "",
        line2: consumerDoc.address?.line2 || "",
        city: consumerDoc.address?.city || "",
        state: consumerDoc.address?.state || "",
        pincode: consumerDoc.address?.pincode || "",
      },
      status: "Pending",
    });

    res.status(201).json({ booking });
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(400).json({ message: err.message });
  }
});

// PATCH - update booking status/details
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.status === "Delivered") {
      updates.deliveredAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ booking });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;