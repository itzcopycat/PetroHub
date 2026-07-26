const mongoose = require("mongoose");

const cylinderPriceSchema = new mongoose.Schema(
  {
    cylinderType: {
      type: String,
      enum: ["14.2kg", "19kg", "5kg-domestic", "5kg-ftl"], // matches Booking.cylinderType exactly
      required: true,
    },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },

    // GST now lives per cylinder type, not as one global rate — real LPG
    // providers price it this way (e.g. Domestic 5%, Commercial 18%).
    gstRatePercent: { type: Number, required: true, min: 0 },

    // Informational metadata, matches the reference table this was modeled on.
    primaryUsage: { type: String, default: "" },
    // NOTE: not currently enforced at booking time — display/reference only.
    addressProofRequired: { type: Boolean, default: true },

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
    // taxRatePercent removed — GST is now per cylinder type above.
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingSettings", pricingSettingsSchema);