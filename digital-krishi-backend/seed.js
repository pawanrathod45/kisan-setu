require("dotenv").config();
const mongoose = require("mongoose");
const Alert = require("./src/models/Alert");
const Task = require("./src/models/Task");
const Market = require("./src/models/Market");
const Crop = require("./src/models/Crop");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get first user ID (you need to register first)
    const User = require("./src/models/User");
    const user = await User.findOne();
    
    if (!user) {
      console.log("❌ No user found. Please register a user first.");
      process.exit(1);
    }

    console.log(`📝 Seeding data for user: ${user.name}`);

    // Clear existing data
    await Alert.deleteMany({ userId: user._id });
    await Task.deleteMany({ userId: user._id });
    await Crop.deleteMany({ userId: user._id });
    await Market.deleteMany({});

    // Seed Crops
    await Crop.insertMany([
      {
        userId: user._id,
        name: "Wheat",
        variety: "HD-2967",
        area: 5,
        sowingDate: "2024-11-15"
      },
      {
        userId: user._id,
        name: "Cotton",
        variety: "Bt Cotton",
        area: 3,
        sowingDate: "2024-06-10"
      },
      {
        userId: user._id,
        name: "Rice",
        variety: "Basmati",
        area: 2,
        sowingDate: "2024-07-01"
      }
    ]);

    // Seed Alerts
    await Alert.insertMany([
      {
        userId: user._id,
        message: "High humidity detected - disease risk for crops",
        type: "weather",
        severity: "high"
      },
      {
        userId: user._id,
        message: "Fertilizer application recommended this week",
        type: "task",
        severity: "medium"
      },
      {
        userId: user._id,
        message: "Wheat prices increased by 12% in your region",
        type: "market",
        severity: "low"
      }
    ]);

    // Seed Tasks (today's date)
    const today = new Date().toISOString().split("T")[0];
    await Task.insertMany([
      {
        userId: user._id,
        title: "Irrigation",
        description: "Water the wheat field",
        date: today,
        category: "irrigation"
      },
      {
        userId: user._id,
        title: "Apply Fertilizer",
        description: "NPK fertilizer for cotton",
        date: today,
        category: "fertilizer"
      }
    ]);

    // Seed Market Data
    await Market.insertMany([
      {
        crop: "Wheat",
        location: "Pune",
        modalPrice: 2500,
        minPrice: 2300,
        maxPrice: 2700,
        date: today
      },
      {
        crop: "Cotton",
        location: "Pune",
        modalPrice: 6800,
        minPrice: 6500,
        maxPrice: 7100,
        date: today
      },
      {
        crop: "Rice",
        location: "Mumbai",
        modalPrice: 3200,
        minPrice: 3000,
        maxPrice: 3400,
        date: today
      }
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("📊 Created:");
    console.log("   - 3 Crops");
    console.log("   - 3 Alerts");
    console.log("   - 2 Tasks");
    console.log("   - 3 Market entries");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedData();
