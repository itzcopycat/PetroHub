const express = require("express");
const router = express.Router();
const Cylinder = require("../models/Cylinder");
const RestockRequest = require("../models/RestockRequest");
const authMiddleware = require("../middleware/auth");

// Display-only metadata (label/weight/icon) for each cylinder type. Add an
// entry here whenever a new cylinderType is introduced elsewhere in the app.
const CYLINDER_META = {
  "14.2kg": { label: "Domestic Cylinder", weight: "14.2 kg", icon: "bi-fire" },
  "19kg": { label: "Commercial Cylinder", weight: "19 kg", icon: "bi-building" },
  "5kg-ftl": { label: "Mini Cylinder (FTL)", weight: "5 kg", icon: "bi-droplet-half" },
  "5kg-domestic": { label: "Mini Cylinder (Domestic)", weight: "5 kg", icon: "bi-droplet-half" },
};

// GET /api/inventory — current stock levels for every cylinder type
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cylinders = await Cylinder.find().sort({ type: 1 }).lean();

    const stock = cylinders.map((c) => {
      const meta = CYLINDER_META[c.type] || { label: c.type, weight: "", icon: "bi-box-seam" };
      return {
        id: c.type,
        label: meta.label,
        weight: meta.weight,
        icon: meta.icon,
        // "Total" = everything currently on hand, whether sitting in the
        // warehouse or already reserved against an unfulfilled booking.
        // Delivered/sold cylinders are intentionally excluded.
        total: c.inStock + c.reserved,
        available: c.inStock,
        reserved: c.reserved,
        sold: c.sold,
        lowStockThreshold: c.reorderLevel,
        price: c.unitCost,
      };
    });

    res.json({ stock });
  } catch (err) {
    res.status(500).json({ message: "Failed to load inventory", error: err.message });
  }
});

// GET /api/inventory/restock — restock request history, most recent first
router.get("/restock", authMiddleware, async (req, res) => {
  try {
    const requests = await RestockRequest.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to load restock history", error: err.message });
  }
});

// POST /api/inventory/restock — log a new restock request as Pending.
// Does NOT touch Cylinder stock yet — see PATCH below.
router.post("/restock", authMiddleware, async (req, res) => {
  try {
    const { cylinderType, quantity, expectedDate, notes } = req.body;

    if (!cylinderType || !quantity || !expectedDate) {
      return res
        .status(400)
        .json({ message: "Cylinder type, quantity, and expected date are required." });
    }

    const requestId = `RS${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const request = await RestockRequest.create({
      requestId,
      cylinderType,
      quantity: Number(quantity),
      expectedDate,
      notes: notes || "",
      status: "Pending",
    });

    res.status(201).json({ request });
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    res.status(500).json({ message: "Failed to create restock request", error: err.message });
  }
});

// PATCH /api/inventory/restock/:id — mark a Pending request Received
// (adds quantity to Cylinder.inStock) or Cancelled (no stock change).
router.patch("/restock/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Received", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Received' or 'Cancelled'." });
    }

    const request = await RestockRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Restock request not found" });
    }
    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `This request is already ${request.status.toLowerCase()}.` });
    }

    if (status === "Received") {
      await Cylinder.findOneAndUpdate(
        { type: request.cylinderType },
        { $inc: { inStock: request.quantity }, lastRestockedAt: new Date() },
        { upsert: true }
      );
      request.receivedAt = new Date();
    }
    request.status = status;
    await request.save();

    res.json({ request });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;