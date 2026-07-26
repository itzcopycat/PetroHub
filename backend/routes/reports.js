const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Consumer = require("../models/Consumer");
const Cylinder = require("../models/Cylinder");

// TODO: wire up your existing auth middleware here, e.g.:
// const { verifyToken } = require("../middleware/auth");
// router.use(verifyToken);

// Display-only metadata, matches routes/inventory.js — keep these two in
// sync when a new cylinderType is introduced.
const CYLINDER_META = {
  "14.2kg": { label: "Domestic Cylinder", weight: "14.2 kg" },
  "19kg": { label: "Commercial Cylinder", weight: "19 kg" },
  "5kg-ftl": { label: "Mini Cylinder (FTL)", weight: "5 kg" },
  "5kg-domestic": { label: "Mini Cylinder (Domestic)", weight: "5 kg" },
};

const buildBookingDateFilter = (from, to) => {
  const filter = {};
  if (from || to) {
    filter.bookingDate = {};
    if (from) filter.bookingDate.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) filter.bookingDate.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  return filter;
};

// GET /api/reports/overview
router.get("/overview", async (req, res) => {
  try {
    const [totalBookings, totalConsumers, revenueAgg, cylinders] = await Promise.all([
      Booking.countDocuments(),
      Consumer.countDocuments(),
      // Revenue is recognized when a cylinder is actually delivered, not
      // tied to payment status (nothing marks bookings "Paid" yet).
      Booking.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: null, total: { $sum: "$priceBreakup.total" } } },
      ]),
      Cylinder.find().lean(),
    ]);

    const totalCylindersInStock = cylinders.reduce((sum, c) => sum + (c.inStock || 0), 0);

    res.json({
      totalBookings,
      totalConsumers,
      totalCylindersInStock,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load overview", error: err.message });
  }
});

// GET /api/reports/bookings?from=&to=
// Also used by the frontend to build the bulk tax invoice, so it returns the
// full priceBreakup for each booking, not just the flat "amount".
router.get("/bookings", async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = buildBookingDateFilter(from, to);

    const bookings = await Booking.find(filter).sort({ bookingDate: -1 }).lean();

    res.json({
      bookings: bookings.map((b) => ({
        id: b.bookingId,
        consumerName: b.consumerName,
        phone: b.phone,
        cylinderType: b.cylinderType,
        quantity: b.quantity,
        status: b.status,
        paymentStatus: b.paymentStatus,
        paymentMethod: b.paymentMethod,
        amount: b.priceBreakup?.total ?? b.price,
        priceBreakup: b.priceBreakup,
        date: b.bookingDate,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings report", error: err.message });
  }
});

// GET /api/reports/consumers?from=&to=
router.get("/consumers", async (req, res) => {
  try {
    const { from, to } = req.query;
    const joinFilter = {};
    if (from || to) {
      joinFilter.joinedAt = {};
      if (from) joinFilter.joinedAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) joinFilter.joinedAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const consumers = await Consumer.find(joinFilter).lean();

    const orderStats = await Booking.aggregate([
      {
        $group: {
          _id: "$consumer",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$priceBreakup.total" },
        },
      },
    ]);
    const statsMap = new Map(orderStats.map((s) => [String(s._id), s]));

    res.json({
      consumers: consumers.map((c) => {
        const stats = statsMap.get(String(c._id));
        return {
          id: c.consumerId,
          name: c.name,
          phone: c.mobileNumber,
          totalOrders: stats?.totalOrders || 0,
          totalSpent: stats?.totalSpent || 0,
          joinedDate: c.joinedAt,
        };
      }),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load consumers report", error: err.message });
  }
});

// GET /api/reports/inventory
// "Sold" = cylinders delivered against actual bookings, computed from
// Booking, not stored on Cylinder itself (Cylinder only tracks live
// inStock/reserved, not historical sales).
router.get("/inventory", async (req, res) => {
  try {
    const [cylinders, soldAgg] = await Promise.all([
      Cylinder.find().sort({ type: 1 }).lean(),
      Booking.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: "$cylinderType", sold: { $sum: "$quantity" } } },
      ]),
    ]);

    const soldMap = new Map(soldAgg.map((s) => [s._id, s.sold]));

    res.json({
      inventory: cylinders.map((c) => {
        const meta = CYLINDER_META[c.type] || { label: c.type, weight: "" };
        return {
          type: `${meta.label} (${meta.weight})`,
          inStock: c.inStock,
          reserved: c.reserved,
          sold: soldMap.get(c.type) || 0,
          reorderLevel: c.reorderLevel,
        };
      }),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load inventory report", error: err.message });
  }
});

// GET /api/reports/revenue?from=&to=
router.get("/revenue", async (req, res) => {
  try {
    const { from, to } = req.query;
    // Same recognition rule as /overview — revenue counts on delivery.
    const filter = { ...buildBookingDateFilter(from, to), status: "Delivered" };

    const revenue = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$bookingDate" } },
          bookingsCount: { $sum: 1 },
          amount: { $sum: "$priceBreakup.total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      revenue: revenue.map((r) => ({
        label: r._id,
        bookingsCount: r.bookingsCount,
        amount: r.amount,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load revenue report", error: err.message });
  }
});

module.exports = router;

// Mount this in your server.js / app.js, e.g.:
// const reportsRoutes = require("./routes/reports.routes");
// app.use("/api/reports", reportsRoutes);