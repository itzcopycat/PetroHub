const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Consumer = require("../models/Consumer");
const generateConsumerId = require("../utils/generateConsumerId");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

function signToken(consumer) {
  return jwt.sign(
    { id: consumer._id, consumerId: consumer.consumerId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobileNumber, password, address } = req.body;

    if (!name || !email || !mobileNumber || !password || !address) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const consumerId = await generateConsumerId();

    const consumer = await Consumer.create({
      name,
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
        email: consumer.email,
        mobileNumber: consumer.mobileNumber,
        address: consumer.address,
      },
    });
  } catch (err) {
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

// ================= LOGIN =================
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
        email: consumer.email,
        mobileNumber: consumer.mobileNumber,
        address: consumer.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;