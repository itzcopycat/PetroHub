const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/auth");

// GET current admin profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// PATCH - update avatar (or name)
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {};
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;
    if (req.body.name !== undefined) updates.name = req.body.name;

    const admin = await Admin.findByIdAndUpdate(req.admin.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;