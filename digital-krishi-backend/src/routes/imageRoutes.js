const express = require("express");
const router = express.Router();
const multer = require("multer");
const { analyzeImage } = require("../controllers/imageController");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// POST route
router.post(
  "/ask-with-image",
  upload.single("image"),
  analyzeImage
);

module.exports = router;
