const mongoose = require("mongoose");

const restockRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },

    cylinderType: {
      type: String,
      enum: ["14.2kg", "19kg", "5kg", "5kg-ftl", "5kg-domestic"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    expectedDate: { type: Date, required: true },
    notes: { type: String, default: "" },

    // Stock is only added to Cylinder.inStock when this flips to "Received"
    // (see PATCH /api/inventory/restock/:id) — submitting the form alone
    // does not change stock counts, matching the original mock UI's
    // pending/received/cancelled workflow.
    status: {
      type: String,
      enum: ["Pending", "Received", "Cancelled"],
      default: "Pending",
    },
    receivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestockRequest", restockRequestSchema);