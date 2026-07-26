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
const { reserveStock, releaseStock, fulfillStock } = require("../utils/inventory");

const CYLINDER_LABELS = {
  "14.2kg": "Domestic (14.2 kg)",
  "19kg": "Commercial (19 kg)",
  "5kg-ftl": "Mini FTL (5 kg)",
  "5kg-domestic": "Mini Domestic (5 kg)",
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

// GET /api/bookings/track/:bookingId — PUBLIC tracking lookup, no login
// required. Guarded by requiring the registered phone number as a basic
// ownership check, since bookingId alone (e.g. PH-BK-2026-00028) is
// sequential/guessable and would otherwise leak another consumer's name,
// address, and delivery partner details to anyone who tries nearby IDs.
router.get("/track/:bookingId", async (req, res) => {
  try {
    const phone = (req.query.phone || "").trim();
    if (!phone) {
      return res.status(400).json({ message: "Enter the phone number used for this booking." });
    }

    const booking = await Booking.findOne({
      bookingId: req.params.bookingId.trim(),
      phone,
    }).populate("deliveryPartner", "name phone rating");

    if (!booking) {
      return res.status(404).json({
        message: "No booking found. Check the Booking ID and phone number and try again.",
      });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

// GET /api/bookings/me — consumer: fetch only their own bookings
router.get("/me", consumerAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ consumer: req.consumer.id })
      .populate("deliveryPartner", "name phone rating")
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
  // Tracked so a failure AFTER stock has been reserved (e.g. booking
  // validation error) can roll the reservation back instead of leaking
  // cylinders into limbo.
  let stockReserved = false;
  let reservedType = null;
  let reservedQuantity = 0;

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

    const resolvedQuantity = quantity || 1;

    const stockDoc = await reserveStock(cylinderType, resolvedQuantity);
    if (!stockDoc) {
      return res.status(400).json({
        message: "Not enough cylinders in stock for this type right now. Please try again later.",
      });
    }
    stockReserved = true;
    reservedType = cylinderType;
    reservedQuantity = resolvedQuantity;

    const bookingId = await generateBookingId();

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
    if (stockReserved) {
      await releaseStock(reservedType, reservedQuantity).catch((rollbackErr) => {
        console.error("Failed to roll back stock reservation:", rollbackErr);
      });
    }
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
  let stockReserved = false;
  let reservedType = null;
  let reservedQuantity = 0;

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

    const stockDoc = await reserveStock(resolvedCylinderType, resolvedQuantity);
    if (!stockDoc) {
      return res.status(400).json({
        message: "Not enough cylinders in stock for this type right now.",
      });
    }
    stockReserved = true;
    reservedType = resolvedCylinderType;
    reservedQuantity = resolvedQuantity;

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
    if (stockReserved) {
      await releaseStock(reservedType, reservedQuantity).catch((rollbackErr) => {
        console.error("Failed to roll back stock reservation:", rollbackErr);
      });
    }
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(400).json({ message: err.message });
  }
});

// PATCH - update booking status/details (admin)
// Field-whitelisted on purpose: `rating` is intentionally excluded so it can
// never be set or reset through this generic route — the ONLY writer of a
// booking's rating anywhere in the app is POST /:id/rate, which also enforces
// the one-time check. Same reasoning for deliveryPartner/currentLoad, which
// belong to the /assign route instead.
const PATCHABLE_BOOKING_FIELDS = [
  "status",
  "paymentStatus",
  "paymentMethod",
  "cancelReason",
  "specialInstructions",
  "preferredDeliveryDate",
  "deliveryAddress",
];

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const updates = {};
    for (const field of PATCHABLE_BOOKING_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.status === "Delivered") {
      updates.deliveredAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Stock only moves on a genuine status transition, so replaying the same
    // status (or patching unrelated fields like specialInstructions) never
    // double-counts.
    const statusChanged = updates.status && updates.status !== existingBooking.status;
    if (statusChanged) {
      try {
        if (updates.status === "Delivered") {
          await fulfillStock(booking.cylinderType, booking.quantity);
        } else if (updates.status === "Cancelled" && existingBooking.status !== "Delivered") {
          // Only release stock that was still reserved — never release stock
          // for a booking that had already been delivered (and sold).
          await releaseStock(booking.cylinderType, booking.quantity);
        }
      } catch (stockErr) {
        // The booking status change itself already succeeded and has been
        // returned below; log this rather than fail the request, since the
        // admin has no obvious retry action for a stock-sync error.
        console.error("Failed to sync cylinder stock for status change:", stockErr);
      }
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

// POST /api/bookings/:id/rate — consumer rates a delivered booking.
// This is the ONLY place DeliveryPartner.rating gets written anywhere in
// the app (delivery-partners.js no longer accepts a manual rating field),
// so the number shown everywhere is always a live derived average.
//
// IMPORTANT: the "is this already rated?" check and the write happen as ONE
// atomic findOneAndUpdate (matching on rating: null), not a separate read
// followed later by a save(). Two back-to-back requests for the same
// booking — a page refresh replaying a request, a double-click, a slow
// network causing a retry — could otherwise both read rating: null before
// either had saved, letting both pass the old check-then-save version of
// this route. With the match condition baked into the update itself, only
// one request can ever flip rating from null to a value; every other
// attempt, no matter what triggers it, fails to match and falls through to
// the diagnostic checks below to report why.
router.post("/:id/rate", consumerAuth, async (req, res) => {
  try {
    const value = Number(req.body.rating);

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        consumer: req.consumer.id,
        status: "Delivered",
        deliveryPartner: { $ne: null },
        rating: null,
      },
      { rating: value },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      // The atomic update didn't match — figure out why, purely to return a
      // helpful message. This lookup has no bearing on data integrity; the
      // line above already guaranteed nothing double-writes.
      const existing = await Booking.findById(req.params.id);

      if (!existing) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (existing.consumer.toString() !== req.consumer.id.toString()) {
        return res.status(403).json({ message: "You can't rate this booking." });
      }
      if (existing.status !== "Delivered") {
        return res.status(400).json({ message: "Only delivered orders can be rated." });
      }
      if (existing.rating) {
        return res.status(400).json({ message: "This booking has already been rated." });
      }
      if (!existing.deliveryPartner) {
        return res
          .status(400)
          .json({ message: "No delivery partner is attached to this booking." });
      }
      return res.status(400).json({ message: "Could not submit rating." });
    }

    // Recompute the partner's aggregate rating from EVERY rated booking
    // ever assigned to them.
    const stats = await Booking.aggregate([
      {
        $match: {
          deliveryPartner: updatedBooking.deliveryPartner,
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$deliveryPartner",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : value;

    const partner = await DeliveryPartner.findByIdAndUpdate(
      updatedBooking.deliveryPartner,
      { rating: avgRating },
      { new: true }
    );

    res.json({
      message: "Rating submitted",
      rating: updatedBooking.rating,
      partnerRating: partner?.rating ?? avgRating,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

module.exports = router;