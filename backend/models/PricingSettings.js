const mongoose = require("mongoose");

const cylinderPriceSchema = new mongoose.Schema(
  {
    cylinderType: {
      type: String,
      enum: ["14.2kg", "19kg", "5kg"], // matches Booking.cylinderType exactly
      required: true,
    },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const flatFieldSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pricingSettingsSchema = new mongoose.Schema(
  {
    // Enforces a single settings document via the unique index below.
    singletonKey: { type: String, default: "default", unique: true },

    cylinderPrices: [cylinderPriceSchema],
    deliveryFee: { type: flatFieldSchema, required: true },
    platformFee: { type: flatFieldSchema, required: true },
    taxRatePercent: { type: flatFieldSchema, required: true }, // e.g. 5 means 5%
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingSettings", pricingSettingsSchema);