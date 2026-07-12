const Counter = require("../models/Counter");

async function generateBookingId() {
  const counter = await Counter.findByIdAndUpdate(
    "bookingId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const year = new Date().getFullYear();
  const padded = String(counter.seq).padStart(5, "0");
  return `BK-${year}-${padded}`; // e.g. BK-2026-00001
}

module.exports = generateBookingId;