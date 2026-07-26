const PricingSettings = require("../models/PricingSettings");

const CYLINDER_LABELS = {
  "5kg-domestic": "Mini Domestic Cylinder",
  "14.2kg": "Domestic Cylinder",
  "19kg": "Commercial Cylinder",
  "5kg-ftl": "Free Trade LPG (FTL) Mini Cylinder",
};

// Full defaults for every expected category — used both to create the
// settings doc from scratch AND to backfill anything missing on an
// existing (possibly legacy) doc. Placeholder values, adjust freely.
const CYLINDER_DEFAULTS = {
  "5kg-domestic": {
    cylinderType: "5kg-domestic",
    label: CYLINDER_LABELS["5kg-domestic"],
    price: 450,
    gstRatePercent: 5,
    primaryUsage: "Small household cooking",
    addressProofRequired: true,
  },
  "14.2kg": {
    cylinderType: "14.2kg",
    label: CYLINDER_LABELS["14.2kg"],
    price: 850,
    gstRatePercent: 5,
    primaryUsage: "Household cooking",
    addressProofRequired: true,
  },
  "19kg": {
    cylinderType: "19kg",
    label: CYLINDER_LABELS["19kg"],
    price: 1750,
    gstRatePercent: 18,
    primaryUsage: "Hotels and industries",
    addressProofRequired: true,
  },
  "5kg-ftl": {
    // Placeholder price — FTL cylinders are typically priced closer to
    // market rate (no subsidy), adjust to your real launch number.
    cylinderType: "5kg-ftl",
    label: CYLINDER_LABELS["5kg-ftl"],
    price: 475,
    gstRatePercent: 18,
    primaryUsage: "Migrants and street vendors",
    addressProofRequired: false,
  },
};

// Reconciles an existing settings doc against the current 4-category
// schema, in place. Handles the specific migration from the old 3-category
// shape (plain "5kg", no gstRatePercent/primaryUsage/addressProofRequired):
//   1. A legacy "5kg" entry is renamed to "5kg-domestic" (keeps its price).
//   2. Any entry missing gstRatePercent/label/primaryUsage/addressProofRequired
//      gets those fields backfilled from defaults, without touching its price.
//   3. Any category with no entry at all (e.g. "5kg-ftl" never existed) gets
//      a brand new default entry appended.
// Returns true if anything changed (caller should settings.save()).
function migrateSettings(settings) {
  let changed = false;

  // Step 1: rename legacy plain "5kg" -> "5kg-domestic"
  const legacyEntry = settings.cylinderPrices.find((c) => c.cylinderType === "5kg");
  if (legacyEntry) {
    legacyEntry.cylinderType = "5kg-domestic";
    changed = true;
  }

  // Step 2: backfill missing fields on existing entries, add missing categories
  for (const type of Object.keys(CYLINDER_DEFAULTS)) {
    const defaults = CYLINDER_DEFAULTS[type];
    const entry = settings.cylinderPrices.find((c) => c.cylinderType === type);

    if (!entry) {
      settings.cylinderPrices.push({ ...defaults });
      changed = true;
      continue;
    }

    if (entry.gstRatePercent === undefined || entry.gstRatePercent === null) {
      entry.gstRatePercent = defaults.gstRatePercent;
      changed = true;
    }
    if (!entry.primaryUsage) {
      entry.primaryUsage = defaults.primaryUsage;
      changed = true;
    }
    if (entry.addressProofRequired === undefined || entry.addressProofRequired === null) {
      entry.addressProofRequired = defaults.addressProofRequired;
      changed = true;
    }
    if (!entry.label) {
      entry.label = defaults.label;
      changed = true;
    }
    // Deliberately NOT touching entry.price here — admin-set prices are
    // real data and must never be silently overwritten by defaults.
  }

  if (changed) {
    settings.markModified("cylinderPrices");
  }

  return changed;
}

// Creates the one-and-only settings doc the first time this is ever called,
// and self-heals it against the current schema on every subsequent call —
// so an older doc (e.g. from before the FTL category existed) gets upgraded
// automatically instead of silently returning incomplete data.
async function getOrCreateSettings() {
  let settings = await PricingSettings.findOne({ singletonKey: "default" });

  if (!settings) {
    settings = await PricingSettings.create({
      singletonKey: "default",
      cylinderPrices: Object.values(CYLINDER_DEFAULTS),
      deliveryFee: { value: 30 },
      platformFee: { value: 10 },
    });
    return settings;
  }

  if (migrateSettings(settings)) {
    await settings.save();
  }

  return settings;
}

// Computes a full price snapshot for one booking, using whatever pricing
// is currently active. Delivery fee and platform fee are treated as flat
// per-order charges (not multiplied by quantity); cylinder price and GST
// scale with quantity. GST rate comes from the specific cylinder type, not
// a global rate. Called once at booking creation time — the result is
// stored on the booking so it doesn't change if admin edits pricing later.
function computePriceBreakup(settings, cylinderType, quantity) {
  const cylinderEntry = settings.cylinderPrices.find(
    (c) => c.cylinderType === cylinderType
  );
  const cylinderUnitPrice = cylinderEntry ? cylinderEntry.price : 0;
  const gstRatePercent = cylinderEntry ? cylinderEntry.gstRatePercent : 0;
  const qty = quantity || 1;

  const cylinderPrice = cylinderUnitPrice * qty;
  const deliveryFee = settings.deliveryFee.value;
  const platformFee = settings.platformFee.value;
  const taxAmount = Math.round(cylinderPrice * (gstRatePercent / 100));
  const total = cylinderPrice + deliveryFee + platformFee + taxAmount;

  return {
    cylinderUnitPrice,
    cylinderPrice,
    deliveryFee,
    platformFee,
    taxRatePercent: gstRatePercent,
    taxAmount,
    total,
  };
}

module.exports = { getOrCreateSettings, computePriceBreakup, CYLINDER_LABELS };