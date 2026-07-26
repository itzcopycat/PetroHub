const Cylinder = require("../models/Cylinder");

// Atomically reserves `quantity` units of `type`: moves them from inStock
// into reserved. The inStock >= quantity condition is baked into the query
// itself (not checked beforehand and then written separately), so two
// simultaneous bookings for the last few units can't both succeed and
// oversell. Returns the updated Cylinder doc, or null if there wasn't
// enough stock — callers should treat null as "insufficient stock".
async function reserveStock(type, quantity) {
  return Cylinder.findOneAndUpdate(
    { type, inStock: { $gte: quantity } },
    { $inc: { inStock: -quantity, reserved: quantity } },
    { new: true }
  );
}

// Releases `quantity` units of `type` from reserved back into inStock.
// Used when a reservation needs to be undone: a booking that failed to
// save after stock was reserved, or a booking cancelled before delivery.
async function releaseStock(type, quantity) {
  return Cylinder.findOneAndUpdate(
    { type },
    { $inc: { reserved: -quantity, inStock: quantity } },
    { new: true }
  );
}

// Moves `quantity` units of `type` from reserved into sold.
// Used when a booking is marked Delivered.
async function fulfillStock(type, quantity) {
  return Cylinder.findOneAndUpdate(
    { type },
    { $inc: { reserved: -quantity, sold: quantity } },
    { new: true }
  );
}

module.exports = { reserveStock, releaseStock, fulfillStock };