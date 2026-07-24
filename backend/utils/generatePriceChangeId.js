const PriceChangeLog = require("../models/PriceChangeLog");

async function generatePriceChangeId() {
  const last = await PriceChangeLog.findOne().sort({ createdAt: -1 });

  let nextNum = 2026001;
  if (last?.changeId) {
    const match = last.changeId.match(/\d+/);
    if (match) nextNum = parseInt(match[0], 10) + 1;
  }

  return `PR${nextNum}`;
}

module.exports = generatePriceChangeId;