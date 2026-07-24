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
    // Date the consumer requested delivery for (separate from bookingDate,
    // which is when the booking record was created).
    preferredDeliveryDate: { type: Date, default: null },

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

    // Kept for backward compatibility with anything reading booking.price
    // directly — always equals priceBreakup.total.
    price: { type: Number, default: 0 },

    // Snapshot of PricingSettings at the moment this booking was created.
    // Deliberately NOT a live lookup — if admin changes prices later, past
    // bookings should keep showing what the consumer was actually charged.
    priceBreakup: {
      cylinderUnitPrice: { type: Number, default: 0 },
      cylinderPrice: { type: Number, default: 0 }, // cylinderUnitPrice * quantity
      deliveryFee: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      taxRatePercent: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "UPI", "Credit / Debit Card"],
      default: "Cash on Delivery",
    },
    specialInstructions: { type: String, default: "" },

    assignedDeliveryAgent: { type: String, default: "" },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },
    deliveredAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ consumerName: "text", phone: "text", bookingId: "text" });
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;