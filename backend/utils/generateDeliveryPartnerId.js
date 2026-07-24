const DeliveryPartner = require("../models/DeliveryPartner");

async function generateDeliveryPartnerId() {
  const last = await DeliveryPartner.findOne().sort({ createdAt: -1 });

  let nextNum = 1042; // matches the DP-1042 starting point from your mock data
  if (last?.partnerId) {
    const match = last.partnerId.match(/\d+/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }

  return `DP-${nextNum}`;
}

module.exports = generateDeliveryPartnerId;