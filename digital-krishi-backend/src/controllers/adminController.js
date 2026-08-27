const mongoose = require("mongoose");
const User = require("../models/User");
const Crop = require("../models/Crop");
const Alert = require("../models/Alert");
const Task = require("../models/Task");
const Market = require("../models/Market");
const Query = require("../models/Query");

// 1. REAL-TIME DASHBOARD AGGREGATED STATISTICS
exports.getDashboardStats = async (req, res) => {
  try {
    // Real Counts from MongoDB
    const [
      totalUsers,
      totalFarmers,
      totalOfficers,
      totalAdmins,
      activeUsers,
      suspendedUsers,
      totalCrops,
      totalAlerts,
      unreadAlerts,
      totalTasks,
      completedTasks,
      totalQueries
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "suspended" }),
      Crop.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ read: false }),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Query.countDocuments()
    ]);

    // Total Land Area across all registered crops
    const areaAgg = await Crop.aggregate([
      {
        $group: {
          _id: null,
          totalArea: { $sum: "$area" }
        }
      }
    ]);
    const totalAcreage = areaAgg.length > 0 ? areaAgg[0].totalArea : 0;

    // Crop Health Breakdown (Healthy, Mild Infection, Infected, Critical)
    const cropHealthStats = await Crop.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$healthStatus", "Healthy"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Top Cultivated Crops in Database
    const topCrops = await Crop.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          totalArea: { $sum: "$area" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // User Registrations Timeline (Grouped by Date)
    const registrationTimeline = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // Real Recent Registrations
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Agricultural Alerts
    const recentAlerts = await Alert.find()
      .populate("userId", "name phone location")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalFarmers,
          totalOfficers,
          totalAdmins,
          activeUsers,
          suspendedUsers,
          totalCrops,
          totalAcreage,
          totalAlerts,
          unreadAlerts,
          totalTasks,
          completedTasks,
          totalQueries,
          dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
        },
        cropHealthStats,
        topCrops,
        registrationTimeline,
        recentUsers,
        recentAlerts
      }
    });
  } catch (err) {
    console.error("❌ Admin Dashboard Stats Error:", err);
    res.status(500).json({ message: "Failed to compute dashboard statistics", error: err.message });
  }
};

// 2. PAGINATED USER MANAGEMENT WITH SEARCH & FILTERS
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, role, status, verified, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (verified && verified !== "all") {
      filter.isEmailVerified = verified === "true";
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { location: searchRegex },
        { crop: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit) || 1
      }
    });
  } catch (err) {
    console.error("❌ Admin Get Users Error:", err);
    res.status(500).json({ message: "Failed to retrieve user directory", error: err.message });
  }
};

// 3. GET SINGLE USER COMPLETE AUDIT DOSSIER
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [crops, tasks, alerts] = await Promise.all([
      Crop.find({ userId: user._id }).sort({ createdAt: -1 }),
      Task.find({ userId: user._id }).sort({ createdAt: -1 }),
      Alert.find({ userId: user._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      user,
      crops,
      tasks,
      alerts
    });
  } catch (err) {
    console.error("❌ Admin Get User By ID Error:", err);
    res.status(500).json({ message: "Failed to retrieve user details", error: err.message });
  }
};

// 4. UPDATE USER STATUS (ACTIVE, SUSPENDED, INACTIVE)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be active, suspended, or inactive." });
    }

    // Protect self-suspension
    if (req.adminUser && req.adminUser._id.toString() === id && status !== "active") {
      return res.status(400).json({ message: "Administrators cannot suspend their own account." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`🛡️ Admin [${req.adminUser?.name || "Admin"}] updated User [${user.name}] status to: ${status}`);

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (err) {
    console.error("❌ Admin Update User Status Error:", err);
    res.status(500).json({ message: "Failed to update user status", error: err.message });
  }
};

// 5. UPDATE USER ROLE (FARMER, OFFICER, ADMIN)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["farmer", "officer", "agent", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`🛡️ Admin [${req.adminUser?.name || "Admin"}] updated User [${user.name}] role to: ${role}`);

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (err) {
    console.error("❌ Admin Update User Role Error:", err);
    res.status(500).json({ message: "Failed to update user role", error: err.message });
  }
};

// 6. REAL AGRICULTURAL MONITORING: CROPS OVERVIEW
exports.getCropsOverview = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { healthStatus, search } = req.query;

    const filter = {};
    if (healthStatus && healthStatus !== "all") {
      filter.healthStatus = healthStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { variety: searchRegex },
        { diseaseDetected: searchRegex }
      ];
    }

    const [totalCrops, crops] = await Promise.all([
      Crop.countDocuments(filter),
      Crop.find(filter)
        .populate("userId", "name phone location crop")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      success: true,
      crops,
      pagination: {
        totalCrops,
        page,
        limit,
        totalPages: Math.ceil(totalCrops / limit) || 1
      }
    });
  } catch (err) {
    console.error("❌ Admin Get Crops Error:", err);
    res.status(500).json({ message: "Failed to retrieve crops list", error: err.message });
  }
};

// 7. SYSTEM ALERTS DIRECTORY
exports.getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, severity } = req.query;

    const filter = {};
    if (type && type !== "all") filter.type = type;
    if (severity && severity !== "all") filter.severity = severity;

    const [totalAlerts, alerts] = await Promise.all([
      Alert.countDocuments(filter),
      Alert.find(filter)
        .populate("userId", "name phone location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      success: true,
      alerts,
      pagination: {
        totalAlerts,
        page,
        limit,
        totalPages: Math.ceil(totalAlerts / limit) || 1
      }
    });
  } catch (err) {
    console.error("❌ Admin Get Alerts Error:", err);
    res.status(500).json({ message: "Failed to fetch alerts", error: err.message });
  }
};

// 8. BROADCAST REAL NOTIFICATION ALERT TO FARMERS IN MONGODB
exports.createBroadcastAlert = async (req, res) => {
  try {
    const { message, type = "general", severity = "medium", targetRole = "farmer" } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Alert broadcast message is required" });
    }

    const queryFilter = targetRole === "all" ? {} : { role: targetRole };
    const targetUsers = await User.find(queryFilter).select("_id");

    if (targetUsers.length === 0) {
      return res.status(400).json({ message: "No recipient users found for selected role" });
    }

    const alertDocuments = targetUsers.map(u => ({
      userId: u._id,
      message: message.trim(),
      type,
      severity,
      read: false
    }));

    await Alert.insertMany(alertDocuments);

    console.log(`📢 Admin broadcast alert dispatched to ${targetUsers.length} users.`);

    res.status(201).json({
      success: true,
      message: `Alert broadcast successfully delivered to ${targetUsers.length} users.`,
      dispatchedCount: targetUsers.length
    });
  } catch (err) {
    console.error("❌ Admin Broadcast Alert Error:", err);
    res.status(500).json({ message: "Failed to broadcast alert", error: err.message });
  }
};

// 9. DELETE ALERT
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid alert ID format" });
    }

    const alert = await Alert.findByIdAndDelete(id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ success: true, message: "Alert removed successfully" });
  } catch (err) {
    console.error("❌ Admin Delete Alert Error:", err);
    res.status(500).json({ message: "Failed to delete alert", error: err.message });
  }
};

// 10. REAL SYSTEM HEALTH & DATABASE DIAGNOSTICS
exports.getSystemHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting"
    };

    const [userCount, cropCount, alertCount, taskCount, marketCount, queryCount] = await Promise.all([
      User.countDocuments(),
      Crop.countDocuments(),
      Alert.countDocuments(),
      Task.countDocuments(),
      Market.countDocuments(),
      Query.countDocuments()
    ]);

    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      system: {
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "production",
        memory: {
          heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2)
        }
      },
      database: {
        status: dbStateMap[dbState] || "Unknown",
        databaseName: mongoose.connection.name || "kisan_setu",
        host: mongoose.connection.host || "MongoDB Cloud Cluster",
        collections: {
          users: userCount,
          crops: cropCount,
          alerts: alertCount,
          tasks: taskCount,
          markets: marketCount,
          queries: queryCount
        }
      }
    });
  } catch (err) {
    console.error("❌ Admin System Health Error:", err);
    res.status(500).json({ message: "Failed to retrieve system health metrics", error: err.message });
  }
};

// 11. COMPREHENSIVE REPORTS & AUDIT ANALYTICS (REAL DATABASE AGGREGATIONS)
exports.getReportsAndAnalytics = async (req, res) => {
  try {
    const { range = "30d" } = req.query;

    let dateMatch = {};
    const now = Date.now();
    if (range === "7d") {
      dateMatch = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === "30d") {
      dateMatch = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    } else if (range === "90d") {
      dateMatch = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
    } else if (range === "180d") {
      dateMatch = { createdAt: { $gte: new Date(now - 180 * 24 * 60 * 60 * 1000) } };
    } else if (range === "1y") {
      dateMatch = { createdAt: { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) } };
    }

    const [
      totalUsers,
      verifiedUsersCount,
      unverifiedUsersCount,
      activeUsersCount,
      suspendedUsersCount,
      periodNewUsers,
      totalCropsCount,
      totalAlertsCount,
      totalTasksCount
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      User.countDocuments({ isEmailVerified: true }).catch(() => 0),
      User.countDocuments({ isEmailVerified: false }).catch(() => 0),
      User.countDocuments({ status: "active" }).catch(() => 0),
      User.countDocuments({ status: "suspended" }).catch(() => 0),
      User.countDocuments(dateMatch).catch(() => 0),
      Crop.countDocuments().catch(() => 0),
      Alert.countDocuments().catch(() => 0),
      Task.countDocuments().catch(() => 0)
    ]);

    // Role breakdown
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$role", "farmer"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).catch(() => []);

    // Registration growth timeline (Daily within selected date range)
    const userGrowthPipeline = [
      ...(Object.keys(dateMatch).length > 0 ? [{ $match: dateMatch }] : []),
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          registrations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 31 }
    ];
    const userGrowth = await User.aggregate(userGrowthPipeline).catch(() => []);

    // Regional distribution (Locations)
    const regionalDistribution = await User.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$location", "Maharashtra, India"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]).catch(() => []);

    // Crop Distribution & Acreage
    const cropDistribution = await Crop.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$name", "General Crop"] },
          totalPlots: { $sum: 1 },
          totalAcreage: { $sum: { $ifNull: ["$area", 0] } }
        }
      },
      { $sort: { totalPlots: -1 } },
      { $limit: 8 }
    ]).catch(() => []);

    // Alert Severity Distribution
    const alertSeverityStats = await Alert.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$severity", "medium"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).catch(() => []);

    // Recent System Audit Activity (Latest 8 user signups & status updates)
    const recentAuditActivity = await User.find()
      .select("name email role status isEmailVerified createdAt lastLogin")
      .sort({ updatedAt: -1 })
      .limit(8)
      .catch(() => []);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          verifiedUsersCount,
          unverifiedUsersCount,
          verificationRate: totalUsers > 0 ? ((verifiedUsersCount / totalUsers) * 100).toFixed(1) : 0,
          activeUsersCount,
          suspendedUsersCount,
          periodNewUsers,
          totalCropsCount,
          totalAlertsCount,
          totalTasksCount,
          dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
          range
        },
        roleStats,
        userGrowth,
        regionalDistribution,
        cropDistribution,
        alertSeverityStats,
        recentAuditActivity
      }
    });
  } catch (err) {
    console.error("❌ Admin Reports & Analytics Error:", err);
    res.status(500).json({ message: "Failed to generate analytics reports", error: err.message });
  }
};


