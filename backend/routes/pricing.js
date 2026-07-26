const express = require("express");
const router = express.Router();
const PriceChangeLog = require("../models/PriceChangeLog");
const authMiddleware = require("../middleware/auth");
const generatePriceChangeId = require("../utils/generatePriceChangeId");
const { getOrCreateSettings, CYLINDER_LABELS } = require("../utils/getPricingSettings");

// GET /api/pricing
router.get("/", authMiddleware, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ settings });
  } catch (err) {
    console.error("Fetch pricing error:", err);
    res.status(500).json({ message: "Failed to load pricing settings" });
  }
});

// PATCH /api/pricing/cylinder/:cylinderType
// Body may include either or both: { price, gstRatePercent }
router.patch("/cylinder/:cylinderType", authMiddleware, async (req, res) => {
  try {
    const { cylinderType } = req.params;
    const { price, gstRatePercent } = req.body;

    if (!CYLINDER_LABELS[cylinderType]) {
      return res.status(400).json({ message: "Unknown cylinder type" });
    }
    if (price === undefined && gstRatePercent === undefined) {
      return res.status(400).json({ message: "Provide a price and/or gstRatePercent to update" });
    }
    if (price !== undefined && (typeof price !== "number" || price <= 0)) {
      return res.status(400).json({ message: "A valid price is required" });
    }
    if (
      gstRatePercent !== undefined &&
      (typeof gstRatePercent !== "number" || gstRatePercent < 0)
    ) {
      return res.status(400).json({ message: "A valid GST rate is required" });
    }

    const settings = await getOrCreateSettings();
    const entry = settings.cylinderPrices.find((c) => c.cylinderType === cylinderType);
    if (!entry) {
      return res.status(404).json({ message: "Cylinder type not found in settings" });
    }

    const logs = [];

    if (price !== undefined && price !== entry.price) {
      logs.push({
        fieldType: "cylinderPrice",
        category: `${entry.label} (${cylinderType})`,
        unit: "currency",
        oldValue: entry.price,
        newValue: price,
      });
      entry.price = price;
    }

    if (gstRatePercent !== undefined && gstRatePercent !== entry.gstRatePercent) {
      logs.push({
        fieldType: "cylinderGst",
        category: `${entry.label} (${cylinderType})`,
        unit: "percent",
        oldValue: entry.gstRatePercent,
        newValue: gstRatePercent,
      });
      entry.gstRatePercent = gstRatePercent;
    }

    if (logs.length === 0) {
      return res.json({ settings });
    }

    entry.lastUpdated = new Date();
    await settings.save();

    for (const log of logs) {
      const changeId = await generatePriceChangeId();
      await PriceChangeLog.create({ ...log, changeId, changedBy: req.admin?.id });
    }

    res.json({ settings });
  } catch (err) {
    console.error("Update cylinder pricing error:", err);
    res.status(500).json({ message: "Failed to update cylinder pricing" });
  }
});

async function updateFlatField({ fieldKey, category, fieldType, req, res }) {
  const { value } = req.body;
  if (value === undefined || value === null || value < 0) {
    return res.status(400).json({ message: "A valid value is required" });
  }

  const settings = await getOrCreateSettings();
  const oldValue = settings[fieldKey].value;

  if (oldValue === value) {
    return res.json({ settings });
  }

  settings[fieldKey].value = value;
  settings[fieldKey].lastUpdated = new Date();
  await settings.save();

  const changeId = await generatePriceChangeId();
  await PriceChangeLog.create({
    changeId,
    fieldType,
    category,
    unit: "currency",
    oldValue,
    newValue: value,
    changedBy: req.admin?.id,
  });

  res.json({ settings });
}

// PATCH /api/pricing/delivery-fee
router.patch("/delivery-fee", authMiddleware, async (req, res) => {
  try {
    await updateFlatField({
      fieldKey: "deliveryFee",
      category: "Delivery Fee",
      fieldType: "deliveryFee",
      req,
      res,
    });
  } catch (err) {
    console.error("Update delivery fee error:", err);
    res.status(500).json({ message: "Failed to update delivery fee" });
  }
});

// PATCH /api/pricing/platform-fee
router.patch("/platform-fee", authMiddleware, async (req, res) => {
  try {
    await updateFlatField({
      fieldKey: "platformFee",
      category: "Platform Fee",
      fieldType: "platformFee",
      req,
      res,
    });
  } catch (err) {
    console.error("Update platform fee error:", err);
    res.status(500).json({ message: "Failed to update platform fee" });
  }
});

// GET /api/pricing/history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const logs = await PriceChangeLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ logs });
  } catch (err) {
    console.error("Fetch price history error:", err);
    res.status(500).json({ message: "Failed to load price history" });
  }
});

module.exports = router;