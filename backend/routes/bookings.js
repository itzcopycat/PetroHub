const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Consumer = require("../models/Consumer");
const DeliveryPartner = require("../models/DeliveryPartner");
const authMiddleware = require("../middleware/auth");
const consumerAuth = require("../middleware/consumerAuth");
const generateBookingId = require("../utils/generateBookingId");
const sendEmail = require("../utils/sendEmail");
const { getOrCreateSettings, computePriceBreakup } = require("../utils/getPricingSettings");

const CYLINDER_LABELS = {
  "14.2kg": "Domestic (14.2 kg)",
  "19kg": "Commercial (19 kg)",
  "5kg": "Mini (5 kg)",
};

// GET all bookings (admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// GET /api/bookings/me — consumer: fetch only their own bookings
router.get("/me", consumerAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ consumer: req.consumer.id })
      .populate("deliveryPartner", "name phone")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error("Fetch my bookings error:", err);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
});

// ================= CONSUMER: Book a cylinder for myself =================
// POST /api/bookings/me
router.post("/me", consumerAuth, async (req, res) => {
  try {
    const {
      cylinderType,
      quantity,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      preferredDeliveryDate,
    } = req.body;

    if (!cylinderType) {
      return res.status(400).json({ message: "Cylinder type is required" });
    }

    const consumerDoc = await Consumer.findById(req.consumer.id);
    if (!consumerDoc) {
      return res.status(404).json({ message: "Consumer account not found" });
    }

    const bookingId = await generateBookingId();
    const resolvedQuantity = quantity || 1;

    const settings = await getOrCreateSettings();
    const priceBreakup = computePriceBreakup(settings, cylinderType, resolvedQuantity);

    const booking = await Booking.create({
      bookingId,
      consumer: consumerDoc._id,
      consumerName: consumerDoc.name,
      phone: consumerDoc.mobileNumber,
      cylinderType,
      quantity: resolvedQuantity,
      preferredDeliveryDate: preferredDeliveryDate || null,
      deliveryAddress: {
        line1: deliveryAddress || consumerDoc.address?.line1 || "",
        line2: consumerDoc.address?.line2 || "",
        city: consumerDoc.address?.city || "",
        state: consumerDoc.address?.state || "",
        pincode: consumerDoc.address?.pincode || "",
      },
      price: priceBreakup.total,
      priceBreakup,
      paymentMethod: paymentMethod || "Cash on Delivery",
      specialInstructions: specialInstructions || "",
      status: "Pending",
    });

    // Booking confirmation email — best effort, never blocks the response
    try {
      await sendEmail({
        to: consumerDoc.email,
        subject: `Booking Confirmed — ${booking.bookingId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #E4672B;">Hi ${consumerDoc.name},</h2>
            <p>Your LPG cylinder booking has been received.</p>
            <p style="background: #f5f1e8; padding: 16px; border-radius: 6px;">
              <strong>Booking ID:</strong> ${booking.bookingId}<br/>
              <strong>Cylinder:</strong> ${CYLINDER_LABELS[booking.cylinderType] || booking.cylinderType}<br/>
              <strong>Quantity:</strong> ${booking.quantity}<br/>
              <strong>Amount:</strong> ₹${booking.price}<br/>
              <strong>Payment Method:</strong> ${booking.paymentMethod}<br/>
              <strong>Status:</strong> ${booking.status}
            </p>
            <p>We'll notify you as soon as it's out for delivery.</p>
            <p>— The PetroHub Team</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Booking confirmation email failed:", emailErr);
    }

    res.status(201).json({ booking });
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    console.error("Create booking (self) error:", err);
    res.status(500).json({
      message: "Something went wrong while booking. Please try again.",
    });
  }
});

// ================= ADMIN: Create booking for any consumer =================
// POST /api/bookings
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

    const resolvedCylinderType = cylinderType || consumerDoc.cylinderSize;
    const resolvedQuantity = quantity || (consumerDoc.cylinderCount === "Double" ? 2 : 1);
    const bookingId = await generateBookingId();

    const settings = await getOrCreateSettings();
    const priceBreakup = computePriceBreakup(settings, resolvedCylinderType, resolvedQuantity);

    const booking = await Booking.create({
      bookingId,
      consumer: consumerDoc._id,
      consumerName: consumerDoc.name,
      phone: consumerDoc.mobileNumber,
      cylinderType: resolvedCylinderType,
      quantity: resolvedQuantity,
      deliveryAddress: deliveryAddress || {
        line1: consumerDoc.address?.line1 || "",
        line2: consumerDoc.address?.line2 || "",
        city: consumerDoc.address?.city || "",
        state: consumerDoc.address?.state || "",
        pincode: consumerDoc.address?.pincode || "",
      },
      price: priceBreakup.total,
      priceBreakup,
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

// PATCH - update booking status/details (admin)
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

// POST /api/bookings/:id/assign — assign a delivery partner and consume
// one unit of their daily capacity
router.post("/:id/assign", authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) {
      return res.status(400).json({ message: "partnerId is required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (["Delivered", "Cancelled"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot assign a partner to a ${booking.status.toLowerCase()} booking` });
    }

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    // Lazy daily reset: if the partner's last assignment wasn't today,
    // their load resets before we check/consume capacity.
    const today = new Date().toDateString();
    const lastDate = partner.lastAssignedDate
      ? partner.lastAssignedDate.toDateString()
      : null;
    if (lastDate !== today) {
      partner.currentLoad = 0;
    }

    if (partner.currentLoad >= partner.dailyCapacity) {
      return res
        .status(400)
        .json({ message: `${partner.name} has reached their daily delivery capacity.` });
    }

    partner.currentLoad += 1;
    partner.lastAssignedDate = new Date();
    await partner.save();

    booking.deliveryPartner = partner._id;
    booking.assignedDeliveryAgent = partner.name;
    booking.status = "Confirmed";
    await booking.save();

    res.json({ booking, partner });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID" });
    }
    console.error("Assign booking error:", err);
    res.status(500).json({ message: "Failed to assign delivery partner" });
  }
});

module.exports = router;