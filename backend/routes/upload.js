const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({ avatarUrl });
  }
);

// Handle Multer errors (file too large, wrong type) cleanly
router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;