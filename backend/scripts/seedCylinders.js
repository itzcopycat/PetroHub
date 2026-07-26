// Run once with: node scripts/seedCylinders.js
// Safe to re-run — uses upsert with $setOnInsert, so it will never overwrite
// stock counts for a type that already exists in the collection.
//
// TODO: replace these placeholder inStock/reorderLevel numbers with your
// actual starting stock before running this against production data.
require("dotenv").config();
const mongoose = require("mongoose");
const Cylinder = require("../models/Cylinder");

const SEED_DATA = [
  { type: "14.2kg", inStock: 100, reorderLevel: 20 },
  { type: "19kg", inStock: 40, reorderLevel: 10 },
  { type: "5kg-ftl", inStock: 30, reorderLevel: 10 },
  { type: "5kg-domestic", inStock: 30, reorderLevel: 10 },
];

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected. Seeding cylinder inventory...");

  for (const item of SEED_DATA) {
    const result = await Cylinder.findOneAndUpdate(
      { type: item.type },
      { $setOnInsert: item },
      { upsert: true, new: true, rawResult: true }
    );
    const wasInserted = !result.lastErrorObject?.updatedExisting;
    console.log(
      wasInserted
        ? `Created stock record for ${item.type} (inStock: ${item.inStock})`
        : `Stock record for ${item.type} already existed — left untouched`
    );
  }

  console.log("Done.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});