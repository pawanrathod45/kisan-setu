require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

// ✅ NEW: Weather Route
const weatherRoutes = require("./src/routes/wheatherRoute");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const marketRoutes = require("./src/routes/marketRoutes");
const cropsRoutes = require("./src/routes/cropsRoutes");
const tasksRoutes = require("./src/routes/tasksRoutes");
const alertsRoutes = require("./src/routes/alertsRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploads directory for profile images and others
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
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
// Profile routes (get/update/profile image)
app.use('/api', profileRoutes);

// ✅ Weather API Route (IMPORTANT)
app.use("/api/weather", weatherRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/market", marketRoutes);
app.use("/api", cropsRoutes);
app.use("/api", tasksRoutes);
app.use("/api", alertsRoutes);

// MongoDB Connection
mongoose.set("bufferCommands", false);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log("📂 Connected Database:", mongoose.connection.name);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("🌾 Digital Krishi Officer Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
