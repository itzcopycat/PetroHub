const express = require("express");
const router = express.Router();
const Consumer = require("../models/Consumer");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get("/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalConsumers = await Consumer.countDocuments();
    const consumersThisMonth = await Consumer.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const consumersLastMonth = await Consumer.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const revenueAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$price" }, count: { $sum: 1 } } },
    ]);
    const todaysRevenue = revenueAgg[0]?.total || 0;
    const todaysOrders = revenueAgg[0]?.count || 0;

    const deliveredAgg = await Booking.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const deliveredCylinders = deliveredAgg[0]?.total || 0;

    const pendingDelivery = await Booking.countDocuments({ status: "Pending" });

    res.json({
      totalConsumers,
      consumerGrowthPercent: pctChange(consumersThisMonth, consumersLastMonth),
      todaysRevenue,
      todaysOrders,
      deliveredCylinders,
      pendingDelivery,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

// GET /api/dashboard/monthly-bookings
//   no query          -> rolling last 6 months ending with current month
//   ?months=12         -> rolling last 12 months
//   ?year=2025          -> full Jan-Dec for that specific year (for year-over-year analysis)
router.get("/monthly-bookings", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    let rangeStart, rangeEnd, buckets;

    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      rangeStart = new Date(year, 0, 1);
      rangeEnd = new Date(year + 1, 0, 1);
      buckets = Array.from({ length: 12 }, (_, i) => ({
        year,
        month: i + 1,
        label: MONTH_LABELS[i],
      }));
    } else {
      const monthsBack = Math.max(1, Math.min(24, parseInt(req.query.months, 10) || 6));
      // Start = first day of the month, (monthsBack - 1) months before current month
      rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      buckets = [];
      for (let i = 0; i < monthsBack; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
        buckets.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          label: MONTH_LABELS[d.getMonth()],
        });
      }
    }

    const agg = await Booking.aggregate([
      { $match: { bookingDate: { $gte: rangeStart, $lt: rangeEnd } } },
      {
        $group: {
          _id: { year: { $year: "$bookingDate" }, month: { $month: "$bookingDate" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    agg.forEach((row) => {
      countMap[`${row._id.year}-${row._id.month}`] = row.count;
    });

    const result = buckets.map((b) => ({
      label: b.label,
      year: b.year,
      month: b.month,
      count: countMap[`${b.year}-${b.month}`] || 0,
    }));

    res.json({ months: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to load monthly bookings" });
  }
});

// GET /api/dashboard/available-years - for populating a year picker
router.get("/available-years", authMiddleware, async (req, res) => {
  try {
    const years = await Booking.aggregate([
      { $group: { _id: { $year: "$bookingDate" } } },
      { $sort: { _id: -1 } },
    ]);
    res.json({ years: years.map((y) => y._id) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load available years" });
  }
});

module.exports = router;