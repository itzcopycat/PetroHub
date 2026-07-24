const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    partnerId: { type: String, unique: true },

    name: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, required: [true, "Phone number is required"], trim: true },
    area: { type: String, required: [true, "Serviceable area is required"], trim: true },

    // Max cylinders this partner can deliver in a single day
    dailyCapacity: { type: Number, required: [true, "Daily capacity is required"], min: 1 },

    // How much of today's capacity is already used up.
    // Reset lazily to 0 the next time this partner is assigned on a new day —
    // see the assign route in routes/bookings.js.
    currentLoad: { type: Number, default: 0, min: 0 },
    lastAssignedDate: { type: Date, default: null },

    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({
  name: "text",
  phone: "text",
  area: "text",
  partnerId: "text",
});

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);