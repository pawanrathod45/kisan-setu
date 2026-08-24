const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kisan_setu_jwt_super_secret_key_2026";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

module.exports = authMiddleware;
