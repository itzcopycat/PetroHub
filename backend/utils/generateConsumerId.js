const Counter = require("../models/Counter");

async function generateConsumerId() {
  const counter = await Counter.findByIdAndUpdate(
    "consumerId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const year = new Date().getFullYear();
  const padded = String(counter.seq).padStart(1, "0");
  return `PH-${year}-${padded}`; // e.g. PH-2026-00001
}

module.exports = generateConsumerId;