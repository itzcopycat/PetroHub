const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },

    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consumer",
      required: true,
    },
    consumerName: { type: String, required: true },
    phone: { type: String, required: true },

    cylinderType: {
      type: String,
      enum: ["14.2kg", "19kg", "5kg"],
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },

    bookingDate: { type: Date, default: Date.now },
    deliveryAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Cancelled"],
      default: "Pending",
    },

    price: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded"],
      default: "Unpaid",
    },
    assignedDeliveryAgent: { type: String, default: "" },
    deliveredAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ consumerName: "text", phone: "text", bookingId: "text" });
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
