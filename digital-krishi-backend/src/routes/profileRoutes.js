const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getTip,
  uploadResponse,
} = require('../controllers/profileController');

// Configure storage for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// GET profile
router.get('/profile', authMiddleware, getProfile);

// PUT profile
router.put('/profile', authMiddleware, updateProfile);

// GET tip
router.get('/profile/tip', authMiddleware, getTip);

// Upload image
router.post('/profile/upload', authMiddleware, upload.single('image'), uploadResponse);

module.exports = router;
