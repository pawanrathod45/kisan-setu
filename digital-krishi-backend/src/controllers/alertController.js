const Alert = require("../models/Alert");

const getAlerts = async (req, res) => {
  const { farmerId } = req.params;

  const alerts = await Alert.find({ farmerId }).sort({ createdAt: -1 });

  res.json(alerts);
};

module.exports = { getAlerts };
