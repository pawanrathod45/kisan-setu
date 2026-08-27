const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Role check from token payload
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Administrator privileges required.",
        requiredRole: "admin",
        userRole: req.user.role
      });
    }

    // Database verification to ensure user hasn't been revoked or suspended
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Administrator account not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "User is no longer an administrator" });
    }

    if (user.status === "suspended" || user.status === "inactive") {
      return res.status(403).json({ message: "Administrator account is suspended or inactive" });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    console.error("❌ Admin authorization error:", err);
    return res.status(500).json({ message: "Internal authorization check error" });
  }
};

module.exports = adminMiddleware;
