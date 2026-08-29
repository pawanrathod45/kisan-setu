const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Profile get error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const allowedUpdates = [
      'name',
      'phone',
      'location',
      'district',
      'taluka',
      'village',
      'crop',
      'crops',
      'landArea',
      'farmerCategory',
      'hasIrrigation',
      'irrigationSource',
      'farmingType',
      'profileImage',
      'notificationsEnabled',
      'darkMode',
      'language',
      'bio'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getTip = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = userId ? await User.findById(userId) : null;
    const crop = (user && user.crop) || req.query.crop || 'general';

    const tips = {
      wheat: 'For wheat, ensure timely irrigation during tillering and avoid water stress at booting stage.',
      paddy: 'Paddy needs standing water during early vegetative growth; monitor for pests during flowering.',
      rice: 'Maintain 2-3 inches of water in the field during tillering. Apply nitrogen in split doses for better yield.',
      cotton: 'Monitor for bollworms and consider pheromone traps; ensure balanced NPK fertilization.',
      sugarcane: 'Use organic matter and balanced fertilizers; ratoon management improves yields.',
      maize: 'Apply nitrogen fertilizer when plants are knee-high. Ensure proper spacing for better air circulation.',
      soybean: 'Inoculate seeds with Rhizobium for better nitrogen fixation. Avoid waterlogging.',
      tomato: 'Stake plants early and prune suckers. Water consistently to prevent blossom end rot.',
      potato: 'Hill soil around plants as they grow. Harvest when foliage dies back naturally.',
      onion: 'Stop watering 2 weeks before harvest. Cure bulbs in shade before storage.',
    };

    const key = crop.toLowerCase();
    const tip = tips[key] || `Keep soil moisture optimal and monitor for pests regularly for ${crop}. Practice crop rotation for better soil health.`;

    res.json({ crop, tip });
  } catch (err) {
    console.error('Tip error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.uploadResponse = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Upload response error:', err);
    res.status(500).json({ message: err.message });
  }
};