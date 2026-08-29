require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ No MONGO_URI provided in environment");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB for Admin Verification");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@kisansetu.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.log("ℹ️ No ADMIN_PASSWORD provided in environment. Skipping admin seed.");
      process.exit(0);
    }

    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (admin) {
      admin.role = "admin";
      admin.status = "active";
      admin.isEmailVerified = true;
      admin.password = hashedPassword;
      await admin.save();
      console.log("👑 Existing Admin account verified and updated successfully.");
    } else {
      admin = new User({
        name: "Kisan Setu Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isEmailVerified: true,
        location: "Kisan Setu Command Center",
        crop: "Precision Agriculture",
        farmingType: "organic"
      });
      await admin.save();
      console.log("👑 New Admin account created successfully.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Admin Setup Error:", err);
    process.exit(1);
  }
};

seedAdmin();
