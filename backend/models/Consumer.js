const mongoose = require("mongoose");

const consumerSchema = new mongoose.Schema(
  {
    consumerId: { type: String, unique: true },

    // Personal details
    name: { type: String, required: [true, "Name is required"], trim: true },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value) {
          if (!value) return false;
          const today = new Date();
          let age = today.getFullYear() - value.getFullYear();
          const monthDiff = today.getMonth() - value.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < value.getDate())
          ) {
            age--;
          }
          return age >= 18;
        },
        message: "Consumer must be at least 18 years old",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender is required",
      },
      required: [true, "Gender is required"],
    },
    avatarUrl: { type: String, default: "" },

    // Contact
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    email: { type: String, trim: true, lowercase: true, default: "" },

    // Address
    address: {
      line1: { type: String, required: [true, "Address line 1 is required"] },
      line2: { type: String, default: "" },
      district: { type: String, required: [true, "District is required"] },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, required: [true, "State is required"] },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
      },
    },

    // Government ID documents
    aadhaarNumber: {
      type: String,
      required: [true, "Aadhaar number is mandatory"],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhaar number must be exactly 12 digits"],
    },
    panNumber: { type: String, trim: true, uppercase: true, default: "" },
    form60Submitted: { type: Boolean, default: false },
    drivingLicenseNumber: { type: String, trim: true, default: "" },
    passportNumber: { type: String, trim: true, uppercase: true, default: "" },
    rationCardNumber: { type: String, trim: true, default: "" },
    voterIdNumber: { type: String, trim: true, default: "" },

    // LPG connection details
    connectionType: {
      type: String,
      enum: {
        values: ["Domestic", "Commercial"],
        message: "Connection type is required",
      },
      required: [true, "Connection type is required"],
    },
    cylinderSize: {
      type: String,
      enum: {
        values: ["14.2kg", "19kg", "5kg"],
        message: "Cylinder size is required",
      },
      required: [true, "Cylinder size is required"],
    },
    cylinderCount: {
      type: String,
      enum: {
        values: ["Single", "Double"],
        message: "Cylinder count is required",
      },
      required: [true, "Cylinder count is required"],
    },
    subsidyEligible: { type: Boolean, default: true },
    kycVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["Active", "Pending", "Suspended"],
      default: "Pending",
    },

    joinedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// Enforce: either PAN is provided OR Form 60 is marked submitted
consumerSchema.pre("validate", function () {
  if (!this.panNumber && !this.form60Submitted) {
    this.invalidate(
      "panNumber",
      "PAN number is required, or Form 60 must be submitted if consumer has no PAN"
    );
  }
});

consumerSchema.index({ name: "text", mobileNumber: "text", consumerId: "text" });

module.exports = mongoose.model("Consumer", consumerSchema);