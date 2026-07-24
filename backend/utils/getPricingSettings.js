const PricingSettings = require("../models/PricingSettings");

const CYLINDER_LABELS = {
  "5kg": "Mini Cylinder",
  "14.2kg": "Domestic Cylinder",
  "19kg": "Commercial Cylinder",
};

// Creates the one-and-only settings doc the first time this is ever called.
// These starter values are placeholders — change them to your real launch
// numbers; after the first call they're just stored data, editable via
// routes/pricing.js.
async function getOrCreateSettings() {
  let settings = await PricingSettings.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await PricingSettings.create({
      singletonKey: "default",
      cylinderPrices: [
        { cylinderType: "5kg", label: CYLINDER_LABELS["5kg"], price: 450 },
        { cylinderType: "14.2kg", label: CYLINDER_LABELS["14.2kg"], price: 850 },
        { cylinderType: "19kg", label: CYLINDER_LABELS["19kg"], price: 1750 },
      ],
      deliveryFee: { value: 30 },
      platformFee: { value: 10 },
      taxRatePercent: { value: 5 },
    });
  }
  return settings;
}

// Computes a full price snapshot for one booking, using whatever pricing
// is currently active. Delivery fee and platform fee are treated as flat
// per-order charges (not multiplied by quantity); cylinder price and tax
// scale with quantity. Called once at booking creation time — the result
// is stored on the booking so it doesn't change if admin edits pricing later.
function computePriceBreakup(settings, cylinderType, quantity) {
  const cylinderEntry = settings.cylinderPrices.find(
    (c) => c.cylinderType === cylinderType
  );
  const cylinderUnitPrice = cylinderEntry ? cylinderEntry.price : 0;
  const qty = quantity || 1;

  const cylinderPrice = cylinderUnitPrice * qty;
  const deliveryFee = settings.deliveryFee.value;
  const platformFee = settings.platformFee.value;
  const taxRatePercent = settings.taxRatePercent.value;
  const taxAmount = Math.round(cylinderPrice * (taxRatePercent / 100));
  const total = cylinderPrice + deliveryFee + platformFee + taxAmount;

  return {
    cylinderUnitPrice,
    cylinderPrice,
    deliveryFee,
    platformFee,
    taxRatePercent,
    taxAmount,
    total,
  };
}

module.exports = { getOrCreateSettings, computePriceBreakup, CYLINDER_LABELS };