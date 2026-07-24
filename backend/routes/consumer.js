const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Consumer = require("../models/Consumer");
const authMiddleware = require("../middleware/auth");
const generateConsumerId = require("../utils/generateConsumerId");

const JWT_SECRET = process.env.JWT_SECRET;

function signToken(consumer) {
  return jwt.sign(
    { id: consumer._id, consumerId: consumer.consumerId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ================= PUBLIC: Consumer Register =================
// POST /api/consumers/register
router.post("/register", async (req, res) => {
  try {
    const { name, gender, dob, email, mobileNumber, password, address } = req.body;

    if (!name || !gender || !dob || !email || !mobileNumber || !password || !address || !address.district) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const consumerId = await generateConsumerId();

    const consumer = await Consumer.create({
      name,
      gender,
      dob,
      email,
      mobileNumber,
      password,
      address,
      consumerId,
    });

    const token = signToken(consumer);

    res.status(201).json({
      token,
      consumer: {
        id: consumer._id,
        consumerId: consumer.consumerId,
        name: consumer.name,
        gender: consumer.gender,
        dob: consumer.dob,
        email: consumer.email,
        mobileNumber: consumer.mobileNumber,
        address: consumer.address,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `An account with this ${field} already exists.` });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= PUBLIC: Consumer Login =================
// POST /api/consumers/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const consumer = await Consumer.findOne({ email }).select("+password");

    if (!consumer) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await consumer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(consumer);

    res.json({
      token,
      consumer: {
        id: consumer._id,
        consumerId: consumer.consumerId,
        name: consumer.name,
        gender: consumer.gender,
        dob: consumer.dob,
        email: consumer.email,
        mobileNumber: consumer.mobileNumber,
        address: consumer.address,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// ================= ADMIN ROUTES (unchanged, still protected) =================

router.get("/", authMiddleware, async (req, res) => {
  const consumers = await Consumer.find().sort({ createdAt: -1 });
  res.json({ consumers });
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const consumerId = await generateConsumerId();

    const consumer = await Consumer.create({
      ...req.body,
      consumerId,
      createdBy: req.admin?.id,
    });

    res.status(201).json({ consumer });
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  const consumer = await Consumer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!consumer) return res.status(404).json({ message: "Consumer not found" });
  res.json({ consumer });
});

// routes/consumers.js — add this with the other admin routes,
// before module.exports

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    res.json({ consumer });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid consumer ID" });
    }
    res.status(500).json({ message: "Failed to fetch consumer" });
  }
});

module.exports = router;