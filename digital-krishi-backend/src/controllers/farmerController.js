const Farmer = require("../models/Farmer");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createFarmer = async (req, res) => {
  try {
    const { name, phone, password, location, crop } = req.body;

    if (!name || !phone || !password || !location || !crop) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingFarmer = await Farmer.findOne({ phone });
    if (existingFarmer) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFarmer = new Farmer({
      name,
      phone,
      password: hashedPassword,
      location,
      crop
    });

    await newFarmer.save();

    res.status(201).json({ message: "Farmer registered successfully", farmer: { name, phone, location, crop } });

  } catch (error) {
    console.error("Farmer Creation Error:", error.message);
    res.status(500).json({ message: "Error creating farmer" });
  }
};

const loginFarmer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, farmer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    farmer.lastLogin = new Date();
    farmer.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    await farmer.save();

    const token = jwt.sign(
      { id: farmer._id, phone: farmer.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location,
        crop: farmer.crop
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Error during login" });
  }
};

module.exports = { createFarmer, loginFarmer };
