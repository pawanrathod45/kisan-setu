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
    console.log("✅ Connected to MongoDB for Admin Setup");

    const adminPhone = "9999999999";
    const adminEmail = "admin@kisansetu.com";
    const adminPassword = "AdminPassword@123";

    let admin = await User.findOne({ $or: [{ phone: adminPhone }, { email: adminEmail }] });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (admin) {
      admin.role = "admin";
      admin.status = "active";
      admin.isEmailVerified = true;
      admin.password = hashedPassword;
      admin.name = "Kisan Setu Super Admin";
      await admin.save();
      console.log("👑 Existing user promoted to Admin successfully!");
    } else {
      admin = new User({
        name: "Kisan Setu Super Admin",
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isEmailVerified: true,
        location: "Kisan Setu Command Center, Pune",
        crop: "Precision Agriculture",
        farmingType: "organic"
      });
      await admin.save();
      console.log("👑 New Admin account created successfully!");
    }

    // Seed / Ensure Demo Farmer Account
    const farmerEmail = "farmer.demo@kisansetu.com";
    const farmerPassword = "password123";
    const farmerHash = await bcrypt.hash(farmerPassword, 10);

    let farmer = await User.findOne({ email: farmerEmail });
    if (farmer) {
      farmer.password = farmerHash;
      farmer.isEmailVerified = true;
      farmer.status = "active";
      await farmer.save();
      console.log("👨‍🌾 Existing Demo Farmer account updated successfully!");
    } else {
      farmer = new User({
        name: "Ramesh Patil (Demo Farmer)",
        email: farmerEmail,
        password: farmerHash,
        role: "farmer",
        status: "active",
        isEmailVerified: true,
        location: "Pune, Maharashtra",
        crop: "Wheat (गेहूं)",
        farmingType: "traditional"
      });
      await farmer.save();
      console.log("👨‍🌾 New Demo Farmer account created successfully!");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 CREDENTIALS CREATED & VERIFIED IN MONGODB:");
    console.log(`👑 ADMIN:  ${adminEmail}  | Password: ${adminPassword}`);
    console.log(`👨‍🌾 FARMER: ${farmerEmail} | Password: ${farmerPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (err) {
    console.error("❌ Admin Setup Error:", err);
    process.exit(1);
  }
};

seedAdmin();
