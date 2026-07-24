const jwt = require("jsonwebtoken");

// Verifies a consumer's JWT (issued by /api/consumers/login or /register)
// and attaches the decoded payload as req.consumer ({ id, consumerId }).
// Kept separate from ../middleware/auth.js (admin) to avoid ambiguity about
// who is making the request, even though both use the same JWT_SECRET.
function consumerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.consumer = decoded; // { id, consumerId }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = consumerAuth;