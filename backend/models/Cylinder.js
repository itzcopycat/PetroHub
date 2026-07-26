const mongoose = require("mongoose");

const cylinderSchema = new mongoose.Schema(
  {
    // Kept in sync with Booking.cylinderType so reports/reporting joins line up.
    type: {
      type: String,
      enum: ["14.2kg", "19kg", "5kg-ftl", "5kg-domestic"],
      required: true,
      unique: true,
    },

    // Cylinders physically available to sell right now.
    inStock: { type: Number, default: 0, min: 0 },

    // Cylinders allocated to Pending/Confirmed bookings but not yet delivered.
    reserved: { type: Number, default: 0, min: 0 },

    // Running all-time count of delivered/sold cylinders of this type.
    sold: { type: Number, default: 0, min: 0 },

    // Below this level, the admin dashboard should flag "reorder now".
    reorderLevel: { type: Number, default: 10, min: 0 },

    unitCost: { type: Number, default: 0, min: 0 },
    lastRestockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cylinder", cylinderSchema);