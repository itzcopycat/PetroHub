const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
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

// PATCH - update avatar, name, and/or email
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {};
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;
    if (req.body.name !== undefined) updates.name = req.body.name;

    if (req.body.email !== undefined) {
      const email = req.body.email.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      updates.email = email; // schema lowercases/trims on save
    }

    const admin = await Admin.findByIdAndUpdate(req.admin.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "An admin with this email already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/admin/change-password
router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "New password must be different from the current password" });
    }

    // Admin.password has no `select: false`, so it's included by default here.
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
});

module.exports = router;