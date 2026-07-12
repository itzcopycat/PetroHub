const express = require("express");
const router = express.Router();
const Consumer = require("../models/Consumer");
const authMiddleware = require("../middleware/auth");
const generateConsumerId = require("../utils/generateConsumerId");

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

module.exports = router;