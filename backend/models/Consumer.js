const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const consumerSchema = new mongoose.Schema(
  {
    consumerId: { type: String, unique: true },

    // Personal details
    name: { type: String, required: [true, "Name is required"], trim: true },
    dob: {
      type: Date,
      required: false,
      validate: {
        validator: function (value) {
          if (!value) return true;
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
      enum: ["Male", "Female", "Other"],
      required: false,
    },
    avatarUrl: { type: String, default: "https://www.vectorstock.com/royalty-free-vector/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191" },

    // Auth
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    // Contact
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

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

    // Government ID documents — completed later via admin panel, not at signup
    aadhaarNumber: {
      type: String,
      trim: true,
      match: [/^\d{12}$/, "Aadhaar number must be exactly 12 digits"],
      unique: true,
      sparse: true,
    },
    panNumber: { type: String, trim: true, uppercase: true, default: "" },
    form60Submitted: { type: Boolean, default: false },
    drivingLicenseNumber: { type: String, trim: true, default: "" },
    passportNumber: { type: String, trim: true, uppercase: true, default: "" },
    rationCardNumber: { type: String, trim: true, default: "" },
    voterIdNumber: { type: String, trim: true, default: "" },

    // LPG connection details — also completed later
    connectionType: {
      type: String,
      enum: ["Domestic", "Commercial"],
      required: false,
    },
    cylinderSize: {
      type: String,
      enum: ["14.2kg", "19kg"],
      required: false,
    },
    cylinderCount: {
      type: String,
      enum: ["Single", "Double"],
      required: false,
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

consumerSchema.pre("validate", function () {
  if (this.aadhaarNumber && !this.panNumber && !this.form60Submitted) {
    this.invalidate(
      "panNumber",
      "PAN number is required, or Form 60 must be submitted if consumer has no PAN"
    );
  }
});

consumerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

consumerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

consumerSchema.index({ name: "text", mobileNumber: "text", consumerId: "text" });

module.exports = mongoose.model("Consumer", consumerSchema);