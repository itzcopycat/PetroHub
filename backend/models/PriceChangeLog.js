const mongoose = require("mongoose");

const priceChangeLogSchema = new mongoose.Schema(
  {
    changeId: { type: String, required: true, unique: true },
    fieldType: {
      type: String,
      enum: ["cylinderPrice", "cylinderGst", "deliveryFee", "platformFee"],
      required: true,
    },
    category: { type: String, required: true }, // e.g. "Domestic Cylinder (14.2kg)" or "Delivery Fee"
    unit: { type: String, enum: ["currency", "percent"], default: "currency" },
    oldValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceChangeLog", priceChangeLogSchema);