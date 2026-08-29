require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists on boot
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import Routes
const askRoutes = require("./src/routes/askRoutes");
const farmerRoutes = require("./src/routes/farmerRoutes");
const officerRoutes = require("./src/routes/officerRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const imageRoutes = require("./src/routes/imageRoutes");
const historyRoutes = require("./src/routes/historyRoutes");
const alertRoutes = require("./src/routes/alertRoutes");
const riskRoutes = require("./src/routes/riskRoutes");
const mlRoutes = require("./src/routes/mlRoutes");
const ttsRoutes = require("./src/routes/ttsRoutes");
const calendarRoutes = require("./src/routes/calendarRoutes");
const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const weatherRoutes = require("./src/routes/wheatherRoute");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const marketRoutes = require("./src/routes/marketRoutes");
const cropsRoutes = require("./src/routes/cropsRoutes");
const tasksRoutes = require("./src/routes/tasksRoutes");
const alertsRoutes = require("./src/routes/alertsRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const schemesRoutes = require("./src/routes/schemesRoutes");

// Initialize Express
const app = express();

// Trust reverse proxies (Render, AWS, Vercel)
app.set("trust proxy", 1);

// Configure CORS for production and development
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or matching origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".netlify.app") || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for seamless farmer access
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Serve uploads directory statically for images and audio files
app.use("/uploads", express.static(uploadsDir));

// Health Check Endpoints (For Render Uptime & Production Monitoring)
const healthHandler = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    service: "Kisan Setu Production Backend",
    database: dbStatus,
    databaseName: mongoose.connection.name || null,
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString()
  });
};

app.get("/", healthHandler);
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", officerRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", imageRoutes);
app.use("/api", historyRoutes);
app.use("/api", alertRoutes);
app.use("/api", riskRoutes);
app.use("/api", mlRoutes);
app.use("/api", ttsRoutes);
app.use("/api", calendarRoutes);
app.use("/api", askRoutes);
app.use("/api", farmerRoutes);
app.use("/api", profileRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/market", marketRoutes);
app.use("/api", cropsRoutes);
app.use("/api", tasksRoutes);
app.use("/api", alertsRoutes);
app.use("/api", schemesRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Application Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// MongoDB Connection
mongoose.set("bufferCommands", false);

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (mongoUri) {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
      console.log("📂 Connected Database:", mongoose.connection.name);
    })
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
    });
} else {
  console.warn("⚠️ MONGO_URI is not defined. Please configure MONGO_URI in your environment.");
}

const { verifyEmailConfig } = require("./src/services/emailService");

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Kisan Setu Server running on port ${PORT}`);
  // Diagnostic SMTP verification without printing secrets
  verifyEmailConfig().catch(err => {
    console.error("⚠️ SMTP verification warning:", err.message);
  });
});

